<?php
/**
 * Medal definitions, assignments, preferences, and image processing.
 *
 * Authentication and management permissions are owned by dispatch.php. Public
 * profile and thread queries only call the read helpers at the end of this file.
 */

if (!defined('MEDAL_API_MAX_BATCH')) {
    define('MEDAL_API_MAX_BATCH', 200);
}
if (!defined('MEDAL_API_MAX_PAGE_SIZE')) {
    define('MEDAL_API_MAX_PAGE_SIZE', 100);
}
if (!defined('MEDAL_IMAGE_MAX_UPLOAD_BYTES')) {
    define('MEDAL_IMAGE_MAX_UPLOAD_BYTES', 16 * 1024 * 1024);
}
if (!defined('MEDAL_IMAGE_MAX_SOURCE_SIZE')) {
    define('MEDAL_IMAGE_MAX_SOURCE_SIZE', 8192);
}
if (!defined('MEDAL_IMAGE_LARGE_SIZE')) {
    define('MEDAL_IMAGE_LARGE_SIZE', 1024);
}
if (!defined('MEDAL_IMAGE_SMALL_SIZE')) {
    define('MEDAL_IMAGE_SMALL_SIZE', 96);
}
if (!defined('MEDAL_IMAGE_LARGE_MAX_BYTES')) {
    define('MEDAL_IMAGE_LARGE_MAX_BYTES', 1024 * 1024);
}
if (!defined('MEDAL_IMAGE_SMALL_MAX_BYTES')) {
    define('MEDAL_IMAGE_SMALL_MAX_BYTES', 64 * 1024);
}

function jiekoufunc_management_medal_list($con) {
    $result = medal_db_query($con,
        'SELECT id, name, texture_id, large_image_path, small_image_path,
                created_at, updated_at, created_by, updated_by
         FROM user_medals
         ORDER BY created_at DESC, id DESC');
    if (!$result) {
        return jiekoufunc_report('8', '读取勋章失败。');
    }

    $items = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = medal_pack_definition($row);
    }
    return medal_response(array('items' => $items, 'total' => count($items)), count($items));
}

function jiekoufunc_management_medal_create($con, $token, $params, $file) {
    $name = medal_validate_name(isset($params['name']) ? $params['name'] : '');
    if ($name === false) {
        return jiekoufunc_report('14', '勋章名称必须为 1 至 50 个字符。');
    }
    $texture_id = medal_validate_texture(isset($params['texture_id']) ? $params['texture_id'] : '');
    if ($texture_id === false) {
        return jiekoufunc_report('14', '勋章纹理无效。');
    }
    $operator = medal_operator($con, $token);
    if ($operator === '') {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }

    $image_error = '';
    $image_pair = medal_image_create_pair($file, $image_error);
    if ($image_pair === false) {
        return jiekoufunc_report('14', $image_error ?: '勋章图片处理失败。');
    }

    $name_escaped = mysqli_real_escape_string($con, $name);
    $texture_escaped = mysqli_real_escape_string($con, $texture_id);
    $large_path_escaped = mysqli_real_escape_string($con, $image_pair['large_image_path']);
    $small_path_escaped = mysqli_real_escape_string($con, $image_pair['small_image_path']);
    $operator_escaped = mysqli_real_escape_string($con, $operator);
    $now = time();
    $statement = "INSERT INTO user_medals
        (name, texture_id, large_image_path, small_image_path,
         created_at, updated_at, created_by, updated_by)
        VALUES
        ('$name_escaped', '$texture_escaped', '$large_path_escaped', '$small_path_escaped',
         $now, $now, '$operator_escaped', '$operator_escaped')";
    if (!medal_db_query($con, $statement)) {
        medal_image_delete_pair($image_pair['large_image_path'], $image_pair['small_image_path']);
        return jiekoufunc_report('8', '创建勋章失败。');
    }

    $medal = medal_find($con, intval(mysqli_insert_id($con)));
    if (!$medal) {
        return jiekoufunc_report('8', '创建勋章后读取失败。');
    }
    return medal_response(medal_pack_definition($medal));
}

