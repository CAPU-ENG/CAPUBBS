<?php
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';
require_once __DIR__ . '/../api/dispatch.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function dispatch_default_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function dispatch_default_assert_true($cond, $msg) {
    if (!$cond) {
        dispatch_default_fail($msg);
    }
}

$ts = time();
$bid = 28;
$leader = 'dispatch_leader_' . $ts;
$viewer = 'dispatch_viewer_' . $ts;
$leaderToken = md5($leader . '_token');
$viewerToken = md5($viewer . '_token');
$date = date('Y-m-d');
$ip = '127.0.0.1';
$title = 'dispatch-default-' . $ts;
$replyTitle = 'Re: ' . $title;
$body = 'body-' . $ts;

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($leader)}' OR username='{$esc($viewer)}'");
mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights)
    VALUES
    ('{$esc($leader)}','" . strtoupper(md5('test123456')) . "','{$esc($leaderToken)}'," . time() . ",'男','/bbsimg/icons/default.jpg','{$esc($leader)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',1),
    ('{$esc($viewer)}','" . strtoupper(md5('test123456')) . "','{$esc($viewerToken)}'," . time() . ",'男','/bbsimg/icons/default.jpg','{$esc($viewer)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',1)");
if (mysqli_errno($con)) {
    dispatch_default_fail('insert users failed: ' . mysqli_error($con));
}

$tid = 0;
$fid = 0;
$replyPid = 0;
$replyFid = 0;

try {
    $tid = capubbs_thread_repository($con)->findMaxTidIncludingTrash($bid) + 1;
    $time = time();
    $postdate = date('Y-m-d');

    capubbs_thread_repository($con)->insertThread($bid, $tid, $title, $leader, $time, $postdate);
    $fid = capubbs_post_repository($con)->insertPost($bid, $tid, 1, $title, $leader, $body, 'YES', '', $time, $time, 1, $ip, 'web', 0);
    dispatch_default_assert_true($fid !== false, 'insert main post failed');

    $replyPid = 2;
    $replyFid = capubbs_post_repository($con)->insertPost($bid, $tid, $replyPid, $replyTitle, $viewer, 'reply-body', 'YES', '', $time + 1, $time + 1, 0, $ip, 'web', 0);
    dispatch_default_assert_true($replyFid !== false, 'insert reply failed');
    capubbs_thread_repository($con)->incrementReply($bid, $tid, $viewer, $time + 1);

    $boardResult = jiekoufunc_dispatch($con, array(
        'bid' => $bid,
        'p' => 1,
        'token' => $viewerToken,
        'ip' => $ip,
    ));
    dispatch_default_assert_true(is_array($boardResult) && count($boardResult) >= 1, 'board default result empty');
    $foundBoardThread = false;
    foreach ($boardResult as $row) {
        if (isset($row['tid']) && intval($row['tid']) === $tid) {
            $foundBoardThread = true;
            dispatch_default_assert_true(isset($row['title']) && $row['title'] === $title, 'board thread title mismatch');
            break;
        }
    }
    dispatch_default_assert_true($foundBoardThread, 'board default missing thread');

    $threadBefore = capubbs_thread_repository($con)->findByBidTid($bid, $tid);
    $clickBefore = intval(isset($threadBefore['click']) ? $threadBefore['click'] : 0);

    $threadResult = jiekoufunc_dispatch($con, array(
        'bid' => $bid,
        'tid' => $tid,
        'p' => 1,
        'token' => $viewerToken,
        'ip' => $ip,
    ));
    dispatch_default_assert_true(is_array($threadResult) && count($threadResult) === 2, 'thread default page size mismatch');
    dispatch_default_assert_true(intval($threadResult[0]['pid']) === 1, 'thread default main post pid mismatch');
    dispatch_default_assert_true(intval($threadResult[1]['pid']) === 2, 'thread default reply pid mismatch');

    $threadAfter = capubbs_thread_repository($con)->findByBidTid($bid, $tid);
    $clickAfter = intval(isset($threadAfter['click']) ? $threadAfter['click'] : 0);
    dispatch_default_assert_true($clickAfter === $clickBefore + 1, 'thread default should increment click');

    $fidResult = jiekoufunc_dispatch($con, array(
        'bid' => $bid,
        'tid' => $tid,
        'fid' => $replyFid,
        'token' => $viewerToken,
        'ip' => $ip,
    ));
    dispatch_default_assert_true(count($fidResult) === 1 && intval($fidResult[0]['fid']) === intval($replyFid), 'fid lookup mismatch');

    $pidResult = jiekoufunc_dispatch($con, array(
        'bid' => $bid,
        'tid' => $tid,
        'pid' => $replyPid,
        'token' => $viewerToken,
        'ip' => $ip,
    ));
    dispatch_default_assert_true(count($pidResult) === 1 && intval($pidResult[0]['pid']) === $replyPid, 'pid lookup mismatch');

    $seeLzResult = jiekoufunc_dispatch($con, array(
        'bid' => $bid,
        'tid' => $tid,
        'see_lz' => '1',
        'p' => 1,
        'token' => $viewerToken,
        'ip' => $ip,
    ));
    dispatch_default_assert_true(count($seeLzResult) === 1, 'see_lz should only return leader posts');
    dispatch_default_assert_true(intval($seeLzResult[0]['pid']) === 1, 'see_lz main post mismatch');

    $viewerRow = capubbs_user_repository($con)->findRawUserByUsername($viewer);
    dispatch_default_assert_true($viewerRow && intval($viewerRow['nowboard']) === $bid, 'board session nowboard mismatch');
} finally {
    if ($tid > 0) {
        mysqli_query($con, "DELETE FROM posts WHERE bid=$bid AND tid=$tid");
        mysqli_query($con, "DELETE FROM threads WHERE bid=$bid AND tid=$tid");
        mysqli_query($con, "DELETE FROM thread_global_top WHERE bid=$bid AND tid=$tid");
    }
    mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($leader)}' OR username='{$esc($viewer)}'");
}

echo "dispatch-default-domain-ok\n";
