<?php

/** Personal browsing history, deduplicated only when reading existing visits. */
function jiekoufunc_browsing_history($con, $token) {
    header('Cache-Control: private, no-store');
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) return jiekoufunc_report('-2', '请先登录');

    $username = mysqli_real_escape_string($con, $user['username']);
    $today = new DateTimeImmutable('today', new DateTimeZone('Asia/Shanghai'));
    $end_date = $today->format('Y-m-d');
    $start_date = $today->modify('-6 days')->format('Y-m-d');

    // Both the production varchar date and the local DATE column use YYYY-MM-DD.
    // Different IPs are one daily visit in this view; source rows remain intact.
    // There is no visit timestamp, so thread IDs provide a stable within-day order.
    $statement = "
        select visits.date, threads.bid, threads.tid, threads.title, threads.author,
            boardinfo.name as board_name
        from (
            select distinct date, bid, tid
            from username_view
            where username='$username' and date>='$start_date' and date<='$end_date'
        ) as visits
        inner join threads on threads.bid=visits.bid and threads.tid=visits.tid
        inner join boardinfo on boardinfo.bid=threads.bid
        order by visits.date desc, threads.tid desc, threads.bid asc";
    $result = mysqli_query($con, $statement);
    if (!$result) return jiekoufunc_report('8', '浏览记录读取失败，请稍后重试。');

    $days = array();
    $day_indexes = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $date = $row['date'];
        if (!isset($day_indexes[$date])) {
            $day_indexes[$date] = count($days);
            $days[] = array('date' => $date, 'threads' => array());
        }
        $days[$day_indexes[$date]]['threads'][] = array(
            'bid' => intval($row['bid']),
            'tid' => intval($row['tid']),
            'title' => strval($row['title']),
            'author' => strval($row['author']),
            'board' => strval($row['board_name']),
        );
    }

    return array(array('code' => '0'), array(
        'startDate' => $start_date,
        'endDate' => $end_date,
        'days' => $days,
    ));
}
