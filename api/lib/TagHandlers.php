<?php
/**
 * Tag definition and member-assignment handlers for the new forum API.
 *
 * The dispatch layer owns authentication and permission middleware. These
 * handlers validate request data, execute tag queries, and return legacy
 * dispatch arrays for ApiResponse::fromDispatchResult().
 */

if (!defined('TAG_API_MAX_BATCH')) {
    define('TAG_API_MAX_BATCH', 200);
}

if (!defined('TAG_API_MAX_USER_LOOKUP')) {
    define('TAG_API_MAX_USER_LOOKUP', 100);
}

if (!defined('TAG_API_MAX_PAGE_SIZE')) {
    define('TAG_API_MAX_PAGE_SIZE', 100);
}

if (!defined('TAG_API_MAX_EXPRESSION_LENGTH')) {
    define('TAG_API_MAX_EXPRESSION_LENGTH', 8192);
}

if (!defined('TAG_API_MAX_EXPRESSION_NODES')) {
    define('TAG_API_MAX_EXPRESSION_NODES', 64);
}

if (!defined('TAG_API_MAX_EXPRESSION_DEPTH')) {
    define('TAG_API_MAX_EXPRESSION_DEPTH', 6);
}

function jiekoufunc_tag_list($con, $params = array()) {
    $statement = "
        SELECT
            t.id,
            t.name,
            t.color,
            t.created_at,
            t.updated_at,
            COUNT(m.username) AS member_count
        FROM user_tags AS t
        LEFT JOIN user_tag_members AS m ON m.tag_id=t.id
        GROUP BY t.id, t.name, t.color, t.created_at, t.updated_at
        ORDER BY t.created_at ASC, t.id ASC";
    $result = mysqli_query($con, $statement);
    if (!$result) {
        return jiekoufunc_report('8', '读取标签失败。');
    }

    $items = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = jiekoufunc_tag_pack_definition($row, true);
    }
    return jiekoufunc_tag_response(array(
        'items' => $items,
        'total' => count($items),
    ), count($items));
}

function jiekoufunc_tag_user_tags($con, $params) {
    $too_many = false;
    $usernames = jiekoufunc_tag_parse_usernames($params, 'usernames', $too_many);
    if (empty($usernames)) {
        return jiekoufunc_report('14', '缺少会员 ID。');
    }
    if ($too_many || count($usernames) > TAG_API_MAX_USER_LOOKUP) {
        return jiekoufunc_report('14', '一次最多查询 100 个会员。');
    }

    $escaped = array();
    $items = array();
    foreach ($usernames as $username) {
        $escaped[] = "'" . mysqli_real_escape_string($con, $username) . "'";
        $items[jiekoufunc_tag_username_key($username)] = array(
            'username' => $username,
            'tags' => array(),
        );
    }

    $statement = "
        SELECT m.username, t.id, t.name, t.color, m.added_at
        FROM user_tag_members AS m
        INNER JOIN user_tags AS t ON t.id=m.tag_id
        WHERE m.username IN (" . implode(',', $escaped) . ")
        ORDER BY m.username ASC, m.added_at DESC, t.id ASC";
    $result = mysqli_query($con, $statement);
    if (!$result) {
        return jiekoufunc_report('8', '读取会员标签失败。');
    }

    while ($row = mysqli_fetch_assoc($result)) {
        $key = jiekoufunc_tag_username_key($row['username']);
        if (!isset($items[$key])) {
            $items[$key] = array(
                'username' => $row['username'],
                'tags' => array(),
            );
        }
        $items[$key]['username'] = $row['username'];
        $items[$key]['tags'][] = jiekoufunc_tag_pack_assignment($row);
    }

    $ordered = array();
    foreach ($usernames as $username) {
        $key = jiekoufunc_tag_username_key($username);
        if (isset($items[$key])) {
            $ordered[] = $items[$key];
        }
    }
    return jiekoufunc_tag_response(array(
        'items' => $ordered,
        'total' => count($ordered),
    ), count($ordered));
}

