<?php
/**
 * Unified activity API handlers.
 *
 * New clients enter through /api/api.php + dispatch.php. Legacy endpoints
 * translate their request/response shapes and call the same handlers.
 */

require_once __DIR__ . '/../../lib.php';
require_once __DIR__ . '/../../bbs/content/utils/activityService.php';

if (!defined('CAPUBBS_ACTIVITY_LIBRARY_MODE')) {
    define('CAPUBBS_ACTIVITY_LIBRARY_MODE', true);
}
require_once __DIR__ . '/../../bbs/content/utils/postActivity.php';

function jiekoufunc_activity_create($con, $token, $bid, $ip, $params) {
    return activity_handler_create($con, $token, $bid, $ip, $params, false);
}

function activity_handler_create($con, $token, $bid, $ip, $params, $allow_missing_window) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return activity_handler_error('-1', '仅支持 POST');
    }

    $user = activity_handler_current_user($con, $token);
    if (!$user) {
        return activity_handler_error('-2', '请先登录');
    }
    if (intval($user['rights']) < 2) {
        return activity_handler_error('5', '权限不足！');
    }
    if (intval($bid) !== 1) {
        return activity_handler_error('-44', '活动只能发布在车协工作区');
    }

    $title = isset($params['title']) ? trim(strval($params['title'])) : '';
    $text = isset($params['text']) ? strval($params['text']) : '';
    $sig = intval(isset($params['sig']) ? $params['sig'] : 0);
    $attachs = isset($params['attachs']) ? trim(strval($params['attachs'])) : '';
    if ($title === '' || trim($text) === '') {
        return activity_handler_error('-44', '活动标题和正文不能为空');
    }

    $options_raw = isset($params['options']) ? $params['options'] : array();
    $options = is_array($options_raw) ? $options_raw : json_decode(strval($options_raw), true);
    if (!is_array($options)) {
        return activity_handler_error('-44', '报名字段格式不正确');
    }
    $option_error = activity_handler_validate_options($options);
    if ($option_error !== null) {
        return activity_handler_error('-44', $option_error);
    }

    $window = activity_handler_parse_window($params, !$allow_missing_window);
    if (!$window['valid']) {
        return activity_handler_error('-44', $window['message']);
    }
    $schedule = activity_handler_parse_schedule($params, !$allow_missing_window);
    if (!$schedule['valid']) {
        return activity_handler_error('-44', $schedule['message']);
    }

    $control_error = activity_handler_check_post_control($con, $user, $bid);
    if ($control_error !== null) {
        return activity_handler_error('-44', $control_error);
    }
    $delay_error = activity_handler_check_post_delay($user);
    if ($delay_error !== null) {
        return activity_handler_error('2', $delay_error);
    }

    try {
        $result = createActivity(
            $user['username'],
            intval($bid),
            $title,
            $text,
            $options,
            $sig,
            $attachs,
            $window['starts_at'],
            $window['ends_at'],
            $schedule['starts_on'],
            $schedule['ends_on']
        );
    } catch (Exception $error) {
        return activity_handler_error('8', '活动创建失败，请稍后重试');
    }

    if (!is_array($result) || empty($result['bid']) || empty($result['tid'])) {
        return activity_handler_error('8', '活动创建失败，请稍后重试');
    }

    return array(
        array('code' => '0', 'msg' => 'success'),
        array(
            'activity_id' => isset($result['activity_id']) ? intval($result['activity_id']) : null,
            'bid' => intval($result['bid']),
            'tid' => intval($result['tid']),
        ),
    );
}

function jiekoufunc_activity_signup($con, $token, $bid, $tid, $params) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return activity_handler_error('-1', '仅支持 POST');
    }

    $user = activity_handler_current_user($con, $token);
    if (!$user) {
        return activity_handler_error('-2', '请先登录');
    }

    if (!activity_handler_acquire_update_lock($con, $bid, $tid)) {
        return activity_handler_error('8', '活动正在保存，请稍后重试');
    }

    try {
        return activity_handler_signup_locked($con, $user, $bid, $tid, $params);
    } finally {
        activity_handler_release_update_lock($con, $bid, $tid);
    }
}

