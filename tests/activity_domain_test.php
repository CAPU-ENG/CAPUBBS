<?php
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function activity_domain_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function activity_domain_assert_true($cond, $msg) {
    if (!$cond) {
        activity_domain_fail($msg);
    }
}

$service = capubbs_activity_service($con);
$repo = capubbs_activity_repository($con);
$postRepo = capubbs_post_repository($con);
$threadRepo = capubbs_thread_repository($con);

$ts = time();
$bid = 28;
$leader = 'activity_leader_' . $ts;
$member = 'activity_member_' . $ts;
$leaderToken = md5($leader . '_token');
$memberToken = md5($member . '_token');
$date = date('Y-m-d');
$ip = '127.0.0.1';
$title = 'activity-domain-' . $ts;
$threadTitle = $title . '-thread';
$threadReplyTitle = 'Re: ' . $threadTitle;

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

function activity_domain_insert_user($con, $username, $token, $date, $ip) {
    $esc = function($value) use ($con) {
        return mysqli_real_escape_string($con, $value);
    };
    mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($username)}'");
    mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights)
        VALUES ('{$esc($username)}','" . strtoupper(md5('test123456')) . "','{$esc($token)}'," . time() . ",'男','/bbsimg/icons/default.jpg','{$esc($username)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',1)");
    if (mysqli_errno($con)) {
        activity_domain_fail('insert user failed: ' . mysqli_error($con));
    }
}

function activity_domain_cleanup($con, $bid, $tid, $activityId, $leader, $member, $title, $threadTitle, $threadReplyTitle) {
    $esc = function($value) use ($con) {
        return mysqli_real_escape_string($con, $value);
    };
    if ($activityId > 0) {
        mysqli_query($con, "DELETE FROM season_join_option_value WHERE join_id IN (SELECT join_id FROM season_activity_join WHERE activity_id=$activityId)");
        mysqli_query($con, "DELETE FROM season_activity_join WHERE activity_id=$activityId");
        mysqli_query($con, "DELETE FROM season_option_case WHERE option_id IN (SELECT id FROM season_activity_option WHERE activity_id=$activityId)");
        mysqli_query($con, "DELETE FROM season_activity_option WHERE activity_id=$activityId");
        mysqli_query($con, "DELETE FROM activity_join_remind WHERE activity_id=$activityId");
        mysqli_query($con, "DELETE FROM season_threads_activity WHERE activity_id=$activityId");
    }
    if ($tid > 0) {
        mysqli_query($con, "DELETE FROM posts WHERE bid=$bid AND tid=$tid");
        mysqli_query($con, "DELETE FROM threads WHERE bid=$bid AND tid=$tid");
        mysqli_query($con, "DELETE FROM thread_global_top WHERE bid=$bid AND tid=$tid");
    }
    mysqli_query($con, "DELETE FROM messages
        WHERE
            rmsg='{$esc($title)}'
            OR rmsg='{$esc($threadTitle)}'
            OR rmsg='{$esc($threadReplyTitle)}'
            OR (
                sender='system'
                AND (receiver='{$esc($leader)}' OR receiver='{$esc($member)}' OR ruser='{$esc($leader)}' OR ruser='{$esc($member)}')
            )");
    mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($leader)}' OR username='{$esc($member)}'");
}

activity_domain_insert_user($con, $leader, $leaderToken, $date, $ip);
activity_domain_insert_user($con, $member, $memberToken, $date, $ip);

$activityId = 0;
$tid = 0;

