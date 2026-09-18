<?php

/** Public daily totals for a user's activity heatmap; never exposes visit details. */
function jiekoufunc_user_activity($con, $params) {
    header('Cache-Control: no-store');
    $username = isset($params['username']) && is_string($params['username'])
        ? trim($params['username']) : '';
    if ($username === '' || strlen($username) > 120) {
        return jiekoufunc_report('14', '请提供有效的用户名。');
    }

    $escaped = mysqli_real_escape_string($con, $username);
    $user_result = mysqli_query($con, "select username from userinfo where username='$escaped' limit 1");
    if (!$user_result) return jiekoufunc_report('8', '活跃度读取失败，请稍后重试。');
    $user = mysqli_fetch_assoc($user_result);
    if (!$user) return jiekoufunc_report('3', '用户不存在。');

    $timezone = new DateTimeZone('Asia/Shanghai');
    $today = new DateTimeImmutable('today', $timezone);
    $end_date = $today->format('Y-m-d');
    $start_date = $today->modify('-364 days')->format('Y-m-d');
    // Keep repeat visits, all source IPs and visits to since-deleted threads.
    // Before view_times was introduced, existing rows only retain a minimum of one visit.
    $result = mysqli_query($con, "
        select date, sum(view_times) as view_times
        from username_view
        where username='$escaped' and date>='$start_date' and date<='$end_date'
        group by date
        order by date asc");
    if (!$result) return jiekoufunc_report('8', '活跃度读取失败，请稍后重试。');

    $days = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $row['date'], $timezone);
        if (!$date || $date->format('Y-m-d') !== $row['date']) continue;
        $days[] = array('date' => $row['date'], 'viewTimes' => intval($row['view_times']));
    }

    return array(array('code' => '0'), array(
        'username' => $user['username'],
        'startDate' => $start_date,
        'endDate' => $end_date,
        'days' => $days,
    ));
}