function activity_handler_signup_locked($con, $user, $bid, $tid, $params) {
    $action = isset($params['action']) ? strval($params['action']) : '';
    if (!in_array($action, array('join', 'modify', 'cancel', 'restore'), true)) {
        return activity_handler_error('6', '不支持的报名操作');
    }

    $activity = getActivity($bid, $tid);
    if (!$activity) {
        return activity_handler_error('3', '活动不存在');
    }

    $thread_result = mysqli_query($con, 'select locked from threads where bid=' . intval($bid) . ' and tid=' . intval($tid) . ' limit 1');
    $thread = $thread_result ? mysqli_fetch_assoc($thread_result) : null;
    if (!$thread) {
        return activity_handler_error('3', '主题不存在');
    }
    if (intval($thread['locked']) === 1) {
        return activity_handler_error('4', '主题已锁定');
    }

    if ($action !== 'cancel') {
        $window = isset($activity['signup_window']) ? $activity['signup_window'] : null;
        if ($window && isset($window['status']) && $window['status'] !== 'open') {
            return activity_handler_error('-44', $window['status'] === 'not_started' ? '报名尚未开始' : '报名已截止');
        }
    }

    $control_error = activity_handler_check_post_control($con, $user, $bid);
    if ($control_error !== null) {
        return activity_handler_error('-44', $control_error);
    }

    $option_values = isset($params['option_values']) && is_array($params['option_values'])
        ? $params['option_values']
        : array();
    $title = isset($params['title']) ? strval($params['title']) : '';
    $sig = isset($option_values['sign']) ? intval($option_values['sign']) : intval(isset($params['sig']) ? $params['sig'] : 0);
    $username = $user['username'];

    if ($action === 'join') {
        $result = join_activity_by_content($bid, $tid, $username, $option_values, $title, $sig);
    } elseif ($action === 'modify') {
        $result = modify_join_activity_by_content($bid, $tid, $username, $option_values, $title, $sig);
    } else {
        $option_values = getUsernameOptionValue($username, intval($activity['activity_id']));
        $result = cancel_join_activity_by_content($bid, $tid, $username, $option_values, $title, $action === 'cancel');
    }

    if (!is_array($result) || intval(isset($result['code']) ? $result['code'] : -1) !== 0) {
        return activity_handler_error('-1', is_array($result) && !empty($result['msg']) ? $result['msg'] : '报名操作失败');
    }

    return array(
        array('code' => '0', 'msg' => 'success'),
        array('action' => $action, 'activity_id' => intval($activity['activity_id'])),
    );
}

