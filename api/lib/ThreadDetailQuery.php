<?php
/**
 * Aggregated thread-detail payload for the new forum UI.
 *
 * This file is intentionally side-effect-light: api.php owns headers, DB
 * connection, cookie extraction and response wrapping. The handler below only
 * returns the usual dispatch array shape.
 */

if (!defined('THREAD_DETAIL_QUERY_PAGE_SIZE')) {
    define('THREAD_DETAIL_QUERY_PAGE_SIZE', 12);
}

function jiekoufunc_thread_detail($con, $bid, $tid, $params, $token, $ip) {
    $bid = intval($bid);
    $tid = intval($tid);
    if ($bid <= 0 || $tid <= 0) {
        return jiekoufunc_report('-1', '缺少帖子参数。');
    }

    $page = thread_detail_query_int_param($params, 'page', thread_detail_query_int_param($params, 'p', 1));
    $author_only = thread_detail_query_bool_param($params, 'authorOnly') || thread_detail_query_bool_param($params, 'see_lz');
    $include_tags = thread_detail_query_bool_param($params, 'tag');
    $include_medals = thread_detail_query_bool_param($params, 'medal');
    $include_decoration = thread_detail_query_bool_param($params, 'decoration');
    $prefetch = thread_detail_query_bool_param($params, 'prefetch');
    $render = thread_detail_query_render_param($params);

    $current_username = thread_detail_query_current_username($con, $token);

    $thread_row = thread_detail_query_get_thread($con, $bid, $tid);
    if ($thread_row === false) {
        return jiekoufunc_report('8', '数据库查询失败。');
    }
    if (!$thread_row) {
        return jiekoufunc_report('3', '主题不存在。');
    }

    $board_row = thread_detail_query_get_board($con, $bid);
    if ($board_row === false) {
        return jiekoufunc_report('8', '数据库查询失败。');
    }
    if (!$board_row) {
        return jiekoufunc_report('3', '版块不存在。');
    }

    if ($bid === 1 && !$current_username) {
        return jiekoufunc_report('-2', '本版块需要登录后才能查看');
    }

    if (!$prefetch) {
        thread_detail_query_record_view($con, $bid, $tid, $current_username, $ip);
        $thread_row['click'] = intval($thread_row['click']) + 1;
    }

    $total = $author_only
        ? thread_detail_query_count_author_floors($con, $bid, $tid, $thread_row['author'])
        : max(1, intval($thread_row['reply']) + 1);
    $pages = max(1, intval(ceil($total / THREAD_DETAIL_QUERY_PAGE_SIZE)));
    $page = max(1, min($pages, $page));

    $page_rows = thread_detail_query_get_page_posts($con, $bid, $tid, $page, $author_only ? $thread_row['author'] : '');
    if ($page_rows === false) {
        return jiekoufunc_report('8', '数据库查询失败。');
    }

    $main_post_row = thread_detail_query_find_post_by_pid($page_rows, 1);
    if (!$main_post_row) {
        $main_post_row = thread_detail_query_get_post($con, $bid, $tid, 1);
    }
    if ($main_post_row === false) {
        return jiekoufunc_report('8', '数据库查询失败。');
    }
    if (!$main_post_row) {
        return jiekoufunc_report('3', '主楼不存在。');
    }

    $all_post_rows = thread_detail_query_merge_main_post($main_post_row, $page_rows);
    $lzl_by_fid = thread_detail_query_get_nested_replies_by_fid($con, $all_post_rows);
    $attachment_ids = thread_detail_query_collect_attachment_ids($all_post_rows);
    $attachments_by_id = thread_detail_query_get_attachments_by_id($con, $attachment_ids);
    $authors = thread_detail_query_collect_authors($all_post_rows, $lzl_by_fid);
    if ($current_username !== '' && !in_array($current_username, $authors, true)) {
        $authors[] = $current_username;
    }
    $profiles_by_username = thread_detail_query_get_profiles_by_username(
        $con,
        $authors,
        $include_tags,
        $include_medals
    );
    if ($include_decoration && !empty($profiles_by_username)) {
        $decorations_by_username = floor_decoration_query_by_usernames($con, array_keys($profiles_by_username));
        foreach ($profiles_by_username as $profile_username => &$profile) {
            $profile['_floor_decoration'] = isset($decorations_by_username[$profile_username])
                ? $decorations_by_username[$profile_username]
                : floor_decoration_empty();
        }
        unset($profile);
    }
    $viewer = isset($profiles_by_username[$current_username])
        ? thread_detail_query_pack_profile($profiles_by_username[$current_username], true)
        : null;
    $rights = thread_detail_query_get_board_rights($board_row, $viewer);
    $bookmarked = $current_username ? thread_detail_query_is_favorite($con, $current_username, $bid, $tid) : false;
    $activity = intval(isset($thread_row['activity_id']) ? $thread_row['activity_id'] : 0) > 0
        ? thread_detail_query_get_activity($con, $bid, $tid)
        : null;
    $viewer_state = thread_detail_query_pack_viewer_state($thread_row, $board_row, $viewer, $rights, $bookmarked);

    $main_post = thread_detail_query_pack_floor(
        $main_post_row,
        $profiles_by_username,
        $lzl_by_fid,
        $attachments_by_id,
        $rights,
        $current_username,
        $render
    );

    $floor_items = array();
    foreach ($page_rows as $row) {
        if (intval($row['pid']) <= 1) {
            continue;
        }
        $floor_items[] = thread_detail_query_pack_floor(
            $row,
            $profiles_by_username,
            $lzl_by_fid,
            $attachments_by_id,
            $rights,
            $current_username,
            $render
        );
    }

    $payload = array(
        'request' => array(
            'bid' => $bid,
            'tid' => $tid,
            'page' => $page,
            'render' => $render,
            'authorOnly' => $author_only,
            'tag' => $include_tags ? 1 : 0,
            'medal' => $include_medals ? 1 : 0,
            'decoration' => $include_decoration ? 1 : 0,
        ),
        'board' => thread_detail_query_pack_board($board_row),
        'thread' => thread_detail_query_pack_thread($thread_row, $board_row, $activity),
        'mainPost' => $main_post,
        'floorsPage' => array(
            'items' => $floor_items,
            'nextCursor' => $page < $pages ? strval($page + 1) : null,
            'hasMore' => $page < $pages,
            'page' => $page,
            'pages' => $pages,
            'pageSize' => THREAD_DETAIL_QUERY_PAGE_SIZE,
            'total' => $total,
            'authorOnly' => $author_only,
        ),
        'activity' => $activity,
        'viewer' => $viewer,
        'viewerState' => $viewer_state,
    );

    return array(array('code' => '0'), $payload);
}

