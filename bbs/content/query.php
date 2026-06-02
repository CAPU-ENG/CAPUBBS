<?php
require_once __DIR__ . "/../lib/mainfunc.php";
require_once __DIR__ . "/../lib/mainfunc.new.php";
require_once __DIR__ . "/../lib/content_shared.php";
require_once __DIR__ . "/utils/activityService.php";
require_once __DIR__ . "/../../lib.php";

date_default_timezone_set("Asia/Shanghai");

define("CONTENT_QUERY_PAGE_SIZE", 12);

content_query_allow_localhost_cors();

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

$bid = content_query_int_param("bid", 0);
$tid = content_query_int_param("tid", 0);
$page = content_query_int_param("page", content_query_int_param("p", 1));
$author_only = content_query_bool_param("authorOnly") || content_query_bool_param("see_lz");

if ($bid <= 0 || $tid <= 0) {
    content_query_send_error(3001, "缺少帖子参数。", 400);
}

$con = dbconnect_mysqli();
if (!$con) {
    content_query_send_error(4001, "数据库连接失败。", 500);
}

$ip = isset($_SERVER["REMOTE_ADDR"]) ? $_SERVER["REMOTE_ADDR"] : "";
$token = isset($_COOKIE["token"]) ? $_COOKIE["token"] : "";
$current_username = checkUserAndSign($con, $ip, $token);
if ($current_username === null) {
    $current_username = "";
}
$viewer = content_query_get_viewer($con, $current_username);

$thread_row = content_query_get_thread($con, $bid, $tid);
if (!$thread_row) {
    content_query_send_error(2001, "主题不存在。", 404);
}

$board_row = content_query_get_board($con, $bid);
if (!$board_row) {
    content_query_send_error(2004, "版块不存在。", 404);
}

if ($bid === 1 && !$current_username) {
    content_query_send_error(1005, "本版块需要登录后才能查看。", 403);
}

content_query_record_view($con, $bid, $tid, $current_username, $ip);
$thread_row["click"] = intval($thread_row["click"]) + 1;

$total = $author_only
    ? content_query_count_author_floors($con, $bid, $tid, $thread_row["author"])
    : max(1, intval($thread_row["reply"]) + 1);
$pages = max(1, intval(ceil($total / CONTENT_QUERY_PAGE_SIZE)));
$page = max(1, min($pages, $page));

$page_rows = content_query_get_page_posts($con, $bid, $tid, $page, $author_only ? $thread_row["author"] : "");
$main_post_row = content_query_find_post_by_pid($page_rows, 1);
if (!$main_post_row) {
    $main_post_row = content_query_get_post($con, $bid, $tid, 1);
}
if (!$main_post_row) {
    content_query_send_error(2002, "主楼不存在。", 404);
}

$all_post_rows = content_query_merge_main_post($main_post_row, $page_rows);
$lzl_by_fid = content_query_get_nested_replies_by_fid($con, $all_post_rows);
$attachment_ids = content_query_collect_attachment_ids($all_post_rows);
$attachments_by_id = content_query_get_attachments_by_id($con, $attachment_ids);
$authors = content_query_collect_authors($all_post_rows, $lzl_by_fid);
$profiles_by_username = content_query_get_profiles_by_username($con, $authors);
$rights = content_query_get_board_rights($board_row, $viewer);
$favorite_count = content_query_get_favorite_count($con, $bid, $tid);
$bookmarked = $current_username ? content_query_is_favorite($con, $current_username, $bid, $tid) : false;
$activity = getActivity($bid, $tid);

$main_post = content_query_pack_floor(
    $main_post_row,
    $profiles_by_username,
    $lzl_by_fid,
    $attachments_by_id,
    $rights,
    $current_username
);