function jiekoufunc_activity_update($con, $token, $bid, $tid, $params) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return activity_handler_error('-1', '仅支持 POST');
    }

    $user = activity_handler_current_user($con, $token);
    if (!$user) {
        return activity_handler_error('-2', '请先登录');
    }

    $bid = intval($bid);
    $tid = intval($tid);
    $activity_result = mysqli_query($con, "select activity_id, leader_username
        from season_threads_activity where bid=$bid and tid=$tid limit 1");
    $activity = $activity_result ? mysqli_fetch_assoc($activity_result) : null;
    if (!$activity) {
        return activity_handler_error('3', '活动不存在');
    }
    if ($user['username'] !== $activity['leader_username'] && intval($user['rights']) < 3) {
        return activity_handler_error('5', '仅活动楼主或权限值不低于 3 的用户可以修改活动');
    }

    $options_raw = isset($params['options']) ? $params['options'] : array();
    $options = is_array($options_raw) ? $options_raw : json_decode(strval($options_raw), true);
    if (!is_array($options) || count($options) === 0) {
        return activity_handler_error('-44', '报名问卷至少需要一个字段');
    }
    $option_error = activity_handler_validate_options($options);
    if ($option_error !== null) {
        return activity_handler_error('-44', $option_error);
    }

    $window = activity_handler_parse_window($params, true, false);
    if (!$window['valid']) {
        return activity_handler_error('-44', $window['message']);
    }
    $schedule = activity_handler_parse_schedule($params, true, false);
    if (!$schedule['valid']) {
        return activity_handler_error('-44', $schedule['message']);
    }

    if (!activity_handler_acquire_update_lock($con, $bid, $tid)) {
        return activity_handler_error('8', '活动正在处理报名，请稍后重试');
    }

    try {
        updateActivityConfiguration(
            $con,
            intval($activity['activity_id']),
            $window['starts_at'],
            $window['ends_at'],
            $schedule['starts_on'],
            $schedule['ends_on'],
            $options
        );
        $updated_activity = getActivity($bid, $tid);
    } catch (ActivityUpdateValidationException $error) {
        return activity_handler_error('-44', $error->getMessage());
    } catch (Exception $error) {
        return activity_handler_error('8', '活动保存失败，请稍后重试');
    } finally {
        activity_handler_release_update_lock($con, $bid, $tid);
    }

    return array(
        array('code' => '0', 'msg' => 'success'),
        array('activity' => $updated_activity),
    );
}

function jiekoufunc_activity_signup_summary($con, $token, $bid, $tid, $params) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return activity_handler_error('-1', '仅支持 POST');
    }

    $user = activity_handler_current_user($con, $token);
    if (!$user) {
        return activity_handler_error('-2', '请先登录');
    }

    $bid = intval($bid);
    $tid = intval($tid);
    $activity_result = mysqli_query($con, "select activity_id, leader_username
        from season_threads_activity where bid=$bid and tid=$tid limit 1");
    $activity = $activity_result ? mysqli_fetch_assoc($activity_result) : null;
    if (!$activity) {
        return activity_handler_error('3', '活动不存在');
    }
    if ($user['username'] !== $activity['leader_username'] && intval($user['rights']) < 3) {
        return activity_handler_error('5', '仅活动楼主或权限值不低于 3 的用户可以查看报名汇总');
    }

    if (!activity_handler_acquire_update_lock($con, $bid, $tid)) {
        return activity_handler_error('8', '活动正在处理报名，请稍后重试');
    }

    try {
        return activity_handler_signup_summary_locked($con, intval($activity['activity_id']));
    } finally {
        activity_handler_release_update_lock($con, $bid, $tid);
    }
}

