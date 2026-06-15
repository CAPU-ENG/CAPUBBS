<?php
require_once __DIR__ . '/../bbs/lib/mainfunc.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function post_tag_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function post_tag_assert_true($cond, $msg) {
    if (!$cond) {
        post_tag_fail($msg);
    }
}

$bid = 28;
$ts = time();
$author = 'post_tag_user_' . $ts;
$date = date('Y-m-d');
$ip = '127.0.0.1';
$token = md5($author . '_token');
$title = 'post-tag-title-' . $ts;
$text = 'hello [b]world[/b]';
$text2 = 'reply line';

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($author)}'");
mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights)
    VALUES ('{$esc($author)}','" . strtoupper(md5('test123456')) . "','{$esc($token)}'," . time() . ",'男','/bbsimg/icons/default.jpg','{$esc($author)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',1)");

$tid = 0;
try {
    $tid = capubbs_thread_repository($con)->findMaxTidIncludingTrash($bid) + 1;
    $time = time();
    capubbs_thread_repository($con)->insertThread($bid, $tid, $title, $author, $time, $date);
    $fid = capubbs_post_repository($con)->insertPost($bid, $tid, 1, $title, $author, $text, 'YES', '', $time, $time, 1, $ip, 'web', 0);
    $fid2 = capubbs_post_repository($con)->insertPost($bid, $tid, 2, 'Re: ' . $title, $author, $text2, 'YES', '', $time + 1, $time + 1, 0, $ip, 'web', 0);

    $renderedByFid = translate_post_tag("before [post=$fid] after", $con);
    post_tag_assert_true(strpos($renderedByFid, 'hello') !== false, 'translate_post_tag fid missing text');
    post_tag_assert_true(strpos($renderedByFid, '<b>world</b>') !== false, 'translate_post_tag fid missing formatting');

    $renderedByBidTidPid = translate_post_tag("x [post bid=$bid tid=$tid pid=2] y", $con);
    post_tag_assert_true(strpos($renderedByBidTidPid, 'reply') !== false, 'translate_post_tag bid/tid/pid missing text');

    $rawNbsp = '[post&nbsp;bid=' . $bid . '&nbsp;tid=' . $tid . '&nbsp;pid=2]';
    $renderedNbsp = translate_post_tag($rawNbsp, $con);
    post_tag_assert_true(strpos($renderedNbsp, 'reply') !== false, 'translate_post_tag nbsp attrs missing text');

    $invalid = translate_post_tag('[post bid=28 tid=999999 pid=1]', $con);
    post_tag_assert_true($invalid === '[post bid=28 tid=999999 pid=1]', 'translate_post_tag invalid ref should remain unchanged');
} finally {
    if ($tid > 0) {
        mysqli_query($con, "DELETE FROM posts WHERE bid=$bid AND tid=$tid");
        mysqli_query($con, "DELETE FROM threads WHERE bid=$bid AND tid=$tid");
    }
    mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($author)}'");
}

echo "post-tag-domain-ok\n";
