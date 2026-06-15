<?php
/**
 * ============================================================
 * 数据一致性分析脚本 (Analysis Script)
 * ============================================================
 * 检查 userinfo、threads、posts、sign、messages 表之间的
 * 计数器是否一致，找出所有不一致的记录。
 *
 * 使用方式: php check_counters.php > analysis_report.txt
 *
 * 注意: 此脚本只读，不修改任何数据。
 * ============================================================
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$con = dbconnect_mysqli();
if (!$con) {
    die("数据库连接失败\n");
}
mysqli_select_db($con, "capubbs");

$report = capubbs_maintenance_service($con)->analyzeCounterConsistency();

echo str_repeat("=", 70) . "\n";
echo "CAPUBBS 数据一致性分析报告\n";
echo "生成时间: " . date('Y-m-d H:i:s') . "\n";
echo str_repeat("=", 70) . "\n\n";

function check_counters_title($index, $title) {
    echo ($index > 1 ? "\n" : "") . str_repeat("-", 70) . "\n";
    echo "[检查 {$index}] {$title}\n";
    echo str_repeat("-", 70) . "\n";
}

function check_counters_short_title($title, $maxLength) {
    if (mb_strlen($title, 'UTF-8') > $maxLength) {
        return mb_substr($title, 0, $maxLength, 'UTF-8') . '...';
    }
    return $title;
}

function check_counters_print_user_counter_rows($rows, $fieldLabel) {
    $issues = 0;
    foreach ($rows as $row) {
        $issues++;
        printf("  %-20s %s=%-6d  实际=%-6d  差异=%+d\n",
            $row['username'], $fieldLabel, $row['stored_count'], $row['actual_count'], $row['diff']);
    }
    return $issues;
}

$index = 1;

$simpleMap = array(
    'userinfo_post' => 'userinfo.post',
    'userinfo_reply' => 'userinfo.reply',
    'userinfo_water' => 'userinfo.water',
    'userinfo_extr' => 'userinfo.extr',
    'userinfo_sign' => 'userinfo.sign',
    'userinfo_newmsg' => 'userinfo.newmsg',
);

foreach ($simpleMap as $sectionKey => $fieldLabel) {
    $section = $report['sections'][$sectionKey];
    check_counters_title($index++, $section['title']);
    $issues = check_counters_print_user_counter_rows($section['rows'], $fieldLabel);
    if ($issues === 0) {
        echo "  无异常。\n";
    } else {
        echo "  共发现 {$section['count']} 条不一致记录。\n";
    }
}

$section = $report['sections']['thread_reply'];
check_counters_title($index++, $section['title']);
$issues = 0;
foreach ($section['rows'] as $row) {
    $issues++;
    $titleDisplay = check_counters_short_title($row['title'], 20);
    printf("  bid=%-3d tid=%-6d [%s] stored=%-5d expected=%-5d diff=%+d\n",
        $row['bid'], $row['tid'], $titleDisplay,
        $row['stored_count'], $row['expected_reply'], $row['diff']);
}
if ($issues === 0) {
    echo "  无异常。\n";
} else {
    if ($section['count'] > $section['displayLimit']) {
        echo "  ... 以及另外 " . ($section['count'] - $section['displayLimit']) . " 条记录（仅显示前{$section['displayLimit']}条）。\n";
    }
    echo "  共发现 {$section['count']} 条不一致记录。\n";
}

$section = $report['sections']['thread_replyer'];
check_counters_title($index++, $section['title']);
$issues = 0;
foreach ($section['rows'] as $row) {
    $issues++;
    $titleDisplay = check_counters_short_title($row['title'], 20);
    printf("  bid=%-3d tid=%-6d [%s] stored_replyer=%-15s actual=%-15s\n",
        $row['bid'], $row['tid'], $titleDisplay,
        isset($row['stored_replyer']) ? $row['stored_replyer'] : '(null)',
        isset($row['actual_last_author']) ? $row['actual_last_author'] : '(null)');
}
if ($issues === 0) {
    echo "  无异常。\n";
} else {
    if ($section['count'] > $section['displayLimit']) {
        echo "  ... 以及另外 " . ($section['count'] - $section['displayLimit']) . " 条记录（仅显示前{$section['displayLimit']}条）。\n";
    }
    echo "  共发现 {$section['count']} 条不一致记录。\n";
}

$section = $report['sections']['userinfo_star'];
check_counters_title($index++, $section['title']);
$issues = 0;
foreach ($section['rows'] as $row) {
    $issues++;
    printf("  %-20s post=%-5d reply=%-5d total=%-6d stored_star=%d expected=%d (other2=%s)\n",
        $row['username'], $row['post'], $row['reply'], $row['total'],
        $row['star'], $row['expected_star'], isset($row['other2']) ? $row['other2'] : 'NULL');
}
if ($issues === 0) {
    echo "  无异常。\n";
} else {
    echo "  共发现 {$section['count']} 条不一致记录。\n";
}

$section = $report['sections']['thread_pid_continuity'];
check_counters_title($index++, $section['title']);
$issues = 0;
foreach ($section['rows'] as $row) {
    $issues++;
    $problems = array();
    if (intval($row['min_pid']) !== 1) {
        $problems[] = "起始 pid={$row['min_pid']}(非1)";
    }
    if (intval($row['max_pid']) !== intval($row['cnt'])) {
        $problems[] = "max={$row['max_pid']} vs count={$row['cnt']}(存在间断)";
    }
    if (intval($row['distinct_pids']) !== intval($row['cnt'])) {
        $problems[] = "distinct={$row['distinct_pids']} vs total={$row['cnt']}(存在重复)";
    }
    printf("  bid=%-3d tid=%-6d min=%-4d max=%-4d count=%-4d distinct=%-4d | %s\n",
        $row['bid'], $row['tid'], $row['min_pid'], $row['max_pid'],
        $row['cnt'], $row['distinct_pids'], implode('; ', $problems));
}
if ($issues === 0) {
    echo "  无异常。\n";
} else {
    if ($section['count'] > $section['displayLimit']) {
        echo "  ... 以及另外 " . ($section['count'] - $section['displayLimit']) . " 条记录（仅显示前{$section['displayLimit']}条）。\n";
    }
    echo "  共发现 {$section['count']} 条不一致记录。\n";
}

$section = $report['sections']['thread_timestamp'];
check_counters_title($index++, $section['title']);
$issues = 0;
foreach ($section['rows'] as $row) {
    $issues++;
    $titleDisplay = check_counters_short_title($row['title'], 20);
    printf("  bid=%-3d tid=%-6d [%s] stored_ts=%s actual_ts=%s\n",
        $row['bid'], $row['tid'], $titleDisplay,
        $row['stored_ts'], $row['actual_replytime']);
}
if ($issues === 0) {
    echo "  无异常。\n";
} else {
    if ($section['count'] > $section['displayLimit']) {
        echo "  ... 以及另外 " . ($section['count'] - $section['displayLimit']) . " 条记录（仅显示前{$section['displayLimit']}条）。\n";
    }
    echo "  共发现 {$section['count']} 条不一致记录。\n";
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "分析完成。共发现 {$report['totalIssues']} 条不一致记录。\n";
echo str_repeat("=", 70) . "\n";

mysqli_close($con);