function jiekoufunc_management_medal_update($con, $token, $params, $file) {
    $medal_id = medal_param_id($params);
    if ($medal_id <= 0) {
        return jiekoufunc_report('14', '缺少有效的勋章 ID。');
    }
    $medal = medal_find($con, $medal_id);
    if (!$medal) {
        return jiekoufunc_report('3', '勋章不存在。');
    }
    $operator = medal_operator($con, $token);
    if ($operator === '') {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }

    $has_name = array_key_exists('name', $params);
    $has_texture = array_key_exists('texture_id', $params);
    $has_image = medal_image_upload_present($file);
    if (!$has_name && !$has_texture && !$has_image) {
        return jiekoufunc_report('14', '没有需要更新的勋章内容。');
    }

    $name = strval($medal['name']);
    if ($has_name) {
        $name = medal_validate_name($params['name']);
        if ($name === false) {
            return jiekoufunc_report('14', '勋章名称必须为 1 至 50 个字符。');
        }
    }
    $texture_id = strval($medal['texture_id']);
    if ($has_texture) {
        $texture_id = medal_validate_texture($params['texture_id']);
        if ($texture_id === false) {
            return jiekoufunc_report('14', '勋章纹理无效。');
        }
    }

    $new_pair = null;
    if ($has_image) {
        $image_error = '';
        $new_pair = medal_image_create_pair($file, $image_error);
        if ($new_pair === false) {
            return jiekoufunc_report('14', $image_error ?: '勋章图片处理失败。');
        }
    }

    $large_path = $new_pair ? $new_pair['large_image_path'] : strval($medal['large_image_path']);
    $small_path = $new_pair ? $new_pair['small_image_path'] : strval($medal['small_image_path']);
    $name_escaped = mysqli_real_escape_string($con, $name);
    $texture_escaped = mysqli_real_escape_string($con, $texture_id);
    $large_path_escaped = mysqli_real_escape_string($con, $large_path);
    $small_path_escaped = mysqli_real_escape_string($con, $small_path);
    $operator_escaped = mysqli_real_escape_string($con, $operator);
    $now = time();
    $statement = "UPDATE user_medals SET
        name='$name_escaped',
        texture_id='$texture_escaped',
        large_image_path='$large_path_escaped',
        small_image_path='$small_path_escaped',
        updated_at=$now,
        updated_by='$operator_escaped'
        WHERE id=$medal_id";
    if (!medal_db_query($con, $statement)) {
        if ($new_pair) {
            medal_image_delete_pair($new_pair['large_image_path'], $new_pair['small_image_path']);
        }
        return jiekoufunc_report('8', '更新勋章失败。');
    }

    if ($new_pair) {
        $cleanup_ok = medal_image_delete_pair($medal['large_image_path'], $medal['small_image_path']);
        if (!$cleanup_ok) {
            error_log('CAPUBBS medal image cleanup failed after updating medal ' . $medal_id);
        }
    }
    $updated = medal_find($con, $medal_id);
    if (!$updated) {
        return jiekoufunc_report('8', '更新勋章后读取失败。');
    }
    return medal_response(medal_pack_definition($updated));
}

function jiekoufunc_management_medal_delete($con, $params) {
    $medal_id = medal_param_id($params);
    if ($medal_id <= 0) {
        return jiekoufunc_report('14', '缺少有效的勋章 ID。');
    }
    $medal = medal_find($con, $medal_id);
    if (!$medal) {
        return jiekoufunc_report('3', '勋章不存在。');
    }

    $count_result = medal_db_query($con,
        "SELECT COUNT(*) AS member_count FROM user_medal_members WHERE medal_id=$medal_id");
    if (!$count_result) {
        return jiekoufunc_report('8', '读取勋章成员数量失败。');
    }
    $count_row = mysqli_fetch_assoc($count_result);
    $member_count = intval($count_row ? $count_row['member_count'] : 0);

    if (!medal_db_query($con, "DELETE FROM user_medals WHERE id=$medal_id")) {
        return jiekoufunc_report('8', '删除勋章失败。');
    }
    $cleanup_ok = medal_image_delete_pair($medal['large_image_path'], $medal['small_image_path']);
    if (!$cleanup_ok) {
        error_log('CAPUBBS medal image cleanup failed after deleting medal ' . $medal_id);
    }
    return medal_response(array(
        'medal_id' => $medal_id,
        'member_count' => $member_count,
        'image_cleanup' => $cleanup_ok,
    ));
}

function jiekoufunc_management_medal_members($con, $params) {
    $medal_id = medal_param_id($params);
    if ($medal_id <= 0) {
        return jiekoufunc_report('14', '缺少有效的勋章 ID。');
    }
    if (!medal_find($con, $medal_id)) {
        return jiekoufunc_report('3', '勋章不存在。');
    }
    $page = medal_page_param($params, 'page', 1);
    $page_size = min(MEDAL_API_MAX_PAGE_SIZE, medal_page_param($params, 'page_size', 50));
    $offset = ($page - 1) * $page_size;

    $count_result = medal_db_query($con,
        "SELECT COUNT(*) AS total FROM user_medal_members WHERE medal_id=$medal_id");
    if (!$count_result) {
        return jiekoufunc_report('8', '读取勋章成员数量失败。');
    }
    $count_row = mysqli_fetch_assoc($count_result);
    $total = intval($count_row ? $count_row['total'] : 0);

    $statement = "SELECT m.username, m.activity_role, m.awarded_at, m.awarded_by,
            COALESCE(d.state, 'retain') AS display_state, u.icon
        FROM user_medal_members AS m
        LEFT JOIN user_medal_displays AS d
            ON d.medal_id=m.medal_id AND d.username=m.username
        LEFT JOIN userinfo AS u
            ON BINARY u.username=BINARY m.username
        WHERE m.medal_id=$medal_id
        ORDER BY m.awarded_at DESC, m.username ASC
        LIMIT $offset, $page_size";
    $result = medal_db_query($con, $statement);
    if (!$result) {
        return jiekoufunc_report('8', '读取勋章成员失败。');
    }

    $items = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $items[] = medal_pack_member($row);
    }
    return medal_response(array(
        'items' => $items,
        'medal_id' => $medal_id,
        'page' => $page,
        'page_size' => $page_size,
        'total' => $total,
    ), count($items));
}

