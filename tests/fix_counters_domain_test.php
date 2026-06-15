<?php
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function fix_counters_domain_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function fix_counters_domain_assert_true($cond, $msg) {
    if (!$cond) {
        fix_counters_domain_fail($msg);
    }
}

$service = capubbs_maintenance_service($con);
$threadRepo = capubbs_thread_repository($con);
$postRepo = capubbs_post_repository($con);

$ts = time();
$user = 'fix_counter_user_' . $ts;
$token = md5($user . '_token');
$date = date('Y-m-d');
$ip = '127.0.0.1';
$bid = 28;
$tid = $threadRepo->findMaxTidIncludingTrash($bid) + 1;
$title = 'fix-counter-thread-' . $ts;

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($user)}'");
mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights,newmsg)
    VALUES ('{$esc($user)}','" . strtoupper(md5('test123456')) . "','{$esc($token)}'," . time() . ",'男','/bbsimg/icons/default.jpg','{$esc($user)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',99,88,7,0,0,1,'web',1,11)");
if (mysqli_errno($con)) {
    fix_counters_domain_fail('insert user failed: ' . mysqli_error($con));
}

try {
    $threadRepo->insertThread($bid, $tid, $title, $user, time(), $date);
    $postRepo->insertPost($bid, $tid, 1, $title, $user, 'main', 'YES', '', time(), time(), 1, $ip, 'web', 0);
    $postRepo->insertPost($bid, $tid, 2, 'Re: ' . $title, $user, 'reply', 'YES', '', time(), time(), 0, $ip, 'web', 0);
    mysqli_query($con, "UPDATE threads SET reply=77, replyer='nobody', timestamp=1 WHERE bid=$bid AND tid=$tid");

    $repair = $service->repairCounters(array(
        'username' => $user,
        'bid' => $bid,
        'tid' => $tid,
    ));

    fix_counters_domain_assert_true(isset($repair['updated']['userinfo_post']), 'missing userinfo_post stat');
    fix_counters_domain_assert_true(isset($repair['updated']['thread_reply']), 'missing thread_reply stat');

    $userRow = mysqli_fetch_assoc(mysqli_query($con, "SELECT post, reply, extr, sign, newmsg, star FROM userinfo WHERE username='{$esc($user)}' LIMIT 1"));
    fix_counters_domain_assert_true(intval($userRow['post']) === 1, 'post counter not repaired');
    fix_counters_domain_assert_true(intval($userRow['reply']) === 1, 'reply counter not repaired');
    fix_counters_domain_assert_true(intval($userRow['extr']) === 0, 'extr counter not repaired');
    fix_counters_domain_assert_true(intval($userRow['sign']) === 0, 'sign counter not repaired');
    fix_counters_domain_assert_true(intval($userRow['newmsg']) === 0, 'newmsg counter not repaired');
    fix_counters_domain_assert_true(intval($userRow['star']) === 1, 'star counter not repaired');

    $threadRow = mysqli_fetch_assoc(mysqli_query($con, "SELECT reply, replyer, timestamp FROM threads WHERE bid=$bid AND tid=$tid LIMIT 1"));
    $replyPost = mysqli_fetch_assoc(mysqli_query($con, "SELECT replytime FROM posts WHERE bid=$bid AND tid=$tid AND pid=2 LIMIT 1"));
    fix_counters_domain_assert_true(intval($threadRow['reply']) === 1, 'thread reply not repaired');
    fix_counters_domain_assert_true($threadRow['replyer'] === $user, 'thread replyer not repaired');
    fix_counters_domain_assert_true(intval($threadRow['timestamp']) === intval($replyPost['replytime']), 'thread timestamp not repaired');
} finally {
    mysqli_query($con, "DELETE FROM posts WHERE bid=$bid AND tid=$tid");
    mysqli_query($con, "DELETE FROM threads WHERE bid=$bid AND tid=$tid");
    mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($user)}'");
}

echo "fix-counters-domain-ok\n";