function jiekoufunc_tag_summary($con, $params) {
    $expression = null;
    $expression_ids = array();
    $include_ids = array();
    $exclude_ids = array();

    if (array_key_exists('tag_expression', $params)) {
        $expression_error = '';
        $expression = jiekoufunc_tag_parse_expression(
            $params['tag_expression'],
            $expression_ids,
            $expression_error
        );
        if ($expression === false) {
            return jiekoufunc_report('14', $expression_error);
        }
    } else {
        $invalid_ids = false;
        $include_ids = jiekoufunc_tag_parse_ids(isset($params['include_tag_ids']) ? $params['include_tag_ids'] : array(), $invalid_ids);
        $exclude_ids = jiekoufunc_tag_parse_ids(isset($params['exclude_tag_ids']) ? $params['exclude_tag_ids'] : array(), $invalid_ids);
        if ($invalid_ids) {
            return jiekoufunc_report('14', '标签筛选 ID 无效。');
        }
    }

    $requested_ids = $expression !== null
        ? $expression_ids
        : array_values(array_unique(array_merge($include_ids, $exclude_ids)));
    if (!empty($requested_ids)) {
        $existing_ids = jiekoufunc_tag_existing_ids($con, $requested_ids);
        if ($existing_ids === false) {
            return jiekoufunc_report('8', '读取标签失败。');
        }
        if (count($existing_ids) !== count($requested_ids)) {
            return jiekoufunc_report('3', '筛选标签不存在。');
        }
    }

    $where = array();
    $added_expression = 'MAX(m.added_at)';
    $having = '';
    if ($expression !== null) {
        $where[] = jiekoufunc_tag_expression_sql($expression, 'm.username');
    } elseif (!empty($exclude_ids)) {
        $exclude_clause = jiekoufunc_tag_id_list($exclude_ids);
        $where[] = "NOT EXISTS (
            SELECT 1 FROM user_tag_members AS excluded_members
            WHERE excluded_members.username=m.username
              AND excluded_members.tag_id IN ($exclude_clause)
        )";
    }

    if ($expression === null && !empty($include_ids)) {
        $include_clause = jiekoufunc_tag_id_list($include_ids);
        $added_expression = "MAX(CASE WHEN m.tag_id IN ($include_clause) THEN m.added_at ELSE 0 END)";
        $having = " HAVING COUNT(DISTINCT CASE WHEN m.tag_id IN ($include_clause) THEN m.tag_id END)=" . count($include_ids);
    }

    $where_sql = empty($where) ? '' : 'WHERE ' . implode(' AND ', $where);
    $statement = "
        SELECT m.username, $added_expression AS added_at, u.icon
        FROM user_tag_members AS m
        LEFT JOIN userinfo AS u ON u.username=m.username
        $where_sql
        GROUP BY m.username, u.icon
        $having
        ORDER BY m.username ASC";
    $result = mysqli_query($con, $statement);
    if (!$result) {
        return jiekoufunc_report('8', '查询标签汇总失败。');
    }

    $items = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = array(
            'username' => $row['username'],
            'avatar' => jiekoufunc_tag_avatar(isset($row['icon']) ? $row['icon'] : ''),
            'added_at' => intval($row['added_at']),
            'profile_url' => '/users/' . rawurlencode($row['username']),
        );
    }
    return jiekoufunc_tag_response(array(
        'items' => $items,
        'total' => count($items),
    ), count($items));
}

