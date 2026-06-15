<?php
/**
 * 检查 posts 表中 text 字段是否含有非法 XML 1.0 控制字符。
 *
 * XML 1.0 允许的控制字符只有: 0x09 (tab), 0x0A (LF), 0x0D (CR)。
 * 其余 0x00~0x1F 即使在 CDATA 内也是非法的。
 *
 * 用法: php check_posts_dirty.php [--bid=N] [--tid=N] [--pid=N] [--fid=N]
 *   --bid=N  仅检查指定 bid
 *   --tid=N  仅检查指定 tid (需同时指定 bid)
 *   --pid=N  仅检查指定 pid (需同时指定 bid 和 tid)
 *   --fid=N  仅检查指定 fid
 * 不带参数则检查全表。
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$opts = getopt('', ['bid:', 'tid:', 'pid:', 'fid:']);
$bid  = isset($opts['bid'])  ? intval($opts['bid'])  : 0;
$tid  = isset($opts['tid'])  ? intval($opts['tid'])  : 0;
$pid  = isset($opts['pid'])  ? intval($opts['pid'])  : 0;
$fid  = isset($opts['fid'])  ? intval($opts['fid'])  : 0;

$con = dbconnect_mysqli();
if (!$con) {
    die("数据库连接失败\n");
}
mysqli_select_db($con, "capubbs");

$filters = array(
    'fid' => $fid,
    'bid' => $bid,
    'tid' => $tid,
    'pid' => $pid,
);
$displayFilters = array();
foreach ($filters as $key => $value) {
    if (intval($value) > 0) {
        $displayFilters[] = $key . ' = ' . intval($value);
    }
}

echo "=== 检查 posts 表中 text 字段的非法 XML 控制字符 ===\n";
if ($displayFilters) {
    echo "过滤条件: " . implode(', ', $displayFilters) . "\n";
}
echo "\n";
$report = capubbs_maintenance_service($con)->analyzeDirtyPosts($filters);
echo "检查范围行数: {$report['rowCount']}\n\n";

foreach ($report['errors'] as $error) {
    printf("  [错误] 0x%02X: %s\n", intval($error['codepoint']), $error['error']);
}

$codepointCounts = array();
foreach ($report['matches'] as $info) {
    foreach ($info['chars'] as $cp) {
        if (!isset($codepointCounts[$cp])) {
            $codepointCounts[$cp] = 0;
        }
        $codepointCounts[$cp]++;
    }
}
ksort($codepointCounts);
foreach ($codepointCounts as $cp => $count) {
    printf("  0x%02X (U+%04X): %d 行\n", $cp, $cp, $count);
}

// 汇总报告
echo "\n=== 汇总 ===\n";

if (count($report['matches']) == 0) {
    echo "未发现任何 posts.text 包含非法 XML 控制字符。\n";
} else {
    printf("共发现 %d 个不同的 post (按 fid) 含有非法字符:\n\n", count($report['matches']));

    foreach ($report['matches'] as $fid => $info) {
        $row = $info['row'];
        $chars = $info['chars'];
        $hex_chars = array_map(function ($c) { return sprintf("0x%02X", $c); }, $chars);

        printf(
            "fid=%d  bid=%d  tid=%d  pid=%d  author=%s\n",
            $row['fid'], $row['bid'], $row['tid'], $row['pid'], $row['author']
        );
        printf("  非法字符: %s\n", implode(', ', $hex_chars));
        printf("  text 预览: %s\n", mb_substr($row['preview'], 0, 60, 'utf-8'));
        echo "\n";
    }

    // 输出需要修复的 fid 列表
    echo "--- 需要修复的 fid 列表 (可直接用于 SQL IN 条件) ---\n";
    echo "fid IN (" . implode(', ', array_keys($report['matches'])) . ")\n";
}

mysqli_close($con);
echo "\n完成。\n";