/**
 * Register an actual thread visit without reloading the thread body. Cached
 * navigation uses this endpoint after rendering the stored content.
 */
function jiekoufunc_thread_view($con, $bid, $tid, $token, $ip) {
    $bid = intval($bid);
    $tid = intval($tid);
    if ($bid <= 0 || $tid <= 0) {
        return jiekoufunc_report('-1', '缺少帖子参数。');
    }

    $thread_row = thread_detail_query_fetch_one($con, "
        select bid, tid, click
        from threads
        where bid=$bid and tid=$tid
        limit 1");
    if ($thread_row === false) {
        return jiekoufunc_report('8', '数据库查询失败。');
    }
    if (!$thread_row) {
        return jiekoufunc_report('3', '主题不存在。');
    }

    $current_username = thread_detail_query_current_username($con, $token);
    if ($bid === 1 && $current_username === '') {
        return jiekoufunc_report('-2', '本版块需要登录后才能查看');
    }

    thread_detail_query_record_view($con, $bid, $tid, $current_username, $ip);
    return array(array('code' => '0'), array(
        'bid' => $bid,
        'tid' => $tid,
        'views' => intval(isset($thread_row['click']) ? $thread_row['click'] : 0) + 1,
    ));
}

/**
 * Return compact validators for up to ten threads. This endpoint deliberately
 * does not read full floor bodies and has no view-count side effects unless a
 * single foreground navigation explicitly sets recordView=1.
 */
function jiekoufunc_thread_revisions($con, $params, $token, $ip) {
    $raw_items = isset($params['items']) ? $params['items'] : array();
    $items = is_array($raw_items) ? $raw_items : json_decode(strval($raw_items), true);
    if (!is_array($items) || count($items) === 0 || count($items) > 10) {
        return jiekoufunc_report('-1', '帖子版本检查参数不正确。');
    }

    $record_view = thread_detail_query_bool_param($params, 'recordView');
    if ($record_view && count($items) !== 1) {
        return jiekoufunc_report('-1', '阅读登记一次只能处理一个帖子。');
    }

    $current_username = thread_detail_query_current_username($con, $token);
    $current_viewer = null;
    if ($current_username !== '') {
        $current_profiles = thread_detail_query_get_profiles_by_username($con, array($current_username), false, false);
        if (isset($current_profiles[$current_username])) {
            $current_viewer = thread_detail_query_pack_profile($current_profiles[$current_username], true);
        }
    }
    $results = array();
    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }
        $bid = intval(isset($item['bid']) ? $item['bid'] : 0);
        $tid = intval(isset($item['tid']) ? $item['tid'] : 0);
        if ($bid <= 0 || $tid <= 0) {
            continue;
        }

        if ($bid === 1 && $current_username === '') {
            $results[] = array('bid' => $bid, 'tid' => $tid, 'state' => 'forbidden', 'revision' => '');
            continue;
        }

        $thread_row = thread_detail_query_get_thread($con, $bid, $tid);
        if ($thread_row === false) {
            return jiekoufunc_report('8', '数据库查询失败。');
        }
        if (!$thread_row) {
            $results[] = array('bid' => $bid, 'tid' => $tid, 'state' => 'gone', 'revision' => '');
            continue;
        }

        $activity = intval(isset($thread_row['activity_id']) ? $thread_row['activity_id'] : 0) > 0
            ? thread_detail_query_get_activity($con, $bid, $tid)
            : null;
        $board_row = thread_detail_query_get_board($con, $bid);
        if ($board_row === false) {
            return jiekoufunc_report('8', '数据库查询失败。');
        }
        if (!$board_row) {
            $results[] = array('bid' => $bid, 'tid' => $tid, 'state' => 'gone', 'revision' => '');
            continue;
        }
        $rights = thread_detail_query_get_board_rights($board_row, $current_viewer);
        $bookmarked = $current_username !== ''
            ? thread_detail_query_is_favorite($con, $current_username, $bid, $tid)
            : false;
        $viewer_state = thread_detail_query_pack_viewer_state($thread_row, $board_row, $current_viewer, $rights, $bookmarked);
        $page = thread_detail_query_int_param($item, 'page', 1);
        $author_only = thread_detail_query_bool_param($item, 'authorOnly');
        $revision = thread_detail_query_revision(
            $con,
            $thread_row,
            $activity,
            $viewer_state,
            $page,
            $author_only
        );
        $known_revision = isset($item['revision']) ? strval($item['revision']) : '';
        if ($record_view) {
            thread_detail_query_record_view($con, $bid, $tid, $current_username, $ip);
        }
        $results[] = array(
            'bid' => $bid,
            'tid' => $tid,
            'state' => $known_revision !== '' && hash_equals($revision, $known_revision) ? 'fresh' : 'changed',
            'revision' => $revision,
            'views' => intval(isset($thread_row['click']) ? $thread_row['click'] : 0) + ($record_view ? 1 : 0),
        );
    }

    if (count($results) === 0) {
        return jiekoufunc_report('-1', '没有可检查的帖子。');
    }
    return array(array('code' => '0'), $results);
}

