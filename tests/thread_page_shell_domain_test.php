<?php
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function thread_page_shell_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function thread_page_shell_assert_true($cond, $msg) {
    if (!$cond) {
        thread_page_shell_fail($msg);
    }
}

$boardRepo = capubbs_board_repository($con);
$favoriteRepo = capubbs_favorite_repository($con);

thread_page_shell_assert_true($boardRepo->findByBid(28) !== null, 'known board 28 should exist');
thread_page_shell_assert_true($boardRepo->findByBid(999999) === null, 'invalid board should be null');

$ts = time();
$username = 'thread_page_shell_' . $ts;
$token = md5($username . '_token');
$date = date('Y-m-d');
$ip = '127.0.0.1';
$bid = 28;
$tid = 7654321 + ($ts % 1000);

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM favorites WHERE username='{$esc($username)}' AND bid=$bid AND tid=$tid");
mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($username)}'");
mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights)
    VALUES ('{$esc($username)}','" . strtoupper(md5('test123456')) . "','{$esc($token)}'," . time() . ",'男','/bbsimg/icons/default.jpg','{$esc($username)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',1)");
if (mysqli_errno($con)) {
    thread_page_shell_fail('insert user failed: ' . mysqli_error($con));
}

try {
    thread_page_shell_assert_true($favoriteRepo->exists($username, $bid, $tid) === false, 'favorite should not exist initially');
    $ok = $favoriteRepo->add($username, $bid, $tid, time(), time());
    thread_page_shell_assert_true($ok !== false, 'add favorite failed');
    thread_page_shell_assert_true($favoriteRepo->exists($username, $bid, $tid) === true, 'favorite should exist after add');
    $favoriteRepo->remove($username, $bid, $tid);
    thread_page_shell_assert_true($favoriteRepo->exists($username, $bid, $tid) === false, 'favorite should be removed');
} finally {
    mysqli_query($con, "DELETE FROM favorites WHERE username='{$esc($username)}' AND bid=$bid AND tid=$tid");
    mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($username)}'");
}

echo "thread-page-shell-domain-ok\n";
