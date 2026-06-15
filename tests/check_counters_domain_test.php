<?php
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function check_counters_domain_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function check_counters_domain_assert_true($cond, $msg) {
    if (!$cond) {
        check_counters_domain_fail($msg);
    }
}

$service = capubbs_maintenance_service($con);

check_counters_domain_assert_true($service->calculateExpectedStar(0, 0, 0) === 1, 'star tier 1 mismatch');
check_counters_domain_assert_true($service->calculateExpectedStar(10, 10, 0) === 2, 'star tier 2 mismatch');
check_counters_domain_assert_true($service->calculateExpectedStar(200, 200, 0) === 4, 'star tier 4 mismatch');
check_counters_domain_assert_true($service->calculateExpectedStar(5000, 0, 0) === 9, 'star tier 9 mismatch');
check_counters_domain_assert_true($service->calculateExpectedStar(0, 0, 7) === 7, 'other2 override mismatch');

$report = $service->analyzeCounterConsistency();
check_counters_domain_assert_true(is_array($report), 'report should be array');
check_counters_domain_assert_true(isset($report['sections']) && is_array($report['sections']), 'sections missing');
check_counters_domain_assert_true(isset($report['totalIssues']) && intval($report['totalIssues']) >= 0, 'totalIssues missing');

$requiredSections = array(
    'userinfo_post',
    'userinfo_reply',
    'userinfo_water',
    'userinfo_extr',
    'userinfo_sign',
    'userinfo_newmsg',
    'thread_reply',
    'thread_replyer',
    'userinfo_star',
    'thread_pid_continuity',
    'thread_timestamp',
);

foreach ($requiredSections as $sectionKey) {
    check_counters_domain_assert_true(isset($report['sections'][$sectionKey]), 'missing section: ' . $sectionKey);
    $section = $report['sections'][$sectionKey];
    check_counters_domain_assert_true(isset($section['count']), 'missing section count: ' . $sectionKey);
    check_counters_domain_assert_true(isset($section['rows']) && is_array($section['rows']), 'missing section rows: ' . $sectionKey);
}

echo "check-counters-domain-ok\n";