function jiekoufunc_management_medal_members_check($con, $params) {
    $medal_id = medal_param_id($params);
    if ($medal_id <= 0) {
        return jiekoufunc_report('14', '缺少有效的勋章 ID。');
    }
    if (!medal_find($con, $medal_id)) {
        return jiekoufunc_report('3', '勋章不存在。');
    }
    $parse_error = '';
    $assignments = medal_parse_assignments($params, $parse_error);
    if ($assignments === false) {
        return jiekoufunc_report('14', $parse_error ?: '成员数据格式错误。');
    }
    $checks = medal_check_assignments($con, $medal_id, $assignments);
    if ($checks === false) {
        return jiekoufunc_report('8', '检查勋章成员失败。');
    }
    return medal_response(array(
        'items' => $checks,
        'medal_id' => $medal_id,
        'total' => count($checks),
    ), count($checks));
}

function jiekoufunc_management_medal_members_add($con, $token, $params) {
    $medal_id = medal_param_id($params);
    if ($medal_id <= 0) {
        return jiekoufunc_report('14', '缺少有效的勋章 ID。');
    }
    $medal = medal_find($con, $medal_id);
    if (!$medal) {
        return jiekoufunc_report('3', '勋章不存在。');
    }
    $operator = medal_operator($con, $token);
    if ($operator === '') {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }
    $parse_error = '';
    $assignments = medal_parse_assignments($params, $parse_error);
    if ($assignments === false) {
        return jiekoufunc_report('14', $parse_error ?: '成员数据格式错误。');
    }
    $checks = medal_check_assignments($con, $medal_id, $assignments);
    if ($checks === false) {
        return jiekoufunc_report('8', '检查勋章成员失败。');
    }

    $checks_by_username = array();
    foreach ($checks as $check) {
        $checks_by_username[medal_username_key($check['username'])] = $check;
    }
    $results_by_username = array();
    $added_usernames = array();
    $operator_escaped = mysqli_real_escape_string($con, $operator);
    $now = time();

    if (!medal_db_begin_transaction($con)) {
        return jiekoufunc_report('8', '批量授予勋章失败。');
    }
    foreach ($assignments as $assignment) {
        $username = $assignment['username'];
        $key = medal_username_key($username);
        $check = isset($checks_by_username[$key]) ? $checks_by_username[$key] : null;
        if (!$check || $check['state'] === 'not_found') {
            $results_by_username[$key] = array(
                'username' => $username,
                'role' => $assignment['role'],
                'status' => 'not_found',
                'awarded_at' => null,
            );
            continue;
        }
        if ($check['state'] === 'already_owned') {
            $results_by_username[$key] = array(
                'username' => $username,
                'role' => $assignment['role'],
                'status' => 'already_owned',
                'awarded_at' => $check['awarded_at'],
            );
            continue;
        }

        $username_escaped = mysqli_real_escape_string($con, $username);
        $role_escaped = mysqli_real_escape_string($con, $assignment['role']);
        $insert_member = "INSERT IGNORE INTO user_medal_members
            (medal_id, username, activity_role, awarded_at, awarded_by)
            VALUES ($medal_id, '$username_escaped', '$role_escaped', $now, '$operator_escaped')";
        if (!medal_db_query($con, $insert_member)) {
            medal_db_rollback($con);
            return jiekoufunc_report('8', '批量授予勋章失败。');
        }
        if (mysqli_affected_rows($con) !== 1) {
            $race_result = medal_db_query($con,
                "SELECT awarded_at FROM user_medal_members
                 WHERE medal_id=$medal_id AND username='$username_escaped' LIMIT 1");
            if (!$race_result) {
                medal_db_rollback($con);
                return jiekoufunc_report('8', '检查勋章授予结果失败。');
            }
            $race = mysqli_fetch_assoc($race_result);
            $results_by_username[$key] = array(
                'username' => $username,
                'role' => $assignment['role'],
                'status' => 'already_owned',
                'awarded_at' => $race ? intval($race['awarded_at']) : null,
            );
            continue;
        }

        $insert_display = "INSERT INTO user_medal_displays
            (username, medal_id, state, updated_at)
            VALUES ('$username_escaped', $medal_id, 'retain', $now)";
        if (!medal_db_query($con, $insert_display)) {
            medal_db_rollback($con);
            return jiekoufunc_report('8', '保存勋章展示状态失败。');
        }
        $added_usernames[] = $username;
        $results_by_username[$key] = array(
            'username' => $username,
            'role' => $assignment['role'],
            'status' => 'added',
            'awarded_at' => $now,
        );
    }
    if (!medal_db_commit($con)) {
        medal_db_rollback($con);
        return jiekoufunc_report('8', '批量授予勋章失败。');
    }

    $notification = '为你发放了“' . $medal['name'] . '”勋章，可前往个人中心查看。';
    $notification_failures = 0;
    foreach ($added_usernames as $username) {
        try {
            $sent = jiekoufunc_insertmsg(
                $con,
                'system',
                $username,
                $notification,
                0,
                0,
                0,
                $operator,
                $medal['name']
            );
        } catch (mysqli_sql_exception $error) {
            $sent = false;
        }
        if (!$sent) {
            $notification_failures++;
        }
    }
    if ($notification_failures > 0) {
        return jiekoufunc_report(
            '8',
            "勋章已授予，但有{$notification_failures}位会员的系统通知发送失败。"
        );
    }

    $ordered_results = array();
    $counts = array('added' => 0, 'already_owned' => 0, 'not_found' => 0);
    foreach ($assignments as $assignment) {
        $key = medal_username_key($assignment['username']);
        if (!isset($results_by_username[$key])) {
            continue;
        }
        $item = $results_by_username[$key];
        $ordered_results[] = $item;
        if (isset($counts[$item['status']])) {
            $counts[$item['status']]++;
        }
    }
    return medal_response(array(
        'counts' => $counts,
        'medal_id' => $medal_id,
        'results' => $ordered_results,
    ), count($ordered_results));
}

function jiekoufunc_management_medal_member_remove($con, $params) {
    $medal_id = medal_param_id($params);
    $username_value = isset($params['username']) ? $params['username'] : '';
    $username = is_array($username_value) ? '' : trim(strval($username_value));
    $username_length = medal_string_length($username);
    if ($medal_id <= 0 || $username_length < 1 || $username_length > 30) {
        return jiekoufunc_report('14', '缺少有效的勋章 ID 或会员 ID。');
    }
    if (!medal_find($con, $medal_id)) {
        return jiekoufunc_report('3', '勋章不存在。');
    }

    $username_escaped = mysqli_real_escape_string($con, $username);
    $statement = "DELETE FROM user_medal_members
        WHERE medal_id=$medal_id AND username='$username_escaped'";
    if (!medal_db_query($con, $statement)) {
        return jiekoufunc_report('8', '移除勋章成员失败。');
    }
    return medal_response(array(
        'medal_id' => $medal_id,
        'username' => $username,
        'removed' => mysqli_affected_rows($con) === 1,
    ));
}

function jiekoufunc_medal_self_settings($con, $token) {
    $username = medal_operator($con, $token);
    if ($username === '') {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }
    $data = medal_self_settings_data($con, $username);
    if ($data === false) {
        return jiekoufunc_report('8', '读取勋章设置失败。');
    }
    return medal_response($data, count($data['items']));
}

function jiekoufunc_medal_preferences_update($con, $token, $params) {
    $username = medal_operator($con, $token);
    if ($username === '') {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }
    $invalid_ids = false;
    $display_ids = medal_parse_ids(isset($params['display_medal_ids']) ? $params['display_medal_ids'] : '', $invalid_ids);
    $hidden_ids = medal_parse_ids(isset($params['hidden_medal_ids']) ? $params['hidden_medal_ids'] : '', $invalid_ids);
    if ($invalid_ids) {
        return jiekoufunc_report('14', '勋章设置参数格式错误。');
    }
    if (count($display_ids) > 3) {
        return jiekoufunc_report('14', '最多只能展示三枚勋章。');
    }
    if (array_intersect($display_ids, $hidden_ids)) {
        return jiekoufunc_report('14', '同一枚勋章不能同时展示和隐藏。');
    }

    $requested_ids = array_values(array_unique(array_merge($display_ids, $hidden_ids)));
    if (!empty($requested_ids)) {
        $username_escaped = mysqli_real_escape_string($con, $username);
        $owned_result = medal_db_query($con,
            "SELECT medal_id FROM user_medal_members
             WHERE username='$username_escaped'
               AND medal_id IN (" . medal_id_list($requested_ids) . ')');
        if (!$owned_result) {
            return jiekoufunc_report('8', '检查已获得勋章失败。');
        }
        $owned_ids = array();
        while ($row = mysqli_fetch_assoc($owned_result)) {
            $owned_ids[] = intval($row['medal_id']);
        }
        sort($owned_ids, SORT_NUMERIC);
        $expected_ids = $requested_ids;
        sort($expected_ids, SORT_NUMERIC);
        if ($owned_ids !== $expected_ids) {
            return jiekoufunc_report('14', '只能设置自己已经获得的勋章。');
        }
    }

    $username_escaped = mysqli_real_escape_string($con, $username);
    $now = time();
    if (!medal_db_begin_transaction($con)) {
        return jiekoufunc_report('8', '保存勋章设置失败。');
    }
    $ensure_rows = "INSERT IGNORE INTO user_medal_displays (username, medal_id, state, updated_at)
        SELECT username, medal_id, 'retain', $now
        FROM user_medal_members
        WHERE username='$username_escaped'";
    if (!medal_db_query($con, $ensure_rows)
        || !medal_db_query($con,
            "UPDATE user_medal_displays
             SET state='retain', updated_at=$now
             WHERE username='$username_escaped'")) {
        medal_db_rollback($con);
        return jiekoufunc_report('8', '保存勋章设置失败。');
    }
    if (!empty($display_ids) && !medal_db_query($con,
        "UPDATE user_medal_displays
         SET state='display', updated_at=$now
         WHERE username='$username_escaped'
           AND medal_id IN (" . medal_id_list($display_ids) . ')')) {
        medal_db_rollback($con);
        return jiekoufunc_report('8', '保存展示勋章失败。');
    }
    if (!empty($hidden_ids) && !medal_db_query($con,
        "UPDATE user_medal_displays
         SET state='hidden', updated_at=$now
         WHERE username='$username_escaped'
           AND medal_id IN (" . medal_id_list($hidden_ids) . ')')) {
        medal_db_rollback($con);
        return jiekoufunc_report('8', '保存隐藏勋章失败。');
    }
    if (!medal_db_commit($con)) {
        medal_db_rollback($con);
        return jiekoufunc_report('8', '保存勋章设置失败。');
    }

    $data = medal_self_settings_data($con, $username);
    if ($data === false) {
        return jiekoufunc_report('8', '保存后读取勋章设置失败。');
    }
    return medal_response($data, count($data['items']));
}

function medal_self_settings_data($con, $username) {
    $username_escaped = mysqli_real_escape_string($con, $username);
    $statement = "SELECT m.medal_id, m.username, m.activity_role, m.awarded_at, m.awarded_by,
            COALESCE(d.state, 'retain') AS display_state,
            t.name, t.texture_id, t.large_image_path, t.small_image_path
        FROM user_medal_members AS m
        INNER JOIN user_medals AS t ON t.id=m.medal_id
        LEFT JOIN user_medal_displays AS d
            ON d.medal_id=m.medal_id AND d.username=m.username
        WHERE m.username='$username_escaped'
        ORDER BY m.awarded_at DESC, m.medal_id DESC";
    $result = medal_db_query($con, $statement);
    if (!$result) {
        return false;
    }
    $items = array();
    $counts = array('display' => 0, 'retain' => 0, 'hidden' => 0);
    while ($row = mysqli_fetch_assoc($result)) {
        $item = medal_pack_assignment($row, true);
        $items[] = $item;
        if (isset($counts[$item['state']])) {
            $counts[$item['state']]++;
        }
    }
    return array('counts' => $counts, 'items' => $items, 'total' => count($items));
}

/**
 * Return medals visible on personal profiles for exact, canonical usernames.
 * Query failure is treated as an empty optional feature for legacy compatibility.
 */
function medal_query_profile_by_usernames($con, $usernames) {
    return medal_query_public_by_usernames($con, $usernames, false);
}

/**
 * Return at most three explicitly displayed medals per user for thread payloads.
 */
function medal_query_thread_by_usernames($con, $usernames) {
    return medal_query_public_by_usernames($con, $usernames, true);
}

function medal_query_public_by_usernames($con, $usernames, $display_only) {
    $requested = array();
    foreach ($usernames as $username) {
        $username = strval($username);
        if ($username !== '') {
            $requested[$username] = array();
        }
    }
    if (empty($requested)) {
        return array();
    }

    $escaped = array();
    foreach (array_keys($requested) as $username) {
        $escaped[] = "'" . mysqli_real_escape_string($con, $username) . "'";
    }
    $states = $display_only ? "'display'" : "'display','retain'";
    $statement = "SELECT m.medal_id, m.username, m.activity_role, m.awarded_at,
            t.name, t.texture_id, t.large_image_path, t.small_image_path
        FROM user_medal_members AS m
        INNER JOIN user_medal_displays AS d
            ON d.medal_id=m.medal_id AND d.username=m.username
        INNER JOIN user_medals AS t ON t.id=m.medal_id
        WHERE m.username IN (" . implode(',', $escaped) . ")
          AND d.state IN ($states)
        ORDER BY m.username ASC, m.awarded_at DESC, m.medal_id DESC";
    $result = medal_db_query($con, $statement);
    if (!$result) {
        return $requested;
    }

    while ($row = mysqli_fetch_assoc($result)) {
        $username = strval($row['username']);
        if (!isset($requested[$username])) {
            continue;
        }
        if ($display_only && count($requested[$username]) >= 3) {
            continue;
        }
        $requested[$username][] = $display_only
            ? medal_pack_compact_assignment($row)
            : medal_pack_assignment($row, false);
    }
    return $requested;
}

function medal_check_assignments($con, $medal_id, $assignments) {
    $escaped = array();
    foreach ($assignments as $assignment) {
        $escaped[] = "'" . mysqli_real_escape_string($con, $assignment['username']) . "'";
    }
    if (empty($escaped)) {
        return array();
    }

    $members_result = medal_db_query($con,
        'SELECT username, icon FROM userinfo
         WHERE BINARY username IN (' . implode(',', $escaped) . ')');
    if (!$members_result) {
        return false;
    }
    $members = array();
    while ($row = mysqli_fetch_assoc($members_result)) {
        $members[medal_username_key($row['username'])] = $row;
    }

    $existing_result = medal_db_query($con,
        "SELECT username, awarded_at FROM user_medal_members
         WHERE medal_id=$medal_id AND username IN (" . implode(',', $escaped) . ')');
    if (!$existing_result) {
        return false;
    }
    $existing = array();
    while ($row = mysqli_fetch_assoc($existing_result)) {
        $existing[medal_username_key($row['username'])] = $row;
    }

    $items = array();
    foreach ($assignments as $assignment) {
        $username = $assignment['username'];
        $key = medal_username_key($username);
        $member = isset($members[$key]) ? $members[$key] : null;
        $owned = isset($existing[$key]) ? $existing[$key] : null;
        $items[] = array(
            'username' => $username,
            'role' => $assignment['role'],
            'state' => !$member ? 'not_found' : ($owned ? 'already_owned' : 'available'),
            'member' => $member ? array(
                'username' => strval($member['username']),
                'avatar' => medal_avatar(isset($member['icon']) ? $member['icon'] : ''),
                'profile_url' => '/users/' . rawurlencode($member['username']),
            ) : null,
            'awarded_at' => $owned ? intval($owned['awarded_at']) : null,
        );
    }
    return $items;
}

function medal_parse_assignments($params, &$error) {
    $error = '';
    if (array_key_exists('assignments', $params)) {
        $value = $params['assignments'];
        if (is_string($value)) {
            $value = json_decode($value, true);
        }
    } elseif (isset($params['username']) || isset($params['id'])) {
        $value = array(array(
            'username' => isset($params['username']) ? $params['username'] : $params['id'],
            'role' => isset($params['role']) ? $params['role'] : '',
        ));
    } else {
        $error = '至少需要一个会员 ID。';
        return false;
    }
    if (!is_array($value) || empty($value)) {
        $error = '成员数据格式错误。';
        return false;
    }
    if (count($value) > MEDAL_API_MAX_BATCH) {
        $error = '一次最多处理 200 个会员。';
        return false;
    }

    $assignments = array();
    $seen = array();
    foreach ($value as $item) {
        if (!is_array($item)) {
            $error = '成员数据格式错误。';
            return false;
        }
        $username = trim(strval(isset($item['username']) ? $item['username'] : (isset($item['id']) ? $item['id'] : '')));
        $role = trim(strval(isset($item['role']) ? $item['role'] : (isset($item['activity_role']) ? $item['activity_role'] : '')));
        $username_length = medal_string_length($username);
        $role_length = medal_string_length($role);
        if ($username_length < 1 || $username_length > 30) {
            $error = '会员 ID 必须为 1 至 30 个字符。';
            return false;
        }
        if ($role_length > 50) {
            $error = '活动职务不得超过 50 个字符。';
            return false;
        }
        $key = medal_username_key($username);
        if (isset($seen[$key])) {
            $error = '成员数据中存在重复的会员 ID。';
            return false;
        }
        $seen[$key] = true;
        $assignments[] = array('username' => $username, 'role' => $role);
    }
    return $assignments;
}

function medal_parse_ids($value, &$invalid) {
    if (is_array($value)) {
        $parts = $value;
    } else {
        $parts = preg_split('/[,\s]+/', trim(strval($value)), -1, PREG_SPLIT_NO_EMPTY);
    }
    $ids = array();
    foreach ($parts as $part) {
        $part = trim(strval($part));
        if ($part === '' || !preg_match('/^\d+$/', $part) || intval($part) <= 0) {
            $invalid = true;
            continue;
        }
        $id = intval($part);
        if (!in_array($id, $ids, true)) {
            $ids[] = $id;
        }
    }
    return $ids;
}

function medal_pack_definition($row) {
    return array(
        'id' => intval($row['id']),
        'name' => strval($row['name']),
        'texture_id' => strval($row['texture_id']),
        'large_image_path' => strval($row['large_image_path']),
        'small_image_path' => strval($row['small_image_path']),
        'created_at' => intval($row['created_at']),
        'updated_at' => intval($row['updated_at']),
        'created_by' => strval($row['created_by']),
        'updated_by' => strval($row['updated_by']),
    );
}

function medal_pack_member($row) {
    return array(
        'username' => strval($row['username']),
        'role' => strval($row['activity_role']),
        'awarded_at' => intval($row['awarded_at']),
        'awarded_by' => strval($row['awarded_by']),
        'state' => medal_normalize_state(isset($row['display_state']) ? $row['display_state'] : 'retain'),
        'avatar' => medal_avatar(isset($row['icon']) ? $row['icon'] : ''),
        'profile_url' => '/users/' . rawurlencode($row['username']),
    );
}

function medal_pack_assignment($row, $include_state) {
    $item = array(
        'id' => intval($row['medal_id']),
        'name' => strval($row['name']),
        'texture_id' => strval($row['texture_id']),
        'large_image_path' => strval($row['large_image_path']),
        'small_image_path' => strval($row['small_image_path']),
        'role' => strval($row['activity_role']),
        'awarded_at' => intval($row['awarded_at']),
    );
    if ($include_state) {
        $item['state'] = medal_normalize_state(isset($row['display_state']) ? $row['display_state'] : 'retain');
    }
    return $item;
}

function medal_pack_compact_assignment($row) {
    return array(
        'id' => intval($row['medal_id']),
        'name' => strval($row['name']),
        'small_image_path' => strval($row['small_image_path']),
        'role' => strval($row['activity_role']),
        'awarded_at' => intval($row['awarded_at']),
    );
}

function medal_find($con, $medal_id) {
    $medal_id = intval($medal_id);
    if ($medal_id <= 0) {
        return null;
    }
    $result = medal_db_query($con,
        "SELECT id, name, texture_id, large_image_path, small_image_path,
                created_at, updated_at, created_by, updated_by
         FROM user_medals WHERE id=$medal_id LIMIT 1");
    if (!$result) {
        return null;
    }
    return mysqli_fetch_assoc($result);
}

function medal_param_id($params) {
    $value = isset($params['medal_id']) ? $params['medal_id'] : (isset($params['id']) ? $params['id'] : '');
    if (is_array($value) || !preg_match('/^\d+$/', trim(strval($value)))) {
        return 0;
    }
    return intval($value);
}

function medal_page_param($params, $key, $default) {
    if (!isset($params[$key]) || is_array($params[$key]) || !preg_match('/^\d+$/', trim(strval($params[$key])))) {
        return intval($default);
    }
    return max(1, intval($params[$key]));
}

function medal_validate_name($value) {
    $name = trim(strval($value));
    $length = medal_string_length($name);
    return ($length >= 1 && $length <= 50) ? $name : false;
}

function medal_validate_texture($value) {
    $texture = strtolower(trim(strval($value)));
    $allowed = array('swirl', 'halftone', 'geometric', 'interlaced', 'carbon', 'scale', 'pixel');
    return in_array($texture, $allowed, true) ? $texture : false;
}

function medal_normalize_state($value) {
    $state = strtolower(trim(strval($value)));
    return in_array($state, array('display', 'retain', 'hidden'), true) ? $state : 'retain';
}

function medal_operator($con, $token) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return '';
    }
    if (isset($user['username'])) {
        return strval($user['username']);
    }
    return isset($user[0]) ? strval($user[0]) : '';
}

function medal_username_key($username) {
    return 'u:' . strval($username);
}

function medal_string_length($value) {
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function medal_db_query($con, $statement) {
    try {
        return mysqli_query($con, $statement);
    } catch (mysqli_sql_exception $error) {
        return false;
    }
}

function medal_db_begin_transaction($con) {
    try {
        return mysqli_begin_transaction($con);
    } catch (mysqli_sql_exception $error) {
        return false;
    }
}

function medal_db_commit($con) {
    try {
        return mysqli_commit($con);
    } catch (mysqli_sql_exception $error) {
        return false;
    }
}

function medal_db_rollback($con) {
    try {
        return mysqli_rollback($con);
    } catch (mysqli_sql_exception $error) {
        return false;
    }
}

function medal_id_list($ids) {
    $values = array();
    foreach ($ids as $id) {
        $id = intval($id);
        if ($id > 0) {
            $values[] = $id;
        }
    }
    return implode(',', $values);
}

function medal_avatar($icon) {
    $icon = trim(strval($icon));
    if ($icon === '') {
        return '';
    }
    if (is_numeric($icon) || (strlen($icon) > 1 && is_numeric(substr($icon, 1)))) {
        return '/bbsimg/i/' . $icon . '.gif';
    }
    return $icon;
}

function medal_response($data, $count = null) {
    $status = array('code' => '0', 'msg' => 'ok');
    $status['count'] = strval($count === null ? 1 : $count);
    return array($status, $data);
}

function medal_image_upload_present($file) {
    return is_array($file)
        && isset($file['error'])
        && intval($file['error']) !== UPLOAD_ERR_NO_FILE;
}

function medal_image_create_pair($file, &$error) {
    $error = '';
    if (!is_array($file) || !isset($file['error']) || intval($file['error']) !== UPLOAD_ERR_OK) {
        $error = '未收到可用的勋章图片。';
        return false;
    }
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        $error = '勋章图片上传无效。';
        return false;
    }
    $uploaded_size = isset($file['size']) ? intval($file['size']) : 0;
    if ($uploaded_size <= 0 || $uploaded_size > MEDAL_IMAGE_MAX_UPLOAD_BYTES) {
        $error = '勋章原图必须小于 16 MiB。';
        return false;
    }

    $image_info = @getimagesize($file['tmp_name']);
    if (!$image_info || intval($image_info[0]) <= 0 || intval($image_info[1]) <= 0) {
        $error = '勋章图片无法识别。';
        return false;
    }
    if (intval($image_info[0]) !== intval($image_info[1])) {
        $error = '勋章图片必须是方形裁剪结果。';
        return false;
    }
    if (intval($image_info[0]) < 64) {
        $error = '勋章图片尺寸过小。';
        return false;
    }
    if (intval($image_info[0]) > MEDAL_IMAGE_MAX_SOURCE_SIZE) {
        $error = '勋章图片尺寸过大。';
        return false;
    }
    $mime = medal_image_detect_mime($file['tmp_name']);
    if (!in_array($mime, array('image/jpeg', 'image/png', 'image/webp'), true)) {
        $error = '仅支持 JPEG、PNG 或 WebP 勋章图片。';
        return false;
    }
    if (!function_exists('imagecreatefromstring') || !function_exists('imagewebp')) {
        $error = '服务器缺少勋章图片处理组件。';
        return false;
    }

    $source_bytes = @file_get_contents($file['tmp_name']);
    $source = $source_bytes === false ? false : @imagecreatefromstring($source_bytes);
    if (!$source) {
        $error = '勋章图片无法解码。';
        return false;
    }
    $large_bytes = medal_image_encode_variant(
        $source,
        MEDAL_IMAGE_LARGE_SIZE,
        MEDAL_IMAGE_LARGE_MAX_BYTES
    );
    $small_bytes = medal_image_encode_variant(
        $source,
        MEDAL_IMAGE_SMALL_SIZE,
        MEDAL_IMAGE_SMALL_MAX_BYTES
    );
    medal_image_release($source);
    if ($large_bytes === false || $small_bytes === false) {
        $error = '勋章图片无法压缩到指定大小。';
        return false;
    }

    $pair = medal_image_store_pair($large_bytes, $small_bytes);
    if ($pair === false) {
        $error = '勋章图片保存失败。';
        return false;
    }
    return $pair;
}

function medal_image_detect_mime($path) {
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $mime = finfo_file($finfo, $path);
            finfo_close($finfo);
            if (is_string($mime)) {
                return strtolower($mime);
            }
        }
    }
    $info = @getimagesize($path);
    return $info && isset($info['mime']) ? strtolower(strval($info['mime'])) : '';
}

function medal_image_encode_variant($source, $maximum_size, $maximum_bytes) {
    $source_width = imagesx($source);
    $source_height = imagesy($source);
    $size = min(intval($maximum_size), $source_width, $source_height);
    $qualities = array(90, 84, 78, 72, 66, 60, 54, 48, 42, 36, 30);

    while ($size >= 48) {
        $output = imagecreatetruecolor($size, $size);
        if (!$output) {
            return false;
        }
        imagealphablending($output, false);
        imagesavealpha($output, true);
        $transparent = imagecolorallocatealpha($output, 0, 0, 0, 127);
        imagefilledrectangle($output, 0, 0, $size, $size, $transparent);
        imagecopyresampled(
            $output,
            $source,
            0,
            0,
            0,
            0,
            $size,
            $size,
            $source_width,
            $source_height
        );

        foreach ($qualities as $quality) {
            ob_start();
            $success = imagewebp($output, null, $quality);
            $bytes = ob_get_clean();
            if ($success && is_string($bytes) && strlen($bytes) < $maximum_bytes) {
                medal_image_release($output);
                return $bytes;
            }
        }
        medal_image_release($output);
        $size = intval(floor($size * 0.82));
    }
    return false;
}

function medal_image_store_pair($large_bytes, $small_bytes) {
    $root = dirname(__DIR__, 2);
    $base_directory = $root . '/bbsimg/medals';
    if (!is_dir($base_directory) && !@mkdir($base_directory, 0755, true)) {
        return false;
    }

    for ($attempt = 0; $attempt < 10; $attempt++) {
        try {
            $key = bin2hex(random_bytes(16));
        } catch (Exception $error) {
            return false;
        }
        $directory = $base_directory . '/' . $key;
        if (file_exists($directory) || !@mkdir($directory, 0755)) {
            continue;
        }
        $large_temporary = $directory . '/large.webp.tmp';
        $small_temporary = $directory . '/small.webp.tmp';
        $large_absolute = $directory . '/large.webp';
        $small_absolute = $directory . '/small.webp';
        $large_written = @file_put_contents($large_temporary, $large_bytes, LOCK_EX);
        $small_written = @file_put_contents($small_temporary, $small_bytes, LOCK_EX);
        if ($large_written !== strlen($large_bytes)
            || $small_written !== strlen($small_bytes)
            || !@rename($large_temporary, $large_absolute)
            || !@rename($small_temporary, $small_absolute)) {
            @unlink($large_temporary);
            @unlink($small_temporary);
            @unlink($large_absolute);
            @unlink($small_absolute);
            @rmdir($directory);
            return false;
        }
        return array(
            'large_image_path' => '/bbsimg/medals/' . $key . '/large.webp',
            'small_image_path' => '/bbsimg/medals/' . $key . '/small.webp',
        );
    }
    return false;
}

function medal_image_delete_pair($large_path, $small_path) {
    $ok = true;
    $directories = array();
    foreach (array_unique(array(strval($large_path), strval($small_path))) as $public_path) {
        if (!preg_match('#^/bbsimg/medals/[a-f0-9]{32}/(?:large|small)\.webp$#', $public_path)) {
            $ok = false;
            continue;
        }
        $absolute_path = dirname(__DIR__, 2) . $public_path;
        $directories[dirname($absolute_path)] = true;
        if (is_file($absolute_path) && !@unlink($absolute_path)) {
            $ok = false;
        }
    }
    foreach (array_keys($directories) as $directory) {
        if (is_dir($directory) && !@rmdir($directory)) {
            $ok = false;
        }
    }
    return $ok;
}

function medal_image_release($image) {
    if (PHP_VERSION_ID < 80500 && function_exists('imagedestroy')) {
        imagedestroy($image);
    }
}
