<?php
/**
 * ============================================================
 * 计数器修复脚本 (Repair Script)
 * ============================================================
 * 根据 threads、posts、sign、messages 表中的实际数据，
 * 重新计算并更新 userinfo 和 threads 表中的计数器。
 *
 * 使用方式: php fix_counters.php [--username=NAME] [--bid=N --tid=N]
 *
 * 警告: 此脚本会修改数据库！请在运行前备份数据。
 *       建议先运行 check_counters.php 查看问题范围。
 *
 * 注意: 当前核心表含 MyISAM，事务无法保证完整回滚。
 *       本脚本不再伪装成“可安全回滚”的事务脚本，而是显式逐步修复。
 * ============================================================
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$opts = getopt('', array('username:', 'bid:', 'tid:'));
$scope = array(
    'username' => isset($opts['username']) ? trim($opts['username']) : '',
    'bid' => isset($opts['bid']) ? intval($opts['bid']) : 0,
    'tid' => isset($opts['tid']) ? intval($opts['tid']) : 0,
);

$con = dbconnect_mysqli();
if (!$con) {
    die("数据库连接失败\n");
}
mysqli_select_db($con, "capubbs");

echo str_repeat("=", 70) . "\n";
echo "CAPUBBS 计数器修复脚本\n";
echo "开始时间: " . date('Y-m-d H:i:s') . "\n";
echo str_repeat("=", 70) . "\n\n";

if ($scope['username'] !== '' || $scope['bid'] > 0 || $scope['tid'] > 0) {
    echo "修复范围:";
    $parts = array();
    if ($scope['username'] !== '') {
        $parts[] = " username=" . $scope['username'];
    }
    if ($scope['bid'] > 0) {
        $parts[] = " bid=" . $scope['bid'];
    }
    if ($scope['tid'] > 0) {
        $parts[] = " tid=" . $scope['tid'];
    }
    echo implode('', $parts) . "\n\n";
}

echo "提示：由于 userinfo / threads / posts 等核心表包含 MyISAM，\n";
echo "本脚本不会开启“看似可回滚”的事务，而是逐步执行修复 SQL。\n\n";

$service = capubbs_maintenance_service($con);
$result = $service->repairCounters($scope);

$labels = array(
    'userinfo_post' => '[1/10] 修复 userinfo.post (非水区发帖数)...',
    'userinfo_reply' => '[2/10] 修复 userinfo.reply (非水区回帖数)...',
    'userinfo_water' => '[3/10] 修复 userinfo.water (水区发帖+回帖总数)...',
    'userinfo_extr' => '[4/10] 修复 userinfo.extr (精华帖数)...',
    'userinfo_sign' => '[5/10] 修复 userinfo.sign (签到次数)...',
    'userinfo_newmsg' => '[6/10] 修复 userinfo.newmsg (未读消息数)...',
    'userinfo_star' => '[7/10] 修复 userinfo.star (用户等级)...',
    'thread_reply' => '[8/10] 修复 threads.reply...',
    'thread_replyer' => '[9/10] 修复 threads.replyer...',
    'thread_timestamp' => '[10/10] 修复 threads.timestamp...',
);

foreach ($labels as $key => $title) {
    echo $title . "\n";
    echo "      更新了 " . intval($result['updated'][$key]) . " 行。\n";
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "全部修复完成。\n";
echo str_repeat("=", 70) . "\n";

echo "\n修复后的统计摘要:\n";
echo str_repeat("-", 70) . "\n";
echo "用户总数      : " . intval($result['summary']['users']) . "\n";
echo "主题总数      : " . intval($result['summary']['threads']) . "\n";
echo "帖子总数      : " . intval($result['summary']['posts']) . "\n";
echo "有发帖的用户  : " . intval($result['summary']['users_with_post']) . "\n";
echo "有回帖的用户  : " . intval($result['summary']['users_with_reply']) . "\n";
echo "有签到的用户  : " . intval($result['summary']['users_with_sign']) . "\n";

mysqli_close($con);