function thread_detail_query_int_param($params, $key, $default) {
    if (!isset($params[$key]) || $params[$key] === '') {
        return intval($default);
    }
    return intval($params[$key]);
}

function thread_detail_query_bool_param($params, $key) {
    if (!isset($params[$key])) {
        return false;
    }
    $value = strtolower(strval($params[$key]));
    return $value === '1' || $value === 'true' || $value === 'yes' || $value === 'on';
}

function thread_detail_query_render_param($params) {
    $render = isset($params['render']) ? strtolower(trim(strval($params['render']))) : 'both';
    if ($render !== 'raw' && $render !== 'html' && $render !== 'both') {
        return 'both';
    }
    return $render;
}

function thread_detail_query_current_username($con, $token) {
    if (!$token) {
        return '';
    }
    $row = jiekoufunc_token2user($con, $token);
    if (!$row) {
        return '';
    }
    if (isset($row['username'])) {
        return strval($row['username']);
    }
    if (isset($row[0])) {
        return strval($row[0]);
    }
    return '';
}

function thread_detail_query_get_thread($con, $bid, $tid) {
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
    return thread_detail_query_fetch_one($con, $statement);
}

function thread_detail_query_revision($con, $thread_row, $activity, $viewer_state, $page = 1, $author_only = false) {
    $page_state = thread_detail_query_revision_page_state(
        $con,
        $thread_row,
        max(1, intval($page)),
        $author_only
    );

    $state = array(
        'schema' => 2,
        'thread' => array(
            'timestamp' => intval(isset($thread_row['timestamp']) ? $thread_row['timestamp'] : 0),
            'reply' => intval(isset($thread_row['reply']) ? $thread_row['reply'] : 0),
            'locked' => intval(isset($thread_row['locked']) ? $thread_row['locked'] : 0),
            'title' => thread_detail_query_string(isset($thread_row['title']) ? $thread_row['title'] : ''),
            'author' => thread_detail_query_string(isset($thread_row['author']) ? $thread_row['author'] : ''),
        ),
        'page' => $page_state,
        'activity' => $activity,
        'viewer' => $viewer_state,
    );

    $encoded = json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return hash('sha256', $encoded === false ? serialize($state) : $encoded);
}

/**
 * Build a bounded content signature from the main floor, the requested page,
 * and the thread tail. The regular path reads no more than two pages of post
 * metadata and deliberately avoids joining the unindexed lzl table; posts.lzl
 * is the maintained visible nested-reply count used for invalidation.
 */