$floor_items = array();
foreach ($page_rows as $row) {
    if (intval($row["pid"]) <= 1) {
        continue;
    }
    $floor_items[] = content_query_pack_floor(
        $row,
        $profiles_by_username,
        $lzl_by_fid,
        $attachments_by_id,
        $rights,
        $current_username
    );
}

$response = array(
    "request" => array(
        "bid" => $bid,
        "tid" => $tid,
        "page" => $page,
        "authorOnly" => $author_only,
    ),
    "board" => content_query_pack_board($board_row),
    "thread" => content_query_pack_thread($thread_row, $board_row, $favorite_count, $activity),
    "mainPost" => $main_post,
    "floorsPage" => array(
        "items" => $floor_items,
        "nextCursor" => $page < $pages ? strval($page + 1) : null,
        "hasMore" => $page < $pages,
        "page" => $page,
        "pages" => $pages,
        "pageSize" => CONTENT_QUERY_PAGE_SIZE,
        "total" => $total,
        "authorOnly" => $author_only,
    ),
    "activity" => $activity,
    "viewer" => $viewer,
    "viewerState" => content_query_pack_viewer_state($thread_row, $board_row, $viewer, $rights, $bookmarked),
);

content_query_send_success($response);

function content_query_allow_localhost_cors() {
    $origin = isset($_SERVER["HTTP_ORIGIN"]) ? $_SERVER["HTTP_ORIGIN"] : "";
    if (preg_match("#^https?://localhost(:[0-9]+)?$#", $origin)) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        header("Access-Control-Allow-Credentials: true");
    }
}

function content_query_int_param($key, $default) {
    if (!isset($_REQUEST[$key]) || $_REQUEST[$key] === "") {
        return intval($default);
    }
    return intval($_REQUEST[$key]);
}

function content_query_bool_param($key) {
    if (!isset($_REQUEST[$key])) {
        return false;
    }
    $value = strtolower(strval($_REQUEST[$key]));
    return $value === "1" || $value === "true" || $value === "yes" || $value === "on";
}

function content_query_send_success($data) {
    content_query_send_json(0, "success", $data, 200);
}

function content_query_send_error($code, $message, $status) {
    content_query_send_json($code, $message, null, $status);
}

