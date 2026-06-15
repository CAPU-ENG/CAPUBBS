<?php
/**
 * Aggregated thread-detail payload for the new forum UI.
 *
 * This file is intentionally side-effect-light: api.php owns headers, DB
 * connection, cookie extraction and response wrapping. The handler below only
 * returns the usual dispatch array shape.
 */

require_once __DIR__ . '/../../src/Bootstrap.php';

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
    $render = thread_detail_query_render_param($params);

    $current_username = thread_detail_query_current_username($con, $token);
    $viewer = thread_detail_query_get_viewer($con, $current_username);

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

    thread_detail_query_record_view($con, $bid, $tid, $current_username, $ip);
    $thread_row['click'] = intval($thread_row['click']) + 1;

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
    $profiles_by_username = thread_detail_query_get_profiles_by_username($con, $authors);
    $rights = thread_detail_query_get_board_rights($board_row, $viewer);
    $favorite_count = thread_detail_query_get_favorite_count($con, $bid, $tid);
    $bookmarked = $current_username ? thread_detail_query_is_favorite($con, $current_username, $bid, $tid) : false;
    $activity = thread_detail_query_get_activity($con, $bid, $tid);

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
        ),
        'board' => thread_detail_query_pack_board($board_row),
        'thread' => thread_detail_query_pack_thread($thread_row, $board_row, $favorite_count, $activity),
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
        'viewerState' => thread_detail_query_pack_viewer_state($thread_row, $board_row, $viewer, $rights, $bookmarked),
    );

    return array(array('code' => '0'), $payload);
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
    $row = capubbs_user_repository($con)->findByToken($token);
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
    return capubbs_thread_repository($con)->findDetailedByBidTid($bid, $tid);
}

function thread_detail_query_get_board($con, $bid) {
    return capubbs_board_repository($con)->findByBid($bid);
}

function thread_detail_query_get_viewer($con, $username) {
    if (!$username) {
        return null;
    }
    $row = capubbs_user_repository($con)->findRawUserByUsername($username);
    if (!$row || $row === false) {
        return null;
    }
    return thread_detail_query_pack_profile($row, true);
}

function thread_detail_query_record_view($con, $bid, $tid, $username, $ip) {
    capubbs_thread_read_service($con)->recordThreadView($bid, $tid, $username, $ip, true);
}

function thread_detail_query_count_author_floors($con, $bid, $tid, $author) {
    $num = capubbs_post_repository($con)->countByAuthorInThread($bid, $tid, $author);
    return max(1, intval($num));
}

function thread_detail_query_get_page_posts($con, $bid, $tid, $page, $author) {
    return capubbs_post_repository($con)->findByThreadPage($bid, $tid, $page, THREAD_DETAIL_QUERY_PAGE_SIZE, $author);
}

function thread_detail_query_get_post($con, $bid, $tid, $pid) {
    return capubbs_post_repository($con)->findByBidTidPid($bid, $tid, $pid);
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

function thread_detail_query_get_profiles_by_username($con, $usernames) {
    return capubbs_user_repository($con)->findRawUsersByUsernames($usernames);
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

function thread_detail_query_get_favorite_count($con, $bid, $tid) {
    $row = thread_detail_query_fetch_one($con, "select count(*) as num from favorites where bid=$bid and tid=$tid");
    return intval($row && $row !== false ? $row['num'] : 0);
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
        'raw' => thread_detail_query_strip_numeric_keys($row),
    );
}

function thread_detail_query_pack_thread($row, $board_row, $favorite_count, $activity) {
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
        'favorites' => $favorite_count,
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
        'raw' => thread_detail_query_strip_numeric_keys($row),
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
        'raw' => thread_detail_query_strip_numeric_keys($row),
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
            'contentHtml' => nl2br(htmlspecialchars($text, ENT_QUOTES, 'UTF-8')),
            'createdAt' => thread_detail_query_format_timestamp(isset($row['time']) ? $row['time'] : ''),
            'canDelete' => thread_detail_query_can_manage_author_content($author, $rights, $current_username),
            'raw' => thread_detail_query_strip_numeric_keys($row),
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

function thread_detail_query_strip_numeric_keys($row) {
    $clean = array();
    foreach ($row as $key => $value) {
        if (is_int($key)) {
            continue;
        }
        if ($key === 'password' || $key === 'token' || $key === 'tokentime') {
            continue;
        }
        $clean[$key] = $value;
    }
    return $clean;
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
    $html = preg_replace("#(\\[img])(.+?)(\\[/img])#", "<img src='$2'>", $html);
    $html = preg_replace("#(\\[quote=)(.+?)(])([\\s\\S]+?)(\\[/quote])#", '', $html);
    $html = preg_replace("#(\\[size=)(.+?)(])([\\s\\S]+?)(\\[/size])#", "<font size='$2'>$4</font>", $html);
    $html = preg_replace("#(\\[font=)(.+?)(])([\\s\\S]+?)(\\[/font])#", "<font face='$2'>$4</font>", $html);
    $html = preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)(\\[/color])#", "<font color='$2'>$4</font>", $html);
    $html = preg_replace("#(\\[at])(.+?)(\\[/at])#", "<a class='author' href='../user?name=$2' target='_blank'>@$2</a>", $html);
    $html = preg_replace("#(\\[url])(.+?)(\\[/url])#", "<a href='$2' class='link' target='_blank'>$2</a>", $html);
    $html = preg_replace("#(\\[url=)(.+?)(])([\\s\\S]+?)(\\[/url])#", "<a href='$2' class='link' target='_blank'>$4</a>", $html);
    $html = preg_replace("#(\\[b])(.+?)(\\[/b])#", '<b>$2</b>', $html);
    $html = preg_replace("#(\\[i])(.+?)(\\[/i])#", '<i>$2</i>', $html);
    return $html;
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
    $html = preg_replace("#(\\[img])(.+?)(\\[/img])#", "<img src='$2'>", $html);
    $quote = "<div class='quotel'><div class='quoter'>引用自 <a class='author' href='../user?name=$2' target='_blank'>$2</a> ：<br>$4<br></div><br></div>";
    $html = preg_replace("#(\\[quote=)(.+?)(])([\\s\\S]+?)(\\[/quote])#", $quote, $html);
    $html = preg_replace("#(\\[size=)(.+?)(])([\\s\\S]+?)(\\[/size])#", "<font size='$2'>$4</font>", $html);
    $html = preg_replace("#(\\[font=)(.+?)(])([\\s\\S]+?)(\\[/font])#", "<font face='$2'>$4</font>", $html);
    $html = preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)(\\[/color])#", "<font color='$2'>$4</font>", $html);
    $html = preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)#", "<font color='$2'>$4</font>", $html);
    $html = preg_replace("#(\\[at])(.+?)(\\[/at])#", "<a class='author' href='../user?name=$2' target='_blank'>@$2</a>", $html);
    $html = preg_replace("#(\\[url])(.+?)(\\[/url])#", "<a href='$2' class='link' target='_blank'>$2</a>", $html);
    $html = preg_replace("#(\\[url=)(.+?)(])([\\s\\S]+?)(\\[/url])#", "<a href='$2' class='link' target='_blank'>$4</a>", $html);
    $html = preg_replace("#(\\[b])(.+?)(\\[/b])#", '<b>$2</b>', $html);
    $html = preg_replace("#(\\[i])(.+?)(\\[/i])#", '<i>$2</i>', $html);
    return $html;
}
