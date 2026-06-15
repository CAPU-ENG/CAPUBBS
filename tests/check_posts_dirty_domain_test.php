<?php
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function check_posts_dirty_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function check_posts_dirty_assert_true($cond, $msg) {
    if (!$cond) {
        check_posts_dirty_fail($msg);
    }
}

$service = capubbs_maintenance_service($con);
$threadRepo = capubbs_thread_repository($con);
$postRepo = capubbs_post_repository($con);

$ts = time();
$user = 'check_posts_dirty_' . $ts;
$token = md5($user . '_token');
$date = date('Y-m-d');
$ip = '127.0.0.1';
$bid = 28;
$tid = $threadRepo->findMaxTidIncludingTrash($bid) + 1;
$title = 'check-posts-dirty-' . $ts;
$dirtyText = "dirty" . chr(31) . "text";

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($user)}'");
mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights)
    VALUES ('{$esc($user)}','" . strtoupper(md5('test123456')) . "','{$esc($token)}'," . time() . ",'男','/bbsimg/icons/default.jpg','{$esc($user)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',1)");
if (mysqli_errno($con)) {
    check_posts_dirty_fail('insert user failed: ' . mysqli_error($con));
}

$fid = 0;

try {
    $threadRepo->insertThread($bid, $tid, $title, $user, time(), $date);
    $fid = $postRepo->insertPost($bid, $tid, 1, $title, $user, $dirtyText, 'YES', '', time(), time(), 1, $ip, 'web', 0);
    check_posts_dirty_assert_true($fid !== false && $fid > 0, 'insert dirty post failed');

    $report = $service->analyzeDirtyPosts(array('fid' => $fid));
    check_posts_dirty_assert_true(intval($report['rowCount']) === 1, 'rowCount mismatch');
    check_posts_dirty_assert_true(isset($report['matches'][$fid]), 'dirty fid missing');
    check_posts_dirty_assert_true(in_array(0x1F, $report['matches'][$fid]['chars'], true), 'dirty codepoint missing');
    check_posts_dirty_assert_true(intval($report['matches'][$fid]['row']['fid']) === intval($fid), 'dirty row fid mismatch');
} finally {
    if ($tid > 0) {
        mysqli_query($con, "DELETE FROM posts WHERE bid=$bid AND tid=$tid");
        mysqli_query($con, "DELETE FROM threads WHERE bid=$bid AND tid=$tid");
    }
    mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($user)}'");
}

echo "check-posts-dirty-domain-ok\n";