function content_query_send_json($code, $message, $data, $status) {
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    $body = array(
        "code" => $code,
        "message" => $message,
    );
    if ($data !== null) {
        $body["data"] = $data;
    }
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function content_query_get_thread($con, $bid, $tid) {
    $statement = "
        select
            threads.bid, threads.tid, threads.title, threads.author, threads.replyer,
            threads.click, threads.reply, threads.extr, threads.top, threads.locked,
            threads.timestamp, threads.postdate,
            case when thread_global_top.bid is null then 0 else 1 end as global_top,
            season_threads_activity.activity_id
        from threads
        left join thread_global_top
            on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid
        left join season_threads_activity
            on threads.bid=season_threads_activity.bid and threads.tid=season_threads_activity.tid
        where threads.bid=$bid and threads.tid=$tid
        limit 1";
    return content_query_fetch_one($con, $statement);
}

function content_query_get_board($con, $bid) {
    return content_query_fetch_one($con, "select * from boardinfo where bid=$bid limit 1");
}

function content_query_get_viewer($con, $username) {
    if (!$username) {
        return null;
    }
    $username_escaped = mysqli_real_escape_string($con, $username);
    $row = content_query_fetch_one($con, "select * from userinfo where username='$username_escaped' limit 1");
    if (!$row) {
        return null;
    }
    return content_query_pack_profile($row, true);
}

function content_query_record_view($con, $bid, $tid, $username, $ip) {
    $nowtime = time();
    $today = date("Y-m-d");
    $username_escaped = mysqli_real_escape_string($con, $username);
    $ip_escaped = mysqli_real_escape_string($con, $ip);

    if ($username !== "") {
        $statement = "update userinfo set tokentime=$nowtime, nowboard=$bid, lastip='$ip_escaped' where username='$username_escaped'";
        mysqli_query($con, $statement);
    }

    $statement = "insert ignore into username_view (username, date, bid, tid, ip)
        values ('$username_escaped', '$today', $bid, $tid, '$ip_escaped')";
    mysqli_query($con, $statement);
    mysqli_query($con, "update threads set click=click+1 where bid=$bid and tid=$tid");
}

function content_query_count_author_floors($con, $bid, $tid, $author) {
    $author_escaped = mysqli_real_escape_string($con, $author);
    $row = content_query_fetch_one($con, "select count(*) as num from posts where bid=$bid and tid=$tid and author='$author_escaped'");
    return max(1, intval($row ? $row["num"] : 1));
}

function content_query_get_page_posts($con, $bid, $tid, $page, $author) {
    $start = max(0, ($page - 1) * CONTENT_QUERY_PAGE_SIZE);
    $where_author = "";
    if ($author !== "") {
        $author_escaped = mysqli_real_escape_string($con, $author);
        $where_author = " and author='$author_escaped'";
    }
    $statement = "select * from posts where bid=$bid and tid=$tid$where_author order by pid limit $start, " . CONTENT_QUERY_PAGE_SIZE;
    return content_query_fetch_all($con, $statement);
}

function content_query_get_post($con, $bid, $tid, $pid) {
    return content_query_fetch_one($con, "select * from posts where bid=$bid and tid=$tid and pid=$pid limit 1");
}

function content_query_find_post_by_pid($rows, $pid) {
    foreach ($rows as $row) {
        if (intval($row["pid"]) === intval($pid)) {
            return $row;
        }
    }
    return null;
}

function content_query_merge_main_post($main_post_row, $page_rows) {
    $rows = array($main_post_row);
    foreach ($page_rows as $row) {
        if (intval($row["pid"]) === 1) {
            continue;
        }
        $rows[] = $row;
    }
    return $rows;
}

function content_query_get_nested_replies_by_fid($con, $post_rows) {
    $fid_values = array();
    foreach ($post_rows as $row) {
        $fid = intval($row["fid"]);
        $lzl = intval(isset($row["lzl"]) ? $row["lzl"] : 0);
        if ($fid > 0 && $lzl > 0) {
            $fid_values[$fid] = $fid;
        }
    }
    if (count($fid_values) === 0) {
        return array();
    }

    $statement = "select * from lzl where visible=1 and fid in (" . implode(",", $fid_values) . ") order by fid, id";
    $rows = content_query_fetch_all($con, $statement);
    $grouped = array();
    foreach ($rows as $row) {
        $fid = intval($row["fid"]);
        if (!isset($grouped[$fid])) {
            $grouped[$fid] = array();
        }
        $grouped[$fid][] = $row;
    }
    return $grouped;
}

function content_query_collect_attachment_ids($post_rows) {
    $ids = array();
    foreach ($post_rows as $row) {
        $parts = preg_split("/\\s+/", trim(isset($row["attachs"]) ? $row["attachs"] : ""));
        foreach ($parts as $part) {
            $id = intval($part);
            if ($id > 0) {
                $ids[$id] = $id;
            }
        }
    }
    return array_values($ids);
}

function content_query_get_attachments_by_id($con, $attachment_ids) {
    if (count($attachment_ids) === 0) {
        return array();
    }
    $statement = "select * from attachments where id in (" . implode(",", $attachment_ids) . ")";
    $rows = content_query_fetch_all($con, $statement);
    $by_id = array();
    foreach ($rows as $row) {
        $by_id[intval($row["id"])] = $row;
    }
    return $by_id;
}

function content_query_collect_authors($post_rows, $lzl_by_fid) {
    $authors = array();
    foreach ($post_rows as $row) {
        if (isset($row["author"]) && $row["author"] !== "") {
            $authors[$row["author"]] = $row["author"];
        }
    }
    foreach ($lzl_by_fid as $replies) {
        foreach ($replies as $reply) {
            if (isset($reply["author"]) && $reply["author"] !== "") {
                $authors[$reply["author"]] = $reply["author"];
            }
        }
    }
    return array_values($authors);
}

function content_query_get_profiles_by_username($con, $usernames) {
    if (count($usernames) === 0) {
        return array();
    }
    $escaped = array();
    foreach ($usernames as $username) {
        $escaped[] = "'" . mysqli_real_escape_string($con, $username) . "'";
    }
    $rows = content_query_fetch_all($con, "select * from userinfo where username in (" . implode(",", $escaped) . ")");
    $profiles = array();
    foreach ($rows as $row) {
        $profiles[$row["username"]] = $row;
    }
    return $profiles;
}

function content_query_get_board_rights($board_row, $viewer) {
    if (!$viewer) {
        return array(
            "code" => -1,
            "canGlobalPin" => false,
            "canModerate" => false,
            "username" => "",
            "rights" => -1,
        );
    }

    $username = $viewer["username"];
    $rights = intval($viewer["rights"]);
    $code = 0;
    if ($rights >= 3) {
        $code = 2;
    } else {
        for ($i = 1; $i <= 4; $i++) {
            $key = "m" . $i;
            if (isset($board_row[$key]) && $board_row[$key] === $username) {
                $code = 1;
            }
        }
    }

    return array(
        "code" => $code,
        "canGlobalPin" => $code > 1 || $rights >= 2,
        "canModerate" => $code > 0 || $rights >= 3,
        "username" => $username,
        "rights" => $rights,
    );
}

function content_query_get_favorite_count($con, $bid, $tid) {
    $row = content_query_fetch_one($con, "select count(*) as num from favorites where bid=$bid and tid=$tid");
    return intval($row ? $row["num"] : 0);
}

function content_query_is_favorite($con, $username, $bid, $tid) {
    $username_escaped = mysqli_real_escape_string($con, $username);
    $row = content_query_fetch_one($con, "select 1 as hit from favorites where username='$username_escaped' and bid=$bid and tid=$tid limit 1");
    return $row ? true : false;
}

function content_query_pack_board($row) {
    $bid = intval($row["bid"]);
    $name = content_query_string(isset($row["name"]) ? $row["name"] : "");
    if ($name === "") {
        $name = content_query_string(isset($row["bbstitle"]) ? $row["bbstitle"] : "");
    }
    if ($name === "") {
        $name = "版面 " . $bid;
    }
    $title = content_query_string(isset($row["bbstitle"]) ? $row["bbstitle"] : "");
    if ($title === "") {
        $title = content_query_string(isset($row["title"]) ? $row["title"] : $name);
    }

    $moderators = array();
    for ($i = 1; $i <= 4; $i++) {
        $key = "m" . $i;
        if (isset($row[$key]) && trim($row[$key]) !== "") {
            $moderators[] = $row[$key];
        }
    }

    return array(
        "bid" => $bid,
        "name" => $name,
        "title" => $title,
        "hidden" => intval(isset($row["hide"]) ? $row["hide"] : 0) === 1,
        "moderators" => $moderators,
        "requiredStar" => intval(isset($row["need"]) ? $row["need"] : 0),
        "raw" => content_query_strip_numeric_keys($row),
    );
}

function content_query_pack_thread($row, $board_row, $favorite_count, $activity) {
    $bid = intval($row["bid"]);
    $tid = intval($row["tid"]);
    $board = content_query_pack_board($board_row);
    $activity_id = isset($row["activity_id"]) ? intval($row["activity_id"]) : 0;
    if ($activity_id <= 0 && is_array($activity) && isset($activity["activity_id"])) {
        $activity_id = intval($activity["activity_id"]);
    }

    return array(
        "id" => $bid . "-" . $tid,
        "bid" => $bid,
        "tid" => $tid,
        "title" => content_query_string($row["title"]),
        "author" => content_query_string($row["author"]),
        "replyer" => content_query_string(isset($row["replyer"]) ? $row["replyer"] : ""),
        "views" => intval($row["click"]),
        "favorites" => $favorite_count,
        "replies" => intval($row["reply"]),
        "digest" => intval($row["extr"]) > 0,
        "pinned" => intval($row["top"]) > 0,
        "locked" => intval($row["locked"]) > 0,
        "globalPinned" => intval(isset($row["global_top"]) ? $row["global_top"] : 0) > 0,
        "isActivity" => $activity_id > 0,
        "activityId" => $activity_id > 0 ? $activity_id : null,
        "updatedAt" => content_query_format_timestamp($row["timestamp"]),
        "postDate" => content_query_format_date($row["postdate"]),
        "board" => array(
            "bid" => $board["bid"],
            "name" => $board["name"],
            "title" => $board["title"],
        ),
        "raw" => content_query_strip_numeric_keys($row),
    );
}

function content_query_pack_floor($row, $profiles_by_username, $lzl_by_fid, $attachments_by_id, $rights, $current_username) {
    $author = content_query_string(isset($row["author"]) ? $row["author"] : "");
    $profile = isset($profiles_by_username[$author]) ? $profiles_by_username[$author] : null;
    $fid = intval(isset($row["fid"]) ? $row["fid"] : 0);
    $sig = intval(isset($row["sig"]) ? $row["sig"] : 0);
    $raw_text = content_query_string(isset($row["text"]) ? $row["text"] : "");
    $is_html = content_query_string(isset($row["ishtml"]) ? $row["ishtml"] : "YES");
    $nested_rows = isset($lzl_by_fid[$fid]) ? $lzl_by_fid[$fid] : array();
    $attachments = content_query_pack_floor_attachments($row, $attachments_by_id);
    $signature = "";
    if ($profile && $sig >= 1 && $sig <= 3) {
        $sig_key = "sig" . $sig;
        if (isset($profile[$sig_key]) && trim($profile[$sig_key]) !== "") {
            $signature = translate($profile[$sig_key], false, false);
        }
    }

    return array(
        "bid" => intval($row["bid"]),
        "tid" => intval($row["tid"]),
        "pid" => intval($row["pid"]),
        "fid" => $fid,
        "title" => content_query_string(isset($row["title"]) ? $row["title"] : ""),
        "author" => $author !== "" ? $author : "匿名用户",
        "authorAvatar" => $profile ? translateicon(content_query_string(isset($profile["icon"]) ? $profile["icon"] : "")) : "",
        "authorStar" => $profile ? intval(isset($profile["star"]) ? $profile["star"] : 0) : 0,
        "authorProfile" => $profile ? content_query_pack_profile($profile, false) : null,
        "contentHtml" => translate($raw_text, $is_html === "YES"),
        "quoteHtml" => translateforquote($raw_text, $is_html === "YES"),
        "rawText" => $raw_text,
        "isHtml" => $is_html,
        "createdAt" => content_query_format_timestamp(isset($row["replytime"]) ? $row["replytime"] : ""),
        "updatedAt" => content_query_format_timestamp(isset($row["updatetime"]) ? $row["updatetime"] : ""),
        "signatureEnabled" => $sig > 0,
        "signatureHtml" => $signature,
        "signatureIndex" => $sig,
        "nestedReplyCount" => max(intval(isset($row["lzl"]) ? $row["lzl"] : 0), count($nested_rows)),
        "nestedReplies" => content_query_pack_nested_replies($nested_rows, $profiles_by_username, $rights, $current_username),
        "attachments" => $attachments,
        "ip" => content_query_visible_ip(isset($row["ip"]) ? $row["ip"] : "", $author, $rights, $current_username),
        "type" => content_query_string(isset($row["type"]) ? $row["type"] : ""),
        "canEdit" => content_query_can_manage_author_content($author, $rights, $current_username),
        "canDelete" => content_query_can_manage_author_content($author, $rights, $current_username),
        "raw" => content_query_strip_numeric_keys($row),
    );
}

function content_query_pack_floor_attachments($row, $attachments_by_id) {
    $items = array();
    $parts = preg_split("/\\s+/", trim(isset($row["attachs"]) ? $row["attachs"] : ""));
    foreach ($parts as $part) {
        $id = intval($part);
        if ($id <= 0) {
            continue;
        }
        $attachment = isset($attachments_by_id[$id]) ? $attachments_by_id[$id] : null;
        if (!$attachment) {
            $items[] = array(
                "id" => $id,
                "name" => "附件 " . $id,
                "path" => "/bbs/download/?id=" . $id,
                "size" => 0,
                "price" => 0,
                "auth" => 0,
                "count" => 0,
                "exists" => false,
            );
            continue;
        }
        $items[] = array(
            "id" => intval($attachment["id"]),
            "name" => content_query_string(isset($attachment["name"]) ? $attachment["name"] : ""),
            "path" => "/bbs/download/?id=" . intval($attachment["id"]),
            "rawPath" => content_query_string(isset($attachment["path"]) ? $attachment["path"] : ""),
            "size" => intval(isset($attachment["size"]) ? $attachment["size"] : 0),
            "price" => intval(isset($attachment["price"]) ? $attachment["price"] : 0),
            "auth" => intval(isset($attachment["auth"]) ? $attachment["auth"] : 0),
            "count" => intval(isset($attachment["count"]) ? $attachment["count"] : 0),
            "exists" => true,
        );
    }
    return $items;
}

function content_query_pack_nested_replies($rows, $profiles_by_username, $rights, $current_username) {
    $items = array();
    foreach ($rows as $row) {
        $author = content_query_string(isset($row["author"]) ? $row["author"] : "");
        $profile = isset($profiles_by_username[$author]) ? $profiles_by_username[$author] : null;
        $text = content_query_string(isset($row["text"]) ? $row["text"] : "");
        $items[] = array(
            "id" => intval(isset($row["id"]) ? $row["id"] : 0),
            "fid" => intval(isset($row["fid"]) ? $row["fid"] : 0),
            "author" => $author !== "" ? $author : "匿名用户",
            "authorAvatar" => $profile ? translateicon(content_query_string(isset($profile["icon"]) ? $profile["icon"] : "")) : "",
            "content" => $text,
            "contentHtml" => nl2br(htmlspecialchars($text, ENT_QUOTES, "UTF-8")),
            "createdAt" => content_query_format_timestamp(isset($row["time"]) ? $row["time"] : ""),
            "canDelete" => content_query_can_manage_author_content($author, $rights, $current_username),
            "raw" => content_query_strip_numeric_keys($row),
        );
    }
    return $items;
}

function content_query_pack_profile($row, $include_viewer_fields) {
    $profile = array(
        "username" => content_query_string(isset($row["username"]) ? $row["username"] : ""),
        "id" => isset($row["userid"]) ? intval($row["userid"]) : null,
        "rights" => intval(isset($row["rights"]) ? $row["rights"] : 0),
        "star" => intval(isset($row["star"]) ? $row["star"] : 0),
        "score" => intval(isset($row["score"]) ? $row["score"] : 0),
        "icon" => content_query_string(isset($row["icon"]) ? $row["icon"] : ""),
        "avatar" => translateicon(content_query_string(isset($row["icon"]) ? $row["icon"] : "")),
        "intro" => content_query_string(isset($row["intro"]) ? $row["intro"] : ""),
        "registeredAt" => content_query_string(isset($row["regdate"]) ? $row["regdate"] : ""),
        "lastSeenAt" => content_query_string(isset($row["lastdate"]) ? $row["lastdate"] : ""),
        "stats" => array(
            "posts" => intval(isset($row["post"]) ? $row["post"] : 0),
            "replies" => intval(isset($row["reply"]) ? $row["reply"] : 0),
            "water" => intval(isset($row["water"]) ? $row["water"] : 0),
            "checkins" => intval(isset($row["sign"]) ? $row["sign"] : 0),
            "digests" => intval(isset($row["extr"]) ? $row["extr"] : 0),
        ),
        "signatures" => array(
            "1" => content_query_string(isset($row["sig1"]) ? $row["sig1"] : ""),
            "2" => content_query_string(isset($row["sig2"]) ? $row["sig2"] : ""),
            "3" => content_query_string(isset($row["sig3"]) ? $row["sig3"] : ""),
        ),
    );
    if ($include_viewer_fields) {
        $profile["unreadMessages"] = intval(isset($row["newmsg"]) ? $row["newmsg"] : 0);
    }
    return $profile;
}

function content_query_pack_viewer_state($thread_row, $board_row, $viewer, $rights, $bookmarked) {
    $need = intval(isset($board_row["need"]) ? $board_row["need"] : 0);
    $viewer_star = $viewer ? intval($viewer["star"]) : 0;
    $viewer_rights = $viewer ? intval($viewer["rights"]) : -1;
    $logged_in = $viewer ? true : false;
    $can_reply = $logged_in && intval($thread_row["locked"]) === 0;
    if ($can_reply && $viewer_rights <= 1 && $viewer_star < $need) {
        $can_reply = false;
    }

    return array(
        "bookmarked" => $bookmarked,
        "canReply" => $can_reply,
        "canEdit" => $rights["canModerate"],
        "canGlobalPin" => $rights["canGlobalPin"],
        "canModerate" => $rights["canModerate"],
        "rightsCode" => $rights["code"],
        "requiredStar" => $need,
    );
}

function content_query_can_manage_author_content($author, $rights, $current_username) {
    if (!$current_username) {
        return false;
    }
    return $rights["canModerate"] || $author === $current_username;
}

function content_query_visible_ip($ip, $author, $rights, $current_username) {
    if ($rights["canModerate"] || ($current_username && $author === $current_username)) {
        return content_query_string($ip);
    }
    return "*.*.*.*";
}

function content_query_fetch_one($con, $statement) {
    $result = mysqli_query($con, $statement);
    if (!$result) {
        content_query_send_error(4001, "数据库查询失败。", 500);
    }
    $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
    mysqli_free_result($result);
    return $row ? $row : null;
}

function content_query_fetch_all($con, $statement) {
    $result = mysqli_query($con, $statement);
    if (!$result) {
        content_query_send_error(4001, "数据库查询失败。", 500);
    }
    $rows = array();
    while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
        $rows[] = $row;
    }
    mysqli_free_result($result);
    return $rows;
}

function content_query_format_timestamp($value) {
    $raw = trim(strval($value));
    if ($raw === "") {
        return "";
    }
    if (is_numeric($raw)) {
        $timestamp = intval($raw);
        if ($timestamp > 0) {
            return date("Y-m-d H:i:s", $timestamp);
        }
    }
    return $raw;
}

function content_query_format_date($value) {
    $raw = trim(strval($value));
    if ($raw === "") {
        return "";
    }
    if (preg_match("/^\\d{4}-\\d{1,2}-\\d{1,2}$/", $raw)) {
        return $raw . " 00:00:00";
    }
    return content_query_format_timestamp($raw);
}

function content_query_string($value) {
    if ($value === null) {
        return "";
    }
    return strval($value);
}

function content_query_strip_numeric_keys($row) {
    $clean = array();
    foreach ($row as $key => $value) {
        if (is_int($key)) {
            continue;
        }
        if ($key === "password" || $key === "token" || $key === "tokentime") {
            continue;
        }
        $clean[$key] = $value;
    }
    return $clean;
}
