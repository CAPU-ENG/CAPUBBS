<?php

/** Daily forum page-view totals, including guests and repeat visits. */
function jiekoufunc_website_traffic($con, $params) {
    header('Cache-Control: no-store');
    $period = isset($params['period']) ? $params['period'] : 'week';
    $period_days = array('week' => 7, 'month' => 30, 'year' => 365);
    if (!is_string($period) || !isset($period_days[$period])) {
        return jiekoufunc_report('14', '请选择有效的统计时段。');
    }

    $length = $period_days[$period];
    $today = new DateTimeImmutable('today', new DateTimeZone('Asia/Shanghai'));
    $start = $today->modify('-' . ($length - 1) . ' days');
    $start_date = $start->format('Y-m-d');
    $end_date = $today->format('Y-m-d');
    $dates = array();
    $date_indexes = array();
    for ($index = 0; $index < $length; $index++) {
        $date = $start->modify('+' . $index . ' days')->format('Y-m-d');
        $dates[] = $date;
        $date_indexes[$date] = $index;
    }

    $board_result = mysqli_query($con, 'select bid, name from boardinfo order by bid asc');
    if (!$board_result) return jiekoufunc_report('8', '网站流量读取失败，请稍后重试。');
    $boards = array();
    while ($row = mysqli_fetch_assoc($board_result)) {
        $bid = intval($row['bid']);
        if ($bid <= 0) continue;
        $boards[$bid] = array('bid' => $bid, 'name' => strval($row['name']), 'views' => array_fill(0, $length, 0));
    }

    // Sum the stored counters across every user/IP. Do not join threads: removing
    // a thread must not remove its past traffic. Pre-counter records retain their known minimum.
    $result = mysqli_query($con, "
        select date, bid, sum(view_times) as view_times
        from username_view
        where date>='$start_date' and date<='$end_date'
        group by date, bid
        order by date asc, bid asc");
    if (!$result) return jiekoufunc_report('8', '网站流量读取失败，请稍后重试。');

    $total = array_fill(0, $length, 0);
    while ($row = mysqli_fetch_assoc($result)) {
        if (!isset($date_indexes[$row['date']])) continue;
        $index = $date_indexes[$row['date']];
        $bid = max(0, intval($row['bid']));
        if (!isset($boards[$bid])) {
            $boards[$bid] = array(
                'bid' => $bid,
                'name' => $bid > 0 ? '版块 ' . $bid : '未归属版块',
                'views' => array_fill(0, $length, 0),
            );
        }
        $count = intval($row['view_times']);
        $boards[$bid]['views'][$index] += $count;
        $total[$index] += $count;
    }
    ksort($boards, SORT_NUMERIC);

    return array(array('code' => '0'), array(
        'period' => $period,
        'startDate' => $start_date,
        'endDate' => $end_date,
        'dates' => $dates,
        'total' => $total,
        'boards' => array_values($boards),
    ));
}