function jiekoufunc_management_tag_create($con, $token, $params) {
    $name = jiekoufunc_tag_validate_name(isset($params['name']) ? $params['name'] : '');
    if ($name === false) {
        return jiekoufunc_report('14', '标签名称必须为 1 至 50 个字符。');
    }
    $color = jiekoufunc_tag_validate_color(isset($params['color']) ? $params['color'] : '');
    if ($color === false) {
        return jiekoufunc_report('14', '标签颜色必须为 #RRGGBB 格式。');
    }
    $operator = jiekoufunc_tag_operator($con, $token);
    if ($operator === '') {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }

    $now = time();
    $name_escaped = mysqli_real_escape_string($con, $name);
    $color_escaped = mysqli_real_escape_string($con, $color);
    $operator_escaped = mysqli_real_escape_string($con, $operator);
    $statement = "INSERT INTO user_tags
        (name, color, created_at, updated_at, created_by, updated_by)
        VALUES ('$name_escaped', '$color_escaped', $now, $now, '$operator_escaped', '$operator_escaped')";
    if (!mysqli_query($con, $statement)) {
        if (jiekoufunc_tag_is_duplicate_error($con)) {
            return jiekoufunc_report('14', '标签名称已经存在。');
        }
        return jiekoufunc_report('8', '创建标签失败。');
    }

    $tag = jiekoufunc_tag_find($con, intval(mysqli_insert_id($con)));
    if (!$tag) {
        return jiekoufunc_report('8', '创建标签后读取失败。');
    }
    return jiekoufunc_tag_response(jiekoufunc_tag_pack_definition($tag, false));
}

function jiekoufunc_management_tag_update($con, $token, $params) {
    $tag_id = jiekoufunc_tag_param_id($params);
    if ($tag_id <= 0) {
        return jiekoufunc_report('14', '缺少有效的标签 ID。');
    }
    $tag = jiekoufunc_tag_find($con, $tag_id);
    if (!$tag) {
        return jiekoufunc_report('3', '标签不存在。');
    }

    $has_name = array_key_exists('name', $params);
    $has_color = array_key_exists('color', $params);
    if (!$has_name && !$has_color) {
        return jiekoufunc_report('14', '没有需要更新的标签内容。');
    }

    $name = $tag['name'];
    if ($has_name) {
        $name = jiekoufunc_tag_validate_name($params['name']);
        if ($name === false) {
            return jiekoufunc_report('14', '标签名称必须为 1 至 50 个字符。');
        }
    }
    $color = $tag['color'];
    if ($has_color) {
        $color = jiekoufunc_tag_validate_color($params['color']);
        if ($color === false) {
            return jiekoufunc_report('14', '标签颜色必须为 #RRGGBB 格式。');
        }
    }

    $operator = jiekoufunc_tag_operator($con, $token);
    if ($operator === '') {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }
    $name_escaped = mysqli_real_escape_string($con, $name);
    $color_escaped = mysqli_real_escape_string($con, $color);
    $operator_escaped = mysqli_real_escape_string($con, $operator);
    $statement = "UPDATE user_tags SET
        name='$name_escaped', color='$color_escaped', updated_at=" . time() . ", updated_by='$operator_escaped'
        WHERE id=$tag_id";
    if (!mysqli_query($con, $statement)) {
        if (jiekoufunc_tag_is_duplicate_error($con)) {
            return jiekoufunc_report('14', '标签名称已经存在。');
        }
        return jiekoufunc_report('8', '更新标签失败。');
    }

    $updated = jiekoufunc_tag_find($con, $tag_id);
    if (!$updated) {
        return jiekoufunc_report('8', '更新标签后读取失败。');
    }
    return jiekoufunc_tag_response(jiekoufunc_tag_pack_definition($updated, false));
}

function jiekoufunc_management_tag_delete($con, $token, $params) {
    $tag_id = jiekoufunc_tag_param_id($params);
    if ($tag_id <= 0) {
        return jiekoufunc_report('14', '缺少有效的标签 ID。');
    }
    $tag = jiekoufunc_tag_find($con, $tag_id);
    if (!$tag) {
        return jiekoufunc_report('3', '标签不存在。');
    }

    $count_row = mysqli_fetch_assoc(mysqli_query($con,
        "SELECT COUNT(*) AS member_count FROM user_tag_members WHERE tag_id=$tag_id"));
    $member_count = $count_row ? intval($count_row['member_count']) : 0;
    mysqli_begin_transaction($con);
    if (!mysqli_query($con, "DELETE FROM user_tags WHERE id=$tag_id")) {
        mysqli_rollback($con);
        return jiekoufunc_report('8', '删除标签失败。');
    }
    mysqli_commit($con);

    return jiekoufunc_tag_response(array(
        'tag_id' => $tag_id,
        'deleted_members' => $member_count,
    ));
}