function activity_handler_signup_summary_locked($con, $activity_id) {
    $activity_id = intval($activity_id);
    $count_result = mysqli_query($con, "select
            count(*) as total,
            count(case when cancel=0 then 1 end) as effective,
            count(case when cancel<>0 then 1 end) as canceled
        from season_activity_join where activity_id=$activity_id");
    $counts = $count_result ? mysqli_fetch_assoc($count_result) : null;
    if (!$counts) {
        return activity_handler_error('8', '报名汇总读取失败');
    }

    $total = intval($counts['total']);

    $join_result = mysqli_query($con, "select
            activity_join.join_id,
            activity_join.username,
            activity_join.cancel,
            coalesce(posts.replytime, 0) as joined_at
        from season_activity_join activity_join
        left join posts on posts.fid=activity_join.post_fid
        where activity_join.activity_id=$activity_id
        order by activity_join.join_id asc");
    if (!$join_result) {
        return activity_handler_error('8', '报名明细读取失败');
    }

    $records = array();
    $record_indexes = array();
    while ($row = mysqli_fetch_assoc($join_result)) {
        $join_id = intval($row['join_id']);
        $record_indexes[$join_id] = count($records);
        $records[] = array(
            'record_id' => $join_id,
            'username' => $row['username'],
            'joined_at' => intval($row['joined_at']),
            'status' => intval($row['cancel']) === 0 ? 'effective' : 'canceled',
            'values' => array(),
        );
    }

    if (!empty($records)) {
        $option_types = array();
        $option_result = mysqli_query($con, "select id, type_id
            from season_activity_option where activity_id=$activity_id and hiden=0");
        if (!$option_result) {
            return activity_handler_error('8', '报名字段读取失败');
        }
        while ($row = mysqli_fetch_assoc($option_result)) {
            $option_types[intval($row['id'])] = intval($row['type_id']);
        }

        $case_names = array();
        $case_result = mysqli_query($con, "select option_case.case_id, option_case.option_id, option_case.case_name
            from season_option_case option_case
            inner join season_activity_option activity_option on activity_option.id=option_case.option_id
            where activity_option.activity_id=$activity_id and activity_option.hiden=0");
        if (!$case_result) {
            return activity_handler_error('8', '报名选项读取失败');
        }
        while ($row = mysqli_fetch_assoc($case_result)) {
            $option_id = intval($row['option_id']);
            if (!isset($case_names[$option_id])) $case_names[$option_id] = array();
            $case_names[$option_id][intval($row['case_id'])] = $row['case_name'];
        }

        $value_result = mysqli_query($con, "select option_value.join_id, option_value.option_id, option_value.value
            from season_join_option_value option_value
            inner join season_activity_join activity_join on activity_join.join_id=option_value.join_id
            inner join season_activity_option activity_option on activity_option.id=option_value.option_id
            where activity_join.activity_id=$activity_id
                and activity_option.activity_id=$activity_id
                and activity_option.hiden=0
            order by option_value.id asc");
        if (!$value_result) {
            return activity_handler_error('8', '报名答案读取失败');
        }
        while ($row = mysqli_fetch_assoc($value_result)) {
            $join_id = intval($row['join_id']);
            $option_id = intval($row['option_id']);
            if (!isset($record_indexes[$join_id]) || !isset($option_types[$option_id])) continue;
            $record_index = $record_indexes[$join_id];
            $records[$record_index]['values'][strval($option_id)] = activity_handler_format_signup_value(
                $option_types[$option_id],
                strval($row['value']),
                isset($case_names[$option_id]) ? $case_names[$option_id] : array()
            );
        }
    }

    return array(
        array('code' => '0', 'msg' => 'success'),
        array(
            'totals' => array(
                'total' => $total,
                'effective' => intval($counts['effective']),
                'canceled' => intval($counts['canceled']),
            ),
            'records' => $records,
        ),
    );
}

function activity_handler_format_signup_value($type_id, $value, $case_names) {
    if (intval($type_id) === 1) {
        $case_id = intval($value);
        return isset($case_names[$case_id]) ? $case_names[$case_id] : $value;
    }
    if (intval($type_id) === 3) {
        if (trim($value) === '') return array();
        $values = array();
        foreach (explode(',', $value) as $case_id_raw) {
            $case_id = intval(trim($case_id_raw));
            if ($case_id <= 0) continue;
            $values[] = isset($case_names[$case_id]) ? $case_names[$case_id] : strval($case_id);
        }
        return $values;
    }
    return $value;
}

function jiekoufunc_activity_signup_list($con, $params) {
    $now = time();
    $limit = intval(isset($params['limit']) ? $params['limit'] : 10);
    if ($limit <= 0) $limit = 10;
    if ($limit > 50) $limit = 50;

    $statement = "select
            activity.activity_id,
            activity.bid,
            activity.tid,
            activity.name,
            activity.leader_username,
            signup_window.starts_at,
            signup_window.ends_at,
            schedule.starts_on,
            schedule.ends_on,
            count(case when activity_join.cancel=0 then 1 end) as signup_count
        from season_activity_signup_window signup_window
        inner join season_threads_activity activity on activity.activity_id=signup_window.activity_id
        inner join season_activity_schedule schedule on schedule.activity_id=activity.activity_id
        inner join threads on threads.bid=activity.bid and threads.tid=activity.tid
        left join season_activity_join activity_join on activity_join.activity_id=activity.activity_id
        where signup_window.ends_at>$now and threads.locked=0
        group by activity.activity_id, activity.bid, activity.tid, activity.name,
            activity.leader_username, signup_window.starts_at, signup_window.ends_at,
            schedule.starts_on, schedule.ends_on
        order by schedule.starts_on asc, signup_window.ends_at asc
        limit $limit";
    $result = mysqli_query($con, $statement);
    if (!$result) {
        return activity_handler_error('8', '活动列表读取失败');
    }

    $rows = array(array('code' => '0', 'msg' => 'success'));
    while ($row = mysqli_fetch_assoc($result)) {
        $starts_at = intval($row['starts_at']);
        $ends_at = intval($row['ends_at']);
        $rows[] = array(
            'activity_id' => intval($row['activity_id']),
            'bid' => intval($row['bid']),
            'tid' => intval($row['tid']),
            'name' => $row['name'],
            'leader_username' => $row['leader_username'],
            'starts_at' => $starts_at,
            'ends_at' => $ends_at,
            'activity_starts_on' => $row['starts_on'],
            'activity_ends_on' => $row['ends_on'],
            'status' => activity_signup_window_status($starts_at, $ends_at, $now),
            'signup_count' => intval($row['signup_count']),
        );
    }
    return $rows;
}

function activity_schedule_for_activity($con, $activity_id) {
    $activity_id = intval($activity_id);
    if ($activity_id <= 0) return null;
    $result = mysqli_query($con, "select starts_on, ends_on from season_activity_schedule where activity_id=$activity_id limit 1");
    $row = $result ? mysqli_fetch_assoc($result) : null;
    if (!$row) return null;

    return array(
        'starts_on' => $row['starts_on'],
        'ends_on' => $row['ends_on'],
    );
}

function activity_signup_window_for_activity($con, $activity_id) {
    $activity_id = intval($activity_id);
    if ($activity_id <= 0) return null;
    $result = mysqli_query($con, "select starts_at, ends_at from season_activity_signup_window where activity_id=$activity_id limit 1");
    $row = $result ? mysqli_fetch_assoc($result) : null;
    if (!$row) return null;

    $starts_at = intval($row['starts_at']);
    $ends_at = intval($row['ends_at']);
    return array(
        'starts_at' => $starts_at,
        'ends_at' => $ends_at,
        'status' => activity_signup_window_status($starts_at, $ends_at, time()),
    );
}

function activity_signup_window_status($starts_at, $ends_at, $now) {
    if ($now < $starts_at) return 'not_started';
    if ($now >= $ends_at) return 'closed';
    return 'open';
}

function activity_handler_current_user($con, $token) {
    if (!$token) return null;
    $token_escaped = mysqli_real_escape_string($con, $token);
    $now = time();
    $validtime = isset($GLOBALS['validtime']) ? intval($GLOBALS['validtime']) : 604800;
    $result = mysqli_query($con, "select username, rights, star, lastpost, verified, post, reply, mail
        from userinfo where token='$token_escaped' and $now<=tokentime+$validtime limit 1");
    return $result ? mysqli_fetch_assoc($result) : null;
}

function activity_handler_acquire_update_lock($con, $bid, $tid) {
    $lock_name = 'capubbs_activity_' . intval($bid) . '_' . intval($tid);
    $lock_name = mysqli_real_escape_string($con, $lock_name);
    $result = mysqli_query($con, "select get_lock('$lock_name', 10) as acquired");
    $row = $result ? mysqli_fetch_assoc($result) : null;
    return $row && intval($row['acquired']) === 1;
}

function activity_handler_release_update_lock($con, $bid, $tid) {
    $lock_name = 'capubbs_activity_' . intval($bid) . '_' . intval($tid);
    $lock_name = mysqli_real_escape_string($con, $lock_name);
    mysqli_query($con, "select release_lock('$lock_name')");
}

function activity_handler_parse_window($params, $required, $require_future_end = true) {
    $has_starts_at = isset($params['signup_starts_at']) && $params['signup_starts_at'] !== '';
    $has_ends_at = isset($params['signup_ends_at']) && $params['signup_ends_at'] !== '';
    if (!$has_starts_at && !$has_ends_at && !$required) {
        return array('valid' => true, 'message' => '', 'starts_at' => null, 'ends_at' => null);
    }
    if (!$has_starts_at || !$has_ends_at) {
        return array('valid' => false, 'message' => '报名开始和截止时间必须同时填写', 'starts_at' => null, 'ends_at' => null);
    }

    $starts_raw = strval($params['signup_starts_at']);
    $ends_raw = strval($params['signup_ends_at']);
    if (!ctype_digit($starts_raw) || !ctype_digit($ends_raw)) {
        return array('valid' => false, 'message' => '报名时间格式不正确', 'starts_at' => null, 'ends_at' => null);
    }
    $starts_at = intval($starts_raw);
    $ends_at = intval($ends_raw);
    if ($starts_at <= 0 || $ends_at <= 0 || $starts_at >= $ends_at) {
        return array('valid' => false, 'message' => '报名截止时间必须晚于开始时间', 'starts_at' => null, 'ends_at' => null);
    }
    if ($require_future_end && $ends_at <= time()) {
        return array('valid' => false, 'message' => '报名截止时间必须晚于当前时间', 'starts_at' => null, 'ends_at' => null);
    }
    return array('valid' => true, 'message' => '', 'starts_at' => $starts_at, 'ends_at' => $ends_at);
}

function activity_handler_parse_schedule($params, $required, $require_future_start = true) {
    $has_starts_on = isset($params['activity_starts_on']) && $params['activity_starts_on'] !== '';
    $has_ends_on = isset($params['activity_ends_on']) && $params['activity_ends_on'] !== '';
    if (!$has_starts_on && !$has_ends_on && !$required) {
        return array('valid' => true, 'message' => '', 'starts_on' => null, 'ends_on' => null);
    }
    if (!$has_starts_on || !$has_ends_on) {
        return array('valid' => false, 'message' => '活动开始和结束日期必须同时填写', 'starts_on' => null, 'ends_on' => null);
    }

    $starts_on = strval($params['activity_starts_on']);
    $ends_on = strval($params['activity_ends_on']);
    $timezone = new DateTimeZone('Asia/Shanghai');
    foreach (array($starts_on, $ends_on) as $date_value) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_value)) {
            return array('valid' => false, 'message' => '活动日期格式不正确', 'starts_on' => null, 'ends_on' => null);
        }
        $date = DateTime::createFromFormat('!Y-m-d', $date_value, $timezone);
        $date_errors = DateTime::getLastErrors();
        if (!$date || $date->format('Y-m-d') !== $date_value || (is_array($date_errors) && ($date_errors['warning_count'] > 0 || $date_errors['error_count'] > 0))) {
            return array('valid' => false, 'message' => '活动日期格式不正确', 'starts_on' => null, 'ends_on' => null);
        }
    }

    $today = new DateTime('now', $timezone);
    $today_value = $today->format('Y-m-d');
    if ($require_future_start && $starts_on <= $today_value) {
        return array('valid' => false, 'message' => '活动开始日期必须晚于今天', 'starts_on' => null, 'ends_on' => null);
    }
    if ($ends_on < $starts_on) {
        return array('valid' => false, 'message' => '活动结束日期不能早于开始日期', 'starts_on' => null, 'ends_on' => null);
    }

    return array('valid' => true, 'message' => '', 'starts_on' => $starts_on, 'ends_on' => $ends_on);
}

function activity_handler_validate_options($options) {
    $option_ids = array();
    $labels = array();
    foreach ($options as $option) {
        if (!is_array($option) || empty($option['option_name'])) {
            return '问题名称不能为空';
        }
        $option_name = trim(strval($option['option_name']));
        if (mb_strlen($option_name, 'UTF-8') > 45) {
            return '问题名称不能超过 45 个字符';
        }
        $label_key = mb_strtolower($option_name, 'UTF-8');
        if (isset($labels[$label_key])) {
            return '问题名称不能重复';
        }
        $labels[$label_key] = true;

        $option_id = intval(isset($option['option_id']) ? $option['option_id'] : 0);
        if ($option_id > 0) {
            if (isset($option_ids[$option_id])) return '报名字段编号重复';
            $option_ids[$option_id] = true;
        }
        $type_id = intval(isset($option['type_id']) ? $option['type_id'] : 0);
        if (!in_array($type_id, array(1, 3, 6), true)) {
            return '报名字段类型不正确';
        }
        if ($type_id === 1 || $type_id === 3) {
            $cases = isset($option['cases']) && is_array($option['cases']) ? $option['cases'] : array();
            $valid_cases = 0;
            $case_ids = array();
            $case_names = array();
            foreach ($cases as $case) {
                if (!is_array($case) || empty($case['case_name'])) continue;
                $case_name = trim(strval($case['case_name']));
                if (mb_strlen($case_name, 'UTF-8') > 45) {
                    return '「' . $option_name . '」的选项不能超过 45 个字符';
                }
                $case_name_key = mb_strtolower($case_name, 'UTF-8');
                if (isset($case_names[$case_name_key])) {
                    return '「' . $option_name . '」的选项不能重复';
                }
                $case_names[$case_name_key] = true;
                $case_id = intval(isset($case['case_id']) ? $case['case_id'] : 0);
                if ($case_id > 0) {
                    if (isset($case_ids[$case_id])) return '「' . $option_name . '」的选项编号重复';
                    $case_ids[$case_id] = true;
                }
                $valid_cases++;
            }
            if ($valid_cases < 2) {
                return '「' . $option['option_name'] . '」的选项数量不能少于 2 个';
            }
        }
    }
    return null;
}

function activity_handler_check_post_control($con, $user, $bid) {
    if (!defined('CAPUBBS_ENABLE_POST_CONTROL') || !CAPUBBS_ENABLE_POST_CONTROL) return null;
    if (intval($user['verified']) === 0 && intval($user['post']) + intval($user['reply']) <= 20 && intval($bid) !== 28) {
        return '您暂时不能发帖（邮箱未验证）。请先验证邮箱或联系管理员。';
    }
    if (defined('CAPUBBS_ENABLE_EMAIL_MUTE') && CAPUBBS_ENABLE_EMAIL_MUTE && !empty($user['mail'])) {
        $mail = mysqli_real_escape_string($con, $user['mail']);
        $result = mysqli_query($con, "select count(*) as count from email_mutes where email='$mail' and active=1");
        $row = $result ? mysqli_fetch_assoc($result) : null;
        if ($row && intval($row['count']) > 0) {
            return '您暂时不能发帖（邮箱已被管理员禁言）。请先验证邮箱或联系管理员。';
        }
    }
    return null;
}

function activity_handler_check_post_delay($user) {
    $now = time();
    $lastpost = intval($user['lastpost']);
    $delta = intval($user['rights']) >= 1 || intval($user['star']) >= 3 ? 15 : 180;
    if ($now - $lastpost >= 0 && $now - $lastpost <= $delta) {
        return "两次发表的时间间隔不能少于{$delta}秒！";
    }
    return null;
}

function activity_handler_error($code, $message) {
    return array(array('code' => strval($code), 'msg' => $message));
}

function activity_handler_legacy_response($result) {
    $status = isset($result[0]) && is_array($result[0]) ? $result[0] : array('code' => '-1', 'msg' => 'error');
    $payload = array(
        'code' => intval(isset($status['code']) ? $status['code'] : -1),
        'msg' => isset($status['msg']) ? $status['msg'] : '',
    );
    if ($payload['code'] === 0 && isset($result[1]) && is_array($result[1])) {
        foreach ($result[1] as $key => $value) $payload[$key] = $value;
    }
    return $payload;
}