function thread_detail_query_revision_page_state($con, $thread_row, $page, $author_only) {
    $bid = intval(isset($thread_row['bid']) ? $thread_row['bid'] : 0);
    $tid = intval(isset($thread_row['tid']) ? $thread_row['tid'] : 0);
    $page = max(1, intval($page));
    $rows = array();
    $last_page = null;

    if ($author_only) {
        $author = mysqli_real_escape_string(
            $con,
            thread_detail_query_string(isset($thread_row['author']) ? $thread_row['author'] : '')
        );
        $offset = ($page - 1) * THREAD_DETAIL_QUERY_PAGE_SIZE;
        $rows = thread_detail_query_fetch_all($con, "
            select pid, fid, replytime, updatetime, lzl
            from posts
            where bid=$bid and tid=$tid and author='$author'
            order by pid
            limit $offset," . THREAD_DETAIL_QUERY_PAGE_SIZE);
        if (!is_array($rows)) {
            $rows = array();
        }
        $tail_rows = thread_detail_query_fetch_all($con, "
            select pid, fid, replytime, updatetime, lzl
            from posts
            where bid=$bid and tid=$tid and author='$author'
            order by pid desc
            limit " . THREAD_DETAIL_QUERY_PAGE_SIZE);
        if (is_array($tail_rows)) {
            $rows = array_merge($rows, $tail_rows);
        }
        if ($page > 1) {
            $main_row = thread_detail_query_fetch_one($con, "
                select pid, fid, replytime, updatetime, lzl
                from posts
                where bid=$bid and tid=$tid and pid=1
                limit 1");
            if (is_array($main_row)) {
                array_unshift($rows, $main_row);
            }
        }
    } else {
        $total = max(1, intval(isset($thread_row['reply']) ? $thread_row['reply'] : 0) + 1);
        $pages = max(1, intval(ceil($total / THREAD_DETAIL_QUERY_PAGE_SIZE)));
        $page = min($page, $pages);
        $last_page = $pages;
        $page_start_pid = (($page - 1) * THREAD_DETAIL_QUERY_PAGE_SIZE) + 1;
        $page_end_pid = $page_start_pid + THREAD_DETAIL_QUERY_PAGE_SIZE - 1;
        $last_start_pid = (($pages - 1) * THREAD_DETAIL_QUERY_PAGE_SIZE) + 1;
        $last_end_pid = $last_start_pid + THREAD_DETAIL_QUERY_PAGE_SIZE - 1;
        $rows = thread_detail_query_fetch_all($con, "
            select pid, fid, replytime, updatetime, lzl
            from posts
            where bid=$bid and tid=$tid and (
                pid=1
                or pid between $page_start_pid and $page_end_pid
                or pid between $last_start_pid and $last_end_pid
            )
            order by pid");
    }

    if (!is_array($rows)) $rows = array();
    $post_state_by_pid = array();
    foreach ($rows as $row) {
        $pid = intval(isset($row['pid']) ? $row['pid'] : 0);
        if ($pid <= 0) continue;
        $post_state_by_pid[$pid] = array(
            'pid' => $pid,
            'fid' => intval(isset($row['fid']) ? $row['fid'] : 0),
            'replytime' => intval(isset($row['replytime']) ? $row['replytime'] : 0),
            'updatetime' => intval(isset($row['updatetime']) ? $row['updatetime'] : 0),
            'lzl' => intval(isset($row['lzl']) ? $row['lzl'] : 0),
        );
    }
    ksort($post_state_by_pid, SORT_NUMERIC);

    return array(
        'authorOnly' => $author_only ? 1 : 0,
        'page' => $page,
        'lastPage' => $last_page,
        'posts' => array_values($post_state_by_pid),
    );
}

function thread_detail_query_get_board($con, $bid) {
    return thread_detail_query_fetch_one($con, "select * from boardinfo where bid=$bid limit 1");
}

function thread_detail_query_record_view($con, $bid, $tid, $username, $ip) {
    $nowtime = time();
    $today = date('Y-m-d');
    $username_escaped = mysqli_real_escape_string($con, $username);
    $ip_escaped = mysqli_real_escape_string($con, $ip);

    if ($username !== '') {
        $statement = "update userinfo set tokentime=$nowtime, nowboard=$bid, lastip='$ip_escaped' where username='$username_escaped'";
        mysqli_query($con, $statement);
    }

    $statement = "insert ignore into username_view (username, date, bid, tid, ip)
        values ('$username_escaped', '$today', $bid, $tid, '$ip_escaped')";
    mysqli_query($con, $statement);
    mysqli_query($con, "update threads set click=click+1 where bid=$bid and tid=$tid");
}

function thread_detail_query_count_author_floors($con, $bid, $tid, $author) {
    $author_escaped = mysqli_real_escape_string($con, $author);
    $row = thread_detail_query_fetch_one($con, "select count(*) as num from posts where bid=$bid and tid=$tid and author='$author_escaped'");
    if (!$row || $row === false) {
        return 1;
    }
    return max(1, intval($row['num']));
}

function thread_detail_query_get_page_posts($con, $bid, $tid, $page, $author) {
    $start = max(0, ($page - 1) * THREAD_DETAIL_QUERY_PAGE_SIZE);
    $where_author = '';
    if ($author !== '') {
        $author_escaped = mysqli_real_escape_string($con, $author);
        $where_author = " and author='$author_escaped'";
    }
    $statement = "select * from posts where bid=$bid and tid=$tid$where_author order by pid limit $start, " . THREAD_DETAIL_QUERY_PAGE_SIZE;
    return thread_detail_query_fetch_all($con, $statement);
}

function thread_detail_query_get_post($con, $bid, $tid, $pid) {
    return thread_detail_query_fetch_one($con, "select * from posts where bid=$bid and tid=$tid and pid=$pid limit 1");
}

function thread_detail_query_find_post_by_pid($rows, $pid) {
    foreach ($rows as $row) {
        if (intval($row['pid']) === intval($pid)) {
            return $row;
        }
    }
    return null;
}

function thread_detail_query_merge_main_post($main_post_row, $page_rows) {
    $rows = array($main_post_row);
    foreach ($page_rows as $row) {
        if (intval($row['pid']) === 1) {
            continue;
        }
        $rows[] = $row;
    }
    return $rows;
}

function thread_detail_query_get_nested_replies_by_fid($con, $post_rows) {
    $fid_values = array();
    foreach ($post_rows as $row) {
        $fid = intval($row['fid']);
        $lzl = intval(isset($row['lzl']) ? $row['lzl'] : 0);
        if ($fid > 0 && $lzl > 0) {
            $fid_values[$fid] = $fid;
        }
    }
    if (count($fid_values) === 0) {
        return array();
    }

    $statement = "select * from lzl where visible=1 and fid in (" . implode(',', $fid_values) . ") order by fid, id";
    $rows = thread_detail_query_fetch_all($con, $statement);
    if ($rows === false) {
        return array();
    }

    $grouped = array();
    foreach ($rows as $row) {
        $fid = intval($row['fid']);
        if (!isset($grouped[$fid])) {
            $grouped[$fid] = array();
        }
        $grouped[$fid][] = $row;
    }
    return $grouped;
}

function thread_detail_query_collect_attachment_ids($post_rows) {
    $ids = array();
    foreach ($post_rows as $row) {
        $parts = preg_split('/\s+/', trim(isset($row['attachs']) ? $row['attachs'] : ''));
        foreach ($parts as $part) {
            $id = intval($part);
            if ($id > 0) {
                $ids[$id] = $id;
            }
        }
    }
    return array_values($ids);
}

function thread_detail_query_get_attachments_by_id($con, $attachment_ids) {
    if (count($attachment_ids) === 0) {
        return array();
    }
    $statement = "select * from attachments where id in (" . implode(',', $attachment_ids) . ")";
    $rows = thread_detail_query_fetch_all($con, $statement);
    if ($rows === false) {
        return array();
    }
    $by_id = array();
    foreach ($rows as $row) {
        $by_id[intval($row['id'])] = $row;
    }
    return $by_id;
}

function thread_detail_query_collect_authors($post_rows, $lzl_by_fid) {
    $authors = array();
    foreach ($post_rows as $row) {
        if (isset($row['author']) && $row['author'] !== '') {
            $authors[$row['author']] = $row['author'];
        }
    }
    foreach ($lzl_by_fid as $replies) {
        foreach ($replies as $reply) {
            if (isset($reply['author']) && $reply['author'] !== '') {
                $authors[$reply['author']] = $reply['author'];
            }
        }
    }
    return array_values($authors);
}

function thread_detail_query_get_profiles_by_username($con, $usernames, $include_tags = false, $include_medals = false) {
    if (count($usernames) === 0) {
        return array();
    }
    $escaped = array();
    foreach ($usernames as $username) {
        $escaped[] = "'" . mysqli_real_escape_string($con, $username) . "'";
    }
    $rows = thread_detail_query_fetch_all($con, "select * from userinfo where username in (" . implode(',', $escaped) . ")");
    if ($rows === false) {
        return array();
    }
    $profiles = array();
    foreach ($rows as $row) {
        $profiles[$row['username']] = $row;
    }
    if ($include_tags && !empty($profiles)) {
        $tags_by_username = jiekoufunc_query_user_tags($con, array_keys($profiles));
        foreach ($profiles as $username => &$profile) {
            $profile['_tags'] = isset($tags_by_username[$username])
                ? $tags_by_username[$username]
                : array();
        }
        unset($profile);
    }
    if ($include_medals && !empty($profiles) && function_exists('medal_query_thread_by_usernames')) {
        $medals_by_username = medal_query_thread_by_usernames($con, array_keys($profiles));
        foreach ($profiles as $username => &$profile) {
            $profile['_medals'] = isset($medals_by_username[$username])
                ? $medals_by_username[$username]
                : array();
        }
        unset($profile);
    }
    return $profiles;
}

function thread_detail_query_get_board_rights($board_row, $viewer) {
    if (!$viewer) {
        return array(
            'code' => -1,
            'canGlobalPin' => false,
            'canModerate' => false,
            'username' => '',
            'rights' => -1,
        );
    }

    $username = $viewer['username'];
    $rights = intval($viewer['rights']);
    $code = 0;
    if ($rights >= 3) {
        $code = 2;
    } else {
        for ($i = 1; $i <= 4; $i++) {
            $key = 'm' . $i;
            if (isset($board_row[$key]) && $board_row[$key] === $username) {
                $code = 1;
            }
        }
    }

    return array(
        'code' => $code,
        'canGlobalPin' => $code > 1 || $rights >= 2,
        'canModerate' => $code > 0 || $rights >= 3,
        'username' => $username,
        'rights' => $rights,
    );
}

function thread_detail_query_is_favorite($con, $username, $bid, $tid) {
    $username_escaped = mysqli_real_escape_string($con, $username);
    $row = thread_detail_query_fetch_one($con, "select 1 as hit from favorites where username='$username_escaped' and bid=$bid and tid=$tid limit 1");
    return $row && $row !== false ? true : false;
}

function thread_detail_query_get_activity($con, $bid, $tid) {
    $statement = "select activity_id, bid, tid, season_id, name, leader_username
        from season_threads_activity
        where bid=$bid and tid=$tid
        limit 1";
    $activity_row = thread_detail_query_fetch_one($con, $statement);
    if (!$activity_row || $activity_row === false) {
        return null;
    }

    $activity_id = intval($activity_row['activity_id']);
    $options = array();
    $option_rows = thread_detail_query_fetch_all($con, "select id, type_id, option_name, required, comment, hiden
        from season_activity_option
        where activity_id=$activity_id order by id");
    if ($option_rows === false) {
        $option_rows = array();
    }

    foreach ($option_rows as $option_row) {
        $option = array(
            'option_id' => $option_row['id'],
            'type_id' => $option_row['type_id'],
            'option_name' => $option_row['option_name'],
            'required' => $option_row['required'],
            'comment' => $option_row['comment'],
            'hiden' => $option_row['hiden'],
        );
        $option_id = intval($option_row['id']);
        $type_id = intval($option_row['type_id']);
        if ($type_id === 1 || $type_id === 3) {
            $case_rows = thread_detail_query_fetch_all($con, "select case_id, case_name, comment, need_value
                from season_option_case
                where option_id=$option_id order by case_id");
            $cases = array();
            if ($case_rows !== false) {
                foreach ($case_rows as $case_row) {
                    $cases[] = array(
                        'case_id' => $case_row['case_id'],
                        'case_name' => $case_row['case_name'],
                        'comment' => $case_row['comment'],
                        'need_value' => $case_row['need_value'],
                    );
                }
            }
            $option['cases'] = $cases;
        }
        $options[] = $option;
    }

    return array(
        'activity_id' => $activity_row['activity_id'],
        'season_id' => $activity_row['season_id'],
        'name' => $activity_row['name'],
        'leader_username' => $activity_row['leader_username'],
        'signup_window' => activity_signup_window_for_activity($con, $activity_id),
        'schedule' => activity_schedule_for_activity($con, $activity_id),
        'options' => $options,
    );
}

function thread_detail_query_pack_board($row) {
    $bid = intval($row['bid']);
    $name = thread_detail_query_string(isset($row['name']) ? $row['name'] : '');
    if ($name === '') {
        $name = thread_detail_query_string(isset($row['bbstitle']) ? $row['bbstitle'] : '');
    }
    if ($name === '') {
        $name = '版面 ' . $bid;
    }
    $title = thread_detail_query_string(isset($row['bbstitle']) ? $row['bbstitle'] : '');
    if ($title === '') {
        $title = thread_detail_query_string(isset($row['title']) ? $row['title'] : $name);
    }

    $moderators = array();
    for ($i = 1; $i <= 4; $i++) {
        $key = 'm' . $i;
        if (isset($row[$key]) && trim($row[$key]) !== '') {
            $moderators[] = $row[$key];
        }
    }

    return array(
        'bid' => $bid,
        'name' => $name,
        'title' => $title,
        'hidden' => intval(isset($row['hide']) ? $row['hide'] : 0) === 1,
        'moderators' => $moderators,
        'requiredStar' => intval(isset($row['need']) ? $row['need'] : 0),
    );
}

function thread_detail_query_pack_thread($row, $board_row, $activity) {
    $bid = intval($row['bid']);
    $tid = intval($row['tid']);
    $board = thread_detail_query_pack_board($board_row);
    $activity_id = isset($row['activity_id']) ? intval($row['activity_id']) : 0;
    if ($activity_id <= 0 && is_array($activity) && isset($activity['activity_id'])) {
        $activity_id = intval($activity['activity_id']);
    }

    return array(
        'id' => $bid . '-' . $tid,
        'bid' => $bid,
        'tid' => $tid,
        'title' => thread_detail_query_string($row['title']),
        'author' => thread_detail_query_string($row['author']),
        'replyer' => thread_detail_query_string(isset($row['replyer']) ? $row['replyer'] : ''),
        'views' => intval($row['click']),
        'replies' => intval($row['reply']),
        'digest' => intval($row['extr']) > 0,
        'pinned' => intval($row['top']) > 0,
        'locked' => intval($row['locked']) > 0,
        'globalPinned' => intval(isset($row['global_top']) ? $row['global_top'] : 0) > 0,
        'isActivity' => $activity_id > 0,
        'activityId' => $activity_id > 0 ? $activity_id : null,
        'updatedAt' => thread_detail_query_format_timestamp($row['timestamp']),
        'postDate' => thread_detail_query_format_date($row['postdate']),
        'board' => array(
            'bid' => $board['bid'],
            'name' => $board['name'],
            'title' => $board['title'],
        ),
    );
}

function thread_detail_query_pack_floor($row, $profiles_by_username, $lzl_by_fid, $attachments_by_id, $rights, $current_username, $render) {
    $author = thread_detail_query_string(isset($row['author']) ? $row['author'] : '');
    $profile = isset($profiles_by_username[$author]) ? $profiles_by_username[$author] : null;
    $fid = intval(isset($row['fid']) ? $row['fid'] : 0);
    $sig = intval(isset($row['sig']) ? $row['sig'] : 0);
    $raw_text = thread_detail_query_string(isset($row['text']) ? $row['text'] : '');
    $is_html = thread_detail_query_string(isset($row['ishtml']) ? $row['ishtml'] : 'YES');
    $nested_rows = isset($lzl_by_fid[$fid]) ? $lzl_by_fid[$fid] : array();
    $signature = '';
    if ($profile && $sig >= 1 && $sig <= 3) {
        $sig_key = 'sig' . $sig;
        if (isset($profile[$sig_key]) && trim($profile[$sig_key]) !== '') {
            $signature = thread_detail_query_translate($profile[$sig_key], false, false);
        }
    }

    $floor = array(
        'bid' => intval($row['bid']),
        'tid' => intval($row['tid']),
        'pid' => intval($row['pid']),
        'fid' => $fid,
        'title' => thread_detail_query_string(isset($row['title']) ? $row['title'] : ''),
        'author' => $author !== '' ? $author : '匿名用户',
        'authorAvatar' => $profile ? thread_detail_query_translate_icon(thread_detail_query_string(isset($profile['icon']) ? $profile['icon'] : '')) : '',
        'authorStar' => $profile ? intval(isset($profile['star']) ? $profile['star'] : 0) : 0,
        'authorProfile' => $profile ? thread_detail_query_pack_profile($profile, false) : null,
        'createdAt' => thread_detail_query_format_timestamp(isset($row['replytime']) ? $row['replytime'] : ''),
        'updatedAt' => thread_detail_query_format_timestamp(isset($row['updatetime']) ? $row['updatetime'] : ''),
        'signatureEnabled' => $sig > 0,
        'signatureIndex' => $sig,
        'nestedReplyCount' => max(intval(isset($row['lzl']) ? $row['lzl'] : 0), count($nested_rows)),
        'nestedReplies' => thread_detail_query_pack_nested_replies($nested_rows, $profiles_by_username, $rights, $current_username),
        'attachments' => thread_detail_query_pack_floor_attachments($row, $attachments_by_id),
        'ip' => thread_detail_query_visible_ip(isset($row['ip']) ? $row['ip'] : '', $author, $rights, $current_username),
        'type' => thread_detail_query_string(isset($row['type']) ? $row['type'] : ''),
        'canEdit' => thread_detail_query_can_manage_author_content($author, $rights, $current_username),
        'canDelete' => thread_detail_query_can_manage_author_content($author, $rights, $current_username),
    );

    if ($render === 'raw' || $render === 'both') {
        $floor['rawText'] = $raw_text;
        $floor['isHtml'] = $is_html;
    }
    if ($render === 'html' || $render === 'both') {
        $floor['contentHtml'] = thread_detail_query_translate($raw_text, $is_html === 'YES');
        $floor['quoteHtml'] = thread_detail_query_translate_for_quote($raw_text, $is_html === 'YES');
        $floor['signatureHtml'] = $signature;
    }

    return $floor;
}

function thread_detail_query_pack_floor_attachments($row, $attachments_by_id) {
    $items = array();
    $parts = preg_split('/\s+/', trim(isset($row['attachs']) ? $row['attachs'] : ''));
    foreach ($parts as $part) {
        $id = intval($part);
        if ($id <= 0) {
            continue;
        }
        $attachment = isset($attachments_by_id[$id]) ? $attachments_by_id[$id] : null;
        if (!$attachment) {
            $items[] = array(
                'id' => $id,
                'name' => '附件 ' . $id,
                'path' => '/bbs/download/?id=' . $id,
                'size' => 0,
                'price' => 0,
                'auth' => 0,
                'count' => 0,
                'exists' => false,
            );
            continue;
        }
        $items[] = array(
            'id' => intval($attachment['id']),
            'name' => thread_detail_query_string(isset($attachment['name']) ? $attachment['name'] : ''),
            'path' => '/bbs/download/?id=' . intval($attachment['id']),
            'rawPath' => thread_detail_query_string(isset($attachment['path']) ? $attachment['path'] : ''),
            'size' => intval(isset($attachment['size']) ? $attachment['size'] : 0),
            'price' => intval(isset($attachment['price']) ? $attachment['price'] : 0),
            'auth' => intval(isset($attachment['auth']) ? $attachment['auth'] : 0),
            'count' => intval(isset($attachment['count']) ? $attachment['count'] : 0),
            'exists' => true,
        );
    }
    return $items;
}

function thread_detail_query_pack_nested_replies($rows, $profiles_by_username, $rights, $current_username) {
    $items = array();
    foreach ($rows as $row) {
        $author = thread_detail_query_string(isset($row['author']) ? $row['author'] : '');
        $profile = isset($profiles_by_username[$author]) ? $profiles_by_username[$author] : null;
        $text = thread_detail_query_string(isset($row['text']) ? $row['text'] : '');
        $items[] = array(
            'id' => intval(isset($row['id']) ? $row['id'] : 0),
            'fid' => intval(isset($row['fid']) ? $row['fid'] : 0),
            'author' => $author !== '' ? $author : '匿名用户',
            'authorAvatar' => $profile ? thread_detail_query_translate_icon(thread_detail_query_string(isset($profile['icon']) ? $profile['icon'] : '')) : '',
            'content' => $text,
            'createdAt' => thread_detail_query_format_timestamp(isset($row['time']) ? $row['time'] : ''),
            'canDelete' => thread_detail_query_can_manage_author_content($author, $rights, $current_username),
        );
    }
    return $items;
}

function thread_detail_query_pack_profile($row, $include_viewer_fields) {
    $profile = array(
        'username' => thread_detail_query_string(isset($row['username']) ? $row['username'] : ''),
        'id' => isset($row['userid']) ? intval($row['userid']) : null,
        'rights' => intval(isset($row['rights']) ? $row['rights'] : 0),
        'star' => intval(isset($row['star']) ? $row['star'] : 0),
        'score' => intval(isset($row['score']) ? $row['score'] : 0),
        'icon' => thread_detail_query_string(isset($row['icon']) ? $row['icon'] : ''),
        'avatar' => thread_detail_query_translate_icon(thread_detail_query_string(isset($row['icon']) ? $row['icon'] : '')),
        'intro' => thread_detail_query_string(isset($row['intro']) ? $row['intro'] : ''),
        'registeredAt' => thread_detail_query_string(isset($row['regdate']) ? $row['regdate'] : ''),
        'lastSeenAt' => thread_detail_query_string(isset($row['lastdate']) ? $row['lastdate'] : ''),
        'stats' => array(
            'posts' => intval(isset($row['post']) ? $row['post'] : 0),
            'replies' => intval(isset($row['reply']) ? $row['reply'] : 0),
            'water' => intval(isset($row['water']) ? $row['water'] : 0),
            'checkins' => intval(isset($row['sign']) ? $row['sign'] : 0),
            'digests' => intval(isset($row['extr']) ? $row['extr'] : 0),
        ),
        'signatures' => array(
            '1' => thread_detail_query_string(isset($row['sig1']) ? $row['sig1'] : ''),
            '2' => thread_detail_query_string(isset($row['sig2']) ? $row['sig2'] : ''),
            '3' => thread_detail_query_string(isset($row['sig3']) ? $row['sig3'] : ''),
        ),
    );
    if (array_key_exists('_tags', $row)) {
        $profile['tags'] = is_array($row['_tags']) ? $row['_tags'] : array();
    }
    if (array_key_exists('_medals', $row)) {
        $profile['medals'] = is_array($row['_medals']) ? $row['_medals'] : array();
    }
    if (array_key_exists('_floor_decoration', $row)) {
        $profile['floorDecoration'] = is_array($row['_floor_decoration'])
            ? $row['_floor_decoration']
            : floor_decoration_empty();
    }
    if ($include_viewer_fields) {
        $profile['unreadMessages'] = intval(isset($row['newmsg']) ? $row['newmsg'] : 0);
    }
    return $profile;
}

function thread_detail_query_pack_viewer_state($thread_row, $board_row, $viewer, $rights, $bookmarked) {
    $need = intval(isset($board_row['need']) ? $board_row['need'] : 0);
    $viewer_star = $viewer ? intval($viewer['star']) : 0;
    $viewer_rights = $viewer ? intval($viewer['rights']) : -1;
    $logged_in = $viewer ? true : false;
    $can_reply = $logged_in && intval($thread_row['locked']) === 0;
    if ($can_reply && $viewer_rights <= 1 && $viewer_star < $need) {
        $can_reply = false;
    }

    return array(
        'bookmarked' => $bookmarked,
        'canReply' => $can_reply,
        'canEdit' => $rights['canModerate'],
        'canGlobalPin' => $rights['canGlobalPin'],
        'canModerate' => $rights['canModerate'],
        'rightsCode' => $rights['code'],
        'requiredStar' => $need,
    );
}

function thread_detail_query_can_manage_author_content($author, $rights, $current_username) {
    if (!$current_username) {
        return false;
    }
    return $rights['canModerate'] || $author === $current_username;
}

function thread_detail_query_visible_ip($ip, $author, $rights, $current_username) {
    if ($rights['canModerate'] || ($current_username && $author === $current_username)) {
        return thread_detail_query_string($ip);
    }
    return '*.*.*.*';
}

function thread_detail_query_fetch_one($con, $statement) {
    $result = mysqli_query($con, $statement);
    if (!$result) {
        return false;
    }
    $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
    mysqli_free_result($result);
    return $row ? $row : null;
}

function thread_detail_query_fetch_all($con, $statement) {
    $result = mysqli_query($con, $statement);
    if (!$result) {
        return false;
    }
    $rows = array();
    while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
        $rows[] = $row;
    }
    mysqli_free_result($result);
    return $rows;
}

function thread_detail_query_format_timestamp($value) {
    $raw = trim(strval($value));
    if ($raw === '') {
        return '';
    }
    if (is_numeric($raw)) {
        $timestamp = intval($raw);
        if ($timestamp > 0) {
            return date('Y-m-d H:i:s', $timestamp);
        }
    }
    return $raw;
}

function thread_detail_query_format_date($value) {
    $raw = trim(strval($value));
    if ($raw === '') {
        return '';
    }
    if (preg_match('/^\d{4}-\d{1,2}-\d{1,2}$/', $raw)) {
        return $raw . ' 00:00:00';
    }
    return thread_detail_query_format_timestamp($raw);
}

function thread_detail_query_string($value) {
    if ($value === null) {
        return '';
    }
    return strval($value);
}

function thread_detail_query_translate_icon($icon) {
    if (is_numeric($icon) || is_numeric(substr($icon, 1))) {
        return '/bbsimg/i/' . $icon . '.gif';
    }
    return $icon;
}

function thread_detail_query_translate_for_quote($raw, $is_html) {
    $html = thread_detail_query_string($raw);
    if (!$is_html) {
        $html = htmlspecialchars_decode($html);
    }
    $html = str_replace(chr(10) . '<br>', '<br>', $html);
    $html = str_replace(chr(10), '<br>', $html);
    $html = str_replace(chr(13), '<br>', $html);
    if (!$is_html) {
        $html = str_replace(' ', '&nbsp;', $html);
    }
    return thread_detail_query_render_bbcode($html, true);
}

function thread_detail_query_translate($raw, $is_html, $space = true) {
    $html = thread_detail_query_string($raw);
    if (!$is_html) {
        $html = htmlspecialchars_decode($html);
    }
    $html = str_replace(chr(10) . '<br>', '<br>', $html);
    $html = str_replace(chr(10), '<br>', $html);
    $html = str_replace(chr(13), '<br>', $html);
    if (!$space) {
        $html = str_replace(' ', '&nbsp;', $html);
    }
    return thread_detail_query_render_bbcode($html, false);
}

/**
 * Render the BBCode dialect used by legacy posts and signatures.
 *
 * The parser deliberately keeps an opening tag active until its matching
 * closing tag or the end of the content. This mirrors how browsers recover
 * from unclosed HTML while avoiding byte-wise regex matches that can split a
 * UTF-8 character. Mismatched inner tags are closed at the current closing
 * tag, and unmatched closing tags remain visible as literal text.
 */
function thread_detail_query_render_bbcode($html, $for_quote) {
    $root = array(
        'type' => 'tag',
        'tag' => 'root',
        'argument' => null,
        'children' => array(),
    );
    $stack = array();
    $stack[] =& $root;
    $pattern = '#\[(/?)(img|quote|size|font|color|at|url|b|i)(?:=([^\]\r\n]*))?\]#iu';
    $match_count = preg_match_all($pattern, $html, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);

    if ($match_count === false) {
        return $html;
    }

    $cursor = 0;
    foreach ($matches as $match) {
        $token = $match[0][0];
        $token_offset = $match[0][1];
        if ($token_offset > $cursor) {
            thread_detail_query_bbcode_append_text($stack, substr($html, $cursor, $token_offset - $cursor));
        }

        $closing = $match[1][0] === '/';
        $tag = strtolower($match[2][0]);
        $argument = isset($match[3]) && $match[3][1] >= 0 ? $match[3][0] : null;

        if ($closing) {
            $open_index = -1;
            if ($argument === null) {
                for ($index = count($stack) - 1; $index >= 1; $index--) {
                    if ($stack[$index]['tag'] === $tag) {
                        $open_index = $index;
                        break;
                    }
                }
            }

            if ($open_index < 0) {
                thread_detail_query_bbcode_append_text($stack, $token);
            } else {
                while (count($stack) - 1 >= $open_index) {
                    array_pop($stack);
                }
            }
        } elseif (!thread_detail_query_bbcode_valid_opening($tag, $argument)) {
            thread_detail_query_bbcode_append_text($stack, $token);
        } else {
            $current =& $stack[count($stack) - 1];
            $current['children'][] = array(
                'type' => 'tag',
                'tag' => $tag,
                'argument' => $argument,
                'children' => array(),
            );
            $child_index = count($current['children']) - 1;
            $stack[] =& $current['children'][$child_index];
            unset($current);
        }

        $cursor = $token_offset + strlen($token);
    }

    if ($cursor < strlen($html)) {
        thread_detail_query_bbcode_append_text($stack, substr($html, $cursor));
    }

    return thread_detail_query_render_bbcode_children($root['children'], $for_quote);
}

function thread_detail_query_bbcode_valid_opening($tag, $argument) {
    if (in_array($tag, array('quote', 'size', 'font', 'color'), true)) {
        return $argument !== null && $argument !== '';
    }
    if ($tag === 'url') {
        return $argument === null || $argument !== '';
    }
    return $argument === null;
}

function thread_detail_query_bbcode_append_text(&$stack, $text) {
    if ($text === '') {
        return;
    }
    $current =& $stack[count($stack) - 1];
    $current['children'][] = array(
        'type' => 'text',
        'value' => $text,
    );
    unset($current);
}

function thread_detail_query_render_bbcode_children($children, $for_quote) {
    $html = '';
    foreach ($children as $child) {
        if ($child['type'] === 'text') {
            $html .= $child['value'];
            continue;
        }

        $content = thread_detail_query_render_bbcode_children($child['children'], $for_quote);
        $text_content = thread_detail_query_bbcode_text_content($child['children']);
        $argument = $child['argument'];
        switch ($child['tag']) {
            case 'img':
                $html .= "<img src='$text_content'>";
                break;
            case 'quote':
                if (!$for_quote) {
                    $html .= "<div class='quotel'><div class='quoter'>引用自 <a class='author' href='../user?name=$argument' target='_blank'>$argument</a> ：<br>$content<br></div><br></div>";
                }
                break;
            case 'size':
                $html .= "<font size='$argument'>$content</font>";
                break;
            case 'font':
                $html .= "<font face='$argument'>$content</font>";
                break;
            case 'color':
                $html .= "<font color='$argument'>$content</font>";
                break;
            case 'at':
                $html .= "<a class='author' href='../user?name=$text_content' target='_blank'>@$content</a>";
                break;
            case 'url':
                $href = $argument === null ? $text_content : $argument;
                $html .= "<a href='$href' class='link' target='_blank'>$content</a>";
                break;
            case 'b':
                $html .= "<b>$content</b>";
                break;
            case 'i':
                $html .= "<i>$content</i>";
                break;
            default:
                $html .= $content;
                break;
        }
    }
    return $html;
}

function thread_detail_query_bbcode_text_content($children) {
    $text = '';
    foreach ($children as $child) {
        if ($child['type'] === 'text') {
            $text .= $child['value'];
        } else {
            $text .= thread_detail_query_bbcode_text_content($child['children']);
        }
    }
    return $text;
}