try {
    $options = array(
        array(
            'type_id' => 6,
            'option_name' => '姓名',
            'required' => 1,
            'comment' => '请输入真实姓名',
            'hiden' => 0,
        ),
        array(
            'type_id' => 1,
            'option_name' => '组别',
            'required' => 1,
            'comment' => '请选择组别',
            'hiden' => 0,
            'cases' => array(
                array('case_name' => 'A组', 'comment' => ''),
                array('case_name' => 'B组', 'comment' => ''),
            ),
        ),
        array(
            'type_id' => 3,
            'option_name' => '装备',
            'required' => 0,
            'comment' => '可多选',
            'hiden' => 0,
            'cases' => array(
                array('case_name' => '头盔', 'comment' => ''),
                array('case_name' => '手套', 'comment' => ''),
            ),
        ),
    );

    $create = $service->createActivity($leader, $bid, $threadTitle, $title, $options, 1, '');
    $tid = intval(isset($create['tid']) ? $create['tid'] : 0);
    $activityId = intval(isset($create['activity_id']) ? $create['activity_id'] : 0);
    activity_domain_assert_true($tid > 0 && $activityId > 0, 'createActivity result invalid');

    $activity = $service->getActivity($bid, $tid);
    activity_domain_assert_true($activity && intval($activity['activity_id']) === $activityId, 'getActivity activity id mismatch');
    activity_domain_assert_true($activity['leader_username'] === $leader, 'getActivity leader mismatch');
    activity_domain_assert_true(count($activity['options']) === 3, 'getActivity options mismatch');

    $nameOptionId = intval($activity['options'][0]['option_id']);
    $groupOptionId = intval($activity['options'][1]['option_id']);
    $gearOptionId = intval($activity['options'][2]['option_id']);
    $groupACaseId = intval($activity['options'][1]['cases'][0]['case_id']);
    $groupBCaseId = intval($activity['options'][1]['cases'][1]['case_id']);
    $gearHelmetCaseId = intval($activity['options'][2]['cases'][0]['case_id']);
    $gearGloveCaseId = intval($activity['options'][2]['cases'][1]['case_id']);

    $join = $service->joinActivityByContent($memberToken, $bid, $tid, $member, array(
        $nameOptionId => '测试成员',
        $groupOptionId => strval($groupACaseId),
        $gearOptionId => $gearHelmetCaseId . ',' . $gearGloveCaseId,
        'sign' => 2,
    ), $threadReplyTitle, 2, '', $ip);
    activity_domain_assert_true(isset($join['code']) && intval($join['code']) === 0, 'joinActivityByContent failed: ' . json_encode($join, JSON_UNESCAPED_UNICODE));

    $joinRow = $repo->findJoinByActivityAndUsername($activityId, $member);
    activity_domain_assert_true($joinRow && intval($joinRow['post_fid']) > 0, 'join row missing');
    $postFid = intval($joinRow['post_fid']);
    $postRow = $postRepo->findByFid($postFid);
    activity_domain_assert_true($postRow && intval($postRow['sig']) === 2, 'join post missing or sign mismatch');
    activity_domain_assert_true(strpos($postRow['text'], '测试成员') !== false, 'join post text missing name');
    activity_domain_assert_true(strpos($postRow['text'], 'A组') !== false, 'join post text missing single choice');
    activity_domain_assert_true(strpos($postRow['text'], '头盔') !== false && strpos($postRow['text'], '手套') !== false, 'join post text missing multi choice');

    $values = $service->getUsernameOptionValue($member, $activityId);
    activity_domain_assert_true(isset($values[$nameOptionId]) && $values[$nameOptionId] === '测试成员', 'getUsernameOptionValue name mismatch');
    activity_domain_assert_true(isset($values['sign']) && intval($values['sign']) === 2, 'getUsernameOptionValue sign mismatch');

    $joinList = $service->getActivityJoin($activityId);
    activity_domain_assert_true(count($joinList) === 1, 'getActivityJoin count mismatch');
    activity_domain_assert_true($joinList[0]['username'] === $member, 'getActivityJoin username mismatch');
    activity_domain_assert_true(intval($joinList[0]['cancel']) === 0, 'getActivityJoin cancel mismatch');
    activity_domain_assert_true(intval($joinList[0]['has_punishment']) === 0, 'getActivityJoin punishment mismatch');

    $modify = $service->modifyJoinActivityByContent($memberToken, $bid, $tid, $member, array(
        $nameOptionId => '修改成员',
        $groupOptionId => strval($groupBCaseId),
        $gearOptionId => strval($gearGloveCaseId),
        'sign' => 3,
    ), $threadReplyTitle, 3, '', $ip);
    activity_domain_assert_true(isset($modify['code']) && intval($modify['code']) === 0, 'modifyJoinActivityByContent failed');

    $values = $service->getUsernameOptionValue($member, $activityId);
    activity_domain_assert_true($values[$nameOptionId] === '修改成员', 'modified name mismatch');
    activity_domain_assert_true($values[$groupOptionId] === strval($groupBCaseId), 'modified group mismatch');
    $postRow = $postRepo->findByFid($postFid);
    activity_domain_assert_true($postRow && intval($postRow['sig']) === 3, 'modified sign mismatch');
    activity_domain_assert_true(strpos($postRow['text'], '修改成员') !== false, 'modified text missing name');
    activity_domain_assert_true(strpos($postRow['text'], 'B组') !== false, 'modified text missing changed option');
    activity_domain_assert_true(strpos($postRow['text'], '手套') !== false, 'modified text missing changed multi choice');

    $cancel = $service->cancelJoinActivityByContent($memberToken, $bid, $tid, $member, '', 0, '', $ip, true);
    activity_domain_assert_true(isset($cancel['code']) && intval($cancel['code']) === 0, 'cancelJoinActivityByContent failed');
    $joinRow = $repo->findJoinByActivityAndUsername($activityId, $member);
    activity_domain_assert_true($joinRow && intval($joinRow['cancel']) === 1, 'cancel flag not updated');
    $postRow = $postRepo->findByFid($postFid);
    activity_domain_assert_true($postRow && strpos($postRow['text'], '<strike>') === 0, 'cancel post text not wrapped');
    activity_domain_assert_true(intval($postRow['sig']) === 0, 'cancel sign should be 0');

    $restore = $service->cancelJoinActivityByContent($memberToken, $bid, $tid, $member, '', 0, '', $ip, false);
    activity_domain_assert_true(isset($restore['code']) && intval($restore['code']) === 0, 'restoreJoinActivityByContent failed');
    $joinRow = $repo->findJoinByActivityAndUsername($activityId, $member);
    activity_domain_assert_true($joinRow && intval($joinRow['cancel']) === 0, 'restore cancel flag mismatch');
    $postRow = $postRepo->findByFid($postFid);
    activity_domain_assert_true($postRow && strpos($postRow['text'], '<strike>') === false, 'restore post text still wrapped');
    activity_domain_assert_true(intval($postRow['sig']) === 0, 'restore sign should keep legacy 0');

    $floorNum1 = $service->getFloorNumInActivity($member, $activityId);
    $floorNum2 = $service->getFloorNumInThread($member, $bid, $tid);
    activity_domain_assert_true($floorNum1 === 2, 'getFloorNumInActivity mismatch');
    activity_domain_assert_true($floorNum2 === 2, 'getFloorNumInThread mismatch');

    $detailActivity = $repo->findThreadActivityDetail($bid, $tid);
    activity_domain_assert_true($detailActivity && intval($detailActivity['activity_id']) === $activityId, 'repository detail mismatch');

    $threadRow = $threadRepo->findByBidTid($bid, $tid);
    activity_domain_assert_true($threadRow && intval($threadRow['reply']) === 1, 'thread reply count mismatch');
} finally {
    activity_domain_cleanup($con, $bid, $tid, $activityId, $leader, $member, $title, $threadTitle, $threadReplyTitle);
}

echo "activity-domain-ok\n";