function jiekoufunc_management_tag_members($con, $params) {
    $tag_id = jiekoufunc_tag_param_id($params);
    if ($tag_id <= 0) {
        return jiekoufunc_report('14', '缺少有效的标签 ID。');
    }
    if (!jiekoufunc_tag_find($con, $tag_id)) {
        return jiekoufunc_report('3', '标签不存在。');
    }

    $page = max(1, intval(isset($params['page']) ? $params['page'] : 1));
    $page_size = intval(isset($params['page_size']) ? $params['page_size'] : TAG_API_MAX_PAGE_SIZE);
    $page_size = max(1, min(TAG_API_MAX_PAGE_SIZE, $page_size));
    $keyword = isset($params['keyword']) ? trim(strval($params['keyword'])) : '';
    $where = "m.tag_id=$tag_id";
    if ($keyword !== '') {
        $keyword_escaped = mysqli_real_escape_string($con, $keyword);
        $where .= " AND m.username LIKE '%$keyword_escaped%'";
    }

    $count_result = mysqli_query($con, "SELECT COUNT(*) AS total FROM user_tag_members AS m WHERE $where");
    if (!$count_result) {
        return jiekoufunc_report('8', '读取标签会员数量失败。');
    }
    $count_row = mysqli_fetch_assoc($count_result);
    $total = intval($count_row['total']);
    $offset = ($page - 1) * $page_size;
    $statement = "
        SELECT m.username, m.added_at, u.icon
        FROM user_tag_members AS m
        LEFT JOIN userinfo AS u ON u.username=m.username
        WHERE $where
        ORDER BY m.added_at DESC, m.username ASC
        LIMIT $offset, $page_size";
    $result = mysqli_query($con, $statement);
    if (!$result) {
        return jiekoufunc_report('8', '读取标签会员失败。');
    }

    $items = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = array(
            'username' => $row['username'],
            'avatar' => jiekoufunc_tag_avatar(isset($row['icon']) ? $row['icon'] : ''),
            'added_at' => intval($row['added_at']),
            'profile_url' => '/users/' . rawurlencode($row['username']),
        );
    }
    return jiekoufunc_tag_response(array(
        'items' => $items,
        'tag_id' => $tag_id,
        'page' => $page,
        'page_size' => $page_size,
        'total' => $total,
    ), count($items));
}

function jiekoufunc_management_tag_member_check($con, $params) {
    $tag_id = jiekoufunc_tag_param_id($params);
    $username = isset($params['username']) ? trim(strval($params['username'])) : '';
    if ($tag_id <= 0 || $username === '') {
        return jiekoufunc_report('14', '缺少有效的标签 ID 或会员 ID。');
    }
    if (!jiekoufunc_tag_find($con, $tag_id)) {
        return jiekoufunc_report('3', '标签不存在。');
    }

    $username_escaped = mysqli_real_escape_string($con, $username);
    $member = mysqli_fetch_assoc(mysqli_query($con,
        "SELECT username, icon FROM userinfo WHERE username='$username_escaped' LIMIT 1"));
    if (!$member) {
        return jiekoufunc_tag_response(array(
            'tag_id' => $tag_id,
            'username' => $username,
            'state' => 'not_found',
            'member' => null,
            'added_at' => null,
        ));
    }

    $canonical_username = $member['username'];
    $canonical_escaped = mysqli_real_escape_string($con, $canonical_username);
    $assignment = mysqli_fetch_assoc(mysqli_query($con,
        "SELECT added_at FROM user_tag_members WHERE tag_id=$tag_id AND username='$canonical_escaped' LIMIT 1"));
    $member_data = array(
        'username' => $canonical_username,
        'avatar' => jiekoufunc_tag_avatar(isset($member['icon']) ? $member['icon'] : ''),
    );
    return jiekoufunc_tag_response(array(
        'tag_id' => $tag_id,
        'username' => $canonical_username,
        'state' => $assignment ? 'already_added' : 'available',
        'member' => $member_data,
        'added_at' => $assignment ? intval($assignment['added_at']) : null,
    ));
}

