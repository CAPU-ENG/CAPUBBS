<?php
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function punishment_domain_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function punishment_domain_assert_true($cond, $msg) {
    if (!$cond) {
        punishment_domain_fail($msg);
    }
}

$service = capubbs_punishment_service($con);
$repo = capubbs_punishment_repository($con);
$ts = time();
$username = 'punish_user_' . $ts;
$name = '测试成员' . ($ts % 1000);
$reason = '迟到-' . $ts;
$distance = '3';
$addition = '1';
$startDate = '2099-01-02';
$endDate = '2099-01-10';

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM punishment WHERE username='{$esc($username)}' OR reason='{$esc($reason)}'");

$listBefore = $service->legacyList(array());
punishment_domain_assert_true(isset($listBefore['result']) && is_array($listBefore['result']), 'legacyList should return result array');

$addResult = $service->legacyAdd('组织部', array(
    'action' => 'add',
    'username' => $username,
    'name' => $name,
    'reason' => $reason,
    'distance' => $distance,
    'addition' => $addition,
    'start_date' => $startDate,
), array('_POST' => array(), '_GET' => array()));
punishment_domain_assert_true(isset($addResult['debug']) && strpos($addResult['debug'], 'insert into punishment') !== false, 'legacyAdd debug mismatch');

$row = mysqli_fetch_array(mysqli_query($con, "SELECT id, username, name, reason, distance, addition, is_end, is_deleted FROM punishment WHERE username='{$esc($username)}' AND reason='{$esc($reason)}' ORDER BY id DESC LIMIT 1"), MYSQLI_ASSOC);
punishment_domain_assert_true($row && intval($row['is_deleted']) === 0, 'punishment row not inserted');
$punishmentId = intval($row['id']);

punishment_domain_assert_true($repo->hasActivePunishment($username) === true, 'hasActivePunishment should be true after insert');
$activeUsers = $repo->findActivePunishmentUsernames();
punishment_domain_assert_true(in_array($username, $activeUsers, true), 'active punishment usernames missing target');

$listAll = $service->legacyList(array());
$found = false;
foreach ($listAll['result'] as $item) {
    if (intval($item['id']) === $punishmentId) {
        $found = true;
        break;
    }
}
punishment_domain_assert_true($found, 'legacyList all missing inserted row');

$listYear = $service->legacyList(array('year' => '2099', 'history' => 0));
$foundYear = false;
foreach ($listYear['result'] as $item) {
    if (intval($item['id']) === $punishmentId) {
        $foundYear = true;
        break;
    }
}
punishment_domain_assert_true($foundYear, 'legacyList year missing inserted row');

$updateResult = $service->legacyUpdate('组织部', array(
    'punishment_id' => $punishmentId,
    'action' => 'finish',
    'end_date' => $endDate,
), array('_POST' => array(), '_GET' => array()));
punishment_domain_assert_true(isset($updateResult['debug']) && strpos($updateResult['debug'], 'update punishment set is_end=1') !== false, 'legacyUpdate finish debug mismatch');

$row = mysqli_fetch_array(mysqli_query($con, "SELECT is_end, end_date FROM punishment WHERE id=$punishmentId LIMIT 1"), MYSQLI_ASSOC);
punishment_domain_assert_true($row && intval($row['is_end']) === 1 && $row['end_date'] === $endDate, 'finish update failed');
punishment_domain_assert_true($repo->hasActivePunishment($username) === false, 'hasActivePunishment should be false after finish');

$cancelResult = $service->legacyUpdate('组织部', array(
    'punishment_id' => $punishmentId,
    'action' => 'cancel_finish',
), array('_POST' => array(), '_GET' => array()));
punishment_domain_assert_true(isset($cancelResult['debug']) && strpos($cancelResult['debug'], 'update punishment set is_end=0') !== false, 'legacyUpdate cancel debug mismatch');

$row = mysqli_fetch_array(mysqli_query($con, "SELECT is_end FROM punishment WHERE id=$punishmentId LIMIT 1"), MYSQLI_ASSOC);
punishment_domain_assert_true($row && intval($row['is_end']) === 0, 'cancel finish failed');
punishment_domain_assert_true($repo->hasActivePunishment($username) === true, 'hasActivePunishment should be true after cancel');

$deleteResult = $service->legacyUpdate('组织部', array(
    'punishment_id' => $punishmentId,
    'action' => 'delete',
), array('_POST' => array(), '_GET' => array()));
punishment_domain_assert_true(isset($deleteResult['debug']) && strpos($deleteResult['debug'], 'update punishment set is_deleted=1') !== false, 'legacyUpdate delete debug mismatch');

$row = mysqli_fetch_array(mysqli_query($con, "SELECT is_deleted FROM punishment WHERE id=$punishmentId LIMIT 1"), MYSQLI_ASSOC);
punishment_domain_assert_true($row && intval($row['is_deleted']) === 1, 'soft delete failed');

$listAfterDelete = $service->legacyList(array());
$foundAfterDelete = false;
foreach ($listAfterDelete['result'] as $item) {
    if (intval($item['id']) === $punishmentId) {
        $foundAfterDelete = true;
        break;
    }
}
punishment_domain_assert_true($foundAfterDelete === false, 'deleted punishment should not be listed');
punishment_domain_assert_true($repo->hasActivePunishment($username) === false, 'deleted punishment should not be active');

mysqli_query($con, "DELETE FROM punishment WHERE id=$punishmentId");

echo "punishment-domain-ok\n";
