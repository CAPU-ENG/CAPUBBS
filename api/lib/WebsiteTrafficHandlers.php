<?php

require_once __DIR__ . '/WebsiteTrafficSnapshot.php';

/** Compatibility API: only read the published snapshot; never aggregate on demand. */
function jiekoufunc_website_traffic($con, $params) {
    header('Cache-Control: no-store');
    $period = isset($params['period']) ? $params['period'] : 'week';
    $periods = website_traffic_snapshot_periods();
    if (!is_string($period) || !isset($periods[$period])) return jiekoufunc_report('14', '请选择有效的统计时段。');
    $data = website_traffic_snapshot_read($period);
    if ($data === null) return jiekoufunc_report('8', '网站流量数据暂不可用，请稍后重试。');
    return array(array('code' => '0'), $data);
}