function jiekoufunc_management_tag_members_add($con, $token, $params) {
    $tag_id = jiekoufunc_tag_param_id($params);
    if ($tag_id <= 0) {
        return jiekoufunc_report('14', '缺少有效的标签 ID。');
    }
    $tag = jiekoufunc_tag_find($con, $tag_id);
    if (!$tag) {
        return jiekoufunc_report('3', '标签不存在。');
    }

    $too_many = false;
    $usernames = jiekoufunc_tag_parse_usernames($params, 'usernames', $too_many);
    if (empty($usernames)) {
        return jiekoufunc_report('14', '至少需要一个会员 ID。');
    }
    if ($too_many || count($usernames) > TAG_API_MAX_BATCH) {
        return jiekoufunc_report('14', '一次最多添加 200 个会员。');
    }
    $operator = jiekoufunc_tag_operator($con, $token);
    if ($operator === '') {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }

    $escaped = array();
    foreach ($usernames as $username) {
        $escaped[] = "'" . mysqli_real_escape_string($con, $username) . "'";
    }
    $member_result = mysqli_query($con,
        "SELECT username, icon FROM userinfo WHERE username IN (" . implode(',', $escaped) . ")");
    if (!$member_result) {
        return jiekoufunc_report('8', '检查会员失败。');
    }
    $members = array();
    while ($row = mysqli_fetch_assoc($member_result)) {
        $members[jiekoufunc_tag_username_key($row['username'])] = $row;
    }

    $existing_result = mysqli_query($con,
        "SELECT username, added_at FROM user_tag_members
         WHERE tag_id=$tag_id AND username IN (" . implode(',', $escaped) . ")");
    if (!$existing_result) {
        return jiekoufunc_report('8', '检查标签会员关系失败。');
    }
    $existing = array();
    while ($row = mysqli_fetch_assoc($existing_result)) {
        $existing[jiekoufunc_tag_username_key($row['username'])] = $row;
    }

    $results = array();
    $insertable = array();
    foreach ($usernames as $username) {
        $key = jiekoufunc_tag_username_key($username);
        if (!isset($members[$key])) {
            $results[$key] = array(
                'username' => $username,
                'status' => 'not_found',
                'added_at' => null,
            );
            continue;
        }
        $canonical_username = $members[$key]['username'];
        if (isset($existing[$key])) {
            $results[$key] = array(
                'username' => $canonical_username,
                'status' => 'already_added',
                'added_at' => intval($existing[$key]['added_at']),
            );
            continue;
        }
        $insertable[] = $canonical_username;
    }

    if (!empty($insertable)) {
        mysqli_begin_transaction($con);
        $operator_escaped = mysqli_real_escape_string($con, $operator);
        $notification = '为你添加了“' . $tag['name'] . '”标签，可前往个人中心查看。';
        $added_usernames = array();
        $now = time();
        foreach ($insertable as $username) {
            $username_escaped = mysqli_real_escape_string($con, $username);
            $statement = "INSERT IGNORE INTO user_tag_members
                (tag_id, username, added_at, added_by)
                VALUES ($tag_id, '$username_escaped', $now, '$operator_escaped')";
            if (!mysqli_query($con, $statement)) {
                mysqli_rollback($con);
                return jiekoufunc_report('8', '批量添加标签会员失败。');
            }
            if (mysqli_affected_rows($con) === 1) {
                $added_usernames[] = $username;
                $results[jiekoufunc_tag_username_key($username)] = array(
                    'username' => $username,
                    'status' => 'added',
                    'added_at' => $now,
                );
            } else {
                $race = mysqli_fetch_assoc(mysqli_query($con,
                    "SELECT added_at FROM user_tag_members
                     WHERE tag_id=$tag_id AND username='$username_escaped' LIMIT 1"));
                $results[jiekoufunc_tag_username_key($username)] = array(
                    'username' => $username,
                    'status' => 'already_added',
                    'added_at' => $race ? intval($race['added_at']) : null,
                );
            }
        }
        mysqli_commit($con);

        $notification_failures = 0;
        foreach ($added_usernames as $username) {
            try {
                $notification_sent = jiekoufunc_insertmsg(
                    $con,
                    'system',
                    $username,
                    $notification,
                    0,
                    0,
                    0,
                    $operator,
                    $tag['name']
                );
            } catch (mysqli_sql_exception $error) {
                $notification_sent = false;
            }
            if (!$notification_sent) {
                $notification_failures++;
            }
        }
        if ($notification_failures > 0) {
            return jiekoufunc_report(
                '8',
                "标签已添加，但有{$notification_failures}位会员的系统通知发送失败。"
            );
        }
    }

    $ordered_results = array();
    $counts = array('added' => 0, 'already_added' => 0, 'not_found' => 0);
    foreach ($usernames as $username) {
        $key = jiekoufunc_tag_username_key($username);
        if (!isset($results[$key])) {
            continue;
        }
        $item = $results[$key];
        $ordered_results[] = $item;
        if (isset($counts[$item['status']])) {
            $counts[$item['status']]++;
        }
    }
    return jiekoufunc_tag_response(array(
        'tag_id' => $tag_id,
        'results' => $ordered_results,
        'counts' => $counts,
    ), count($ordered_results));
}

function jiekoufunc_management_tag_member_remove($con, $params) {
    $tag_id = jiekoufunc_tag_param_id($params);
    $username = isset($params['username']) ? trim(strval($params['username'])) : '';
    if ($tag_id <= 0 || $username === '') {
        return jiekoufunc_report('14', '缺少有效的标签 ID 或会员 ID。');
    }
    if (!jiekoufunc_tag_find($con, $tag_id)) {
        return jiekoufunc_report('3', '标签不存在。');
    }

    $username_escaped = mysqli_real_escape_string($con, $username);
    $statement = "DELETE FROM user_tag_members WHERE tag_id=$tag_id AND username='$username_escaped'";
    if (!mysqli_query($con, $statement)) {
        return jiekoufunc_report('8', '移除标签会员失败。');
    }
    return jiekoufunc_tag_response(array(
        'tag_id' => $tag_id,
        'username' => $username,
        'removed' => mysqli_affected_rows($con) === 1,
    ));
}

function jiekoufunc_tag_response($data, $count = null) {
    $status = array('code' => '0', 'msg' => 'ok');
    if ($count !== null) {
        $status['count'] = strval($count);
    } else {
        $status['count'] = '1';
    }
    return array($status, $data);
}

function jiekoufunc_tag_pack_definition($row, $include_count) {
    $tag = array(
        'id' => intval($row['id']),
        'name' => strval($row['name']),
        'color' => strtoupper(strval($row['color'])),
        'created_at' => intval($row['created_at']),
        'updated_at' => intval($row['updated_at']),
    );
    if ($include_count) {
        $tag['member_count'] = intval(isset($row['member_count']) ? $row['member_count'] : 0);
    }
    return $tag;
}

function jiekoufunc_tag_pack_assignment($row) {
    return array(
        'id' => intval($row['id']),
        'name' => strval($row['name']),
        'color' => strtoupper(strval($row['color'])),
        'added_at' => intval($row['added_at']),
    );
}

function jiekoufunc_tag_find($con, $tag_id) {
    $tag_id = intval($tag_id);
    if ($tag_id <= 0) {
        return null;
    }
    $result = mysqli_query($con, "SELECT id, name, color, created_at, updated_at, created_by, updated_by FROM user_tags WHERE id=$tag_id LIMIT 1");
    if (!$result) {
        return null;
    }
    return mysqli_fetch_assoc($result);
}

function jiekoufunc_tag_existing_ids($con, $ids) {
    if (empty($ids)) {
        return array();
    }
    $result = mysqli_query($con,
        "SELECT id FROM user_tags WHERE id IN (" . jiekoufunc_tag_id_list($ids) . ")");
    if (!$result) {
        return false;
    }
    $existing = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $existing[] = intval($row['id']);
    }
    sort($existing, SORT_NUMERIC);
    return $existing;
}

function jiekoufunc_tag_id_list($ids) {
    $values = array();
    foreach ($ids as $id) {
        $id = intval($id);
        if ($id > 0) {
            $values[] = $id;
        }
    }
    return implode(',', $values);
}

function jiekoufunc_tag_parse_expression($value, &$tag_ids, &$error) {
    $tag_ids = array();
    $error = '';
    if (!is_string($value)) {
        $error = '标签表达式格式无效。';
        return false;
    }

    $json = trim($value);
    if ($json === '' || strlen($json) > TAG_API_MAX_EXPRESSION_LENGTH) {
        $error = $json === '' ? '标签表达式不能为空。' : '标签表达式过长。';
        return false;
    }

    $decoded = json_decode($json, true);
    if (!is_array($decoded) || json_last_error() !== JSON_ERROR_NONE) {
        $error = '标签表达式格式无效。';
        return false;
    }

    $state = array('nodes' => 0);
    $expression = jiekoufunc_tag_normalize_expression_node($decoded, 0, $state, $tag_ids, $error);
    if ($expression === false) {
        return false;
    }
    $tag_ids = array_values(array_unique($tag_ids));
    sort($tag_ids, SORT_NUMERIC);
    return $expression;
}

function jiekoufunc_tag_normalize_expression_node($node, $depth, &$state, &$tag_ids, &$error) {
    if (!is_array($node) || !isset($node['type']) || !is_string($node['type'])) {
        $error = '标签表达式节点格式无效。';
        return false;
    }
    $state['nodes']++;
    if ($state['nodes'] > TAG_API_MAX_EXPRESSION_NODES) {
        $error = '标签表达式条件过多。';
        return false;
    }
    if ($depth > TAG_API_MAX_EXPRESSION_DEPTH) {
        $error = '标签表达式括号嵌套过深。';
        return false;
    }

    $not = false;
    if (array_key_exists('not', $node)) {
        if (!is_bool($node['not'])) {
            $error = '标签表达式 NOT 值无效。';
            return false;
        }
        $not = $node['not'];
    }

    if ($node['type'] === 'tag') {
        if (!jiekoufunc_tag_expression_keys_valid($node, array('type', 'tag_id', 'not'))
            || !array_key_exists('tag_id', $node)) {
            $error = '标签表达式标签节点格式无效。';
            return false;
        }
        $tag_id_value = $node['tag_id'];
        if ((is_int($tag_id_value) && $tag_id_value > 0)
            || (is_string($tag_id_value) && preg_match('/^\d+$/', $tag_id_value))) {
            $tag_id = intval($tag_id_value);
        } else {
            $tag_id = 0;
        }
        if ($tag_id <= 0) {
            $error = '标签表达式标签 ID 无效。';
            return false;
        }
        $tag_ids[] = $tag_id;
        return array(
            'type' => 'tag',
            'tag_id' => $tag_id,
            'not' => $not,
        );
    }

    if ($node['type'] !== 'group'
        || !jiekoufunc_tag_expression_keys_valid($node, array('type', 'operator', 'not', 'children'))
        || !isset($node['operator'])
        || ($node['operator'] !== 'and' && $node['operator'] !== 'or')
        || !isset($node['children'])
        || !is_array($node['children'])
        || empty($node['children'])
        || !jiekoufunc_tag_expression_is_list($node['children'])) {
        $error = '标签表达式分组格式无效。';
        return false;
    }

    $children = array();
    foreach ($node['children'] as $child) {
        $normalized_child = jiekoufunc_tag_normalize_expression_node(
            $child,
            $depth + 1,
            $state,
            $tag_ids,
            $error
        );
        if ($normalized_child === false) {
            return false;
        }
        $children[] = $normalized_child;
    }
    return array(
        'type' => 'group',
        'operator' => $node['operator'],
        'not' => $not,
        'children' => $children,
    );
}

function jiekoufunc_tag_expression_keys_valid($node, $allowed_keys) {
    foreach (array_keys($node) as $key) {
        if (!in_array($key, $allowed_keys, true)) {
            return false;
        }
    }
    return true;
}

function jiekoufunc_tag_expression_is_list($value) {
    $expected = 0;
    foreach (array_keys($value) as $key) {
        if ($key !== $expected) {
            return false;
        }
        $expected++;
    }
    return true;
}

function jiekoufunc_tag_expression_sql($node, $username_expression) {
    if ($node['type'] === 'tag') {
        $tag_id = intval($node['tag_id']);
        $sql = "EXISTS (
            SELECT 1 FROM user_tag_members AS expression_members
            WHERE expression_members.username=$username_expression
              AND expression_members.tag_id=$tag_id
        )";
    } else {
        $clauses = array();
        foreach ($node['children'] as $child) {
            $clauses[] = jiekoufunc_tag_expression_sql($child, $username_expression);
        }
        $joiner = $node['operator'] === 'or' ? ' OR ' : ' AND ';
        $sql = '(' . implode($joiner, $clauses) . ')';
    }
    return !empty($node['not']) ? 'NOT (' . $sql . ')' : $sql;
}

function jiekoufunc_tag_param_id($params) {
    $value = isset($params['tag_id']) ? $params['tag_id'] : (isset($params['id']) ? $params['id'] : '');
    if (is_array($value) || !preg_match('/^\d+$/', trim(strval($value)))) {
        return 0;
    }
    return intval($value);
}

function jiekoufunc_tag_parse_ids($value, &$invalid = false) {
    $invalid = (bool) $invalid;
    if (is_array($value)) {
        $parts = $value;
    } else {
        $parts = preg_split('/[,\s]+/', trim(strval($value)), -1, PREG_SPLIT_NO_EMPTY);
    }
    $ids = array();
    foreach ($parts as $part) {
        $part = trim(strval($part));
        if ($part === '' || !preg_match('/^\d+$/', $part)) {
            $invalid = true;
            continue;
        }
        $id = intval($part);
        if ($id > 0 && !in_array($id, $ids, true)) {
            $ids[] = $id;
        }
    }
    return $ids;
}

function jiekoufunc_tag_parse_usernames($params, $field, &$too_many) {
    $too_many = false;
    if (isset($params[$field])) {
        $value = $params[$field];
    } elseif ($field === 'usernames' && isset($params['username'])) {
        $value = $params['username'];
    } else {
        return array();
    }
    $parts = is_array($value) ? $value : preg_split('/[,\r\n]+/', strval($value), -1, PREG_SPLIT_NO_EMPTY);
    $usernames = array();
    foreach ($parts as $part) {
        $username = trim(strval($part));
        if ($username === '') {
            continue;
        }
        $key = jiekoufunc_tag_username_key($username);
        $duplicate = false;
        foreach ($usernames as $existing) {
            if (jiekoufunc_tag_username_key($existing) === $key) {
                $duplicate = true;
                break;
            }
        }
        if (!$duplicate) {
            $usernames[] = $username;
        }
        if (count($usernames) > TAG_API_MAX_BATCH) {
            $too_many = true;
            break;
        }
    }
    return $usernames;
}

function jiekoufunc_tag_username_key($username) {
    $username = strval($username);
    return function_exists('mb_strtolower') ? mb_strtolower($username, 'UTF-8') : strtolower($username);
}

function jiekoufunc_tag_validate_name($value) {
    $name = trim(strval($value));
    $length = function_exists('mb_strlen') ? mb_strlen($name, 'UTF-8') : strlen($name);
    return ($length >= 1 && $length <= 50) ? $name : false;
}

function jiekoufunc_tag_validate_color($value) {
    $color = strtoupper(trim(strval($value)));
    return preg_match('/^#[0-9A-F]{6}$/', $color) ? $color : false;
}

function jiekoufunc_tag_operator($con, $token) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return '';
    }
    if (isset($user['username'])) {
        return strval($user['username']);
    }
    return isset($user[0]) ? strval($user[0]) : '';
}

function jiekoufunc_tag_is_duplicate_error($con) {
    return intval(mysqli_errno($con)) === 1062;
}

function jiekoufunc_tag_avatar($icon) {
    $icon = trim(strval($icon));
    if ($icon === '') {
        return '';
    }
    if (is_numeric($icon) || (strlen($icon) > 1 && is_numeric(substr($icon, 1)))) {
        return '/bbsimg/i/' . $icon . '.gif';
    }
    return $icon;
}
