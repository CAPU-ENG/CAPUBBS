<?php
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';
require_once __DIR__ . '/../api/lib/db.php';
require_once __DIR__ . '/../api/lib/ThreadDetailQuery.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function thread_detail_attachment_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function thread_detail_attachment_assert_true($cond, $msg) {
    if (!$cond) {
        thread_detail_attachment_fail($msg);
    }
}

$repo = capubbs_attachment_repository($con);
$ts = time();
$uploader = 'thread_detail_attach_' . $ts;
$date = date('Y-m-d');
$ip = '127.0.0.1';
$token = md5($uploader . '_token');

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($uploader)}'");
mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights)
    VALUES ('{$esc($uploader)}','" . strtoupper(md5('test123456')) . "','{$esc($token)}'," . time() . ",'男','/bbsimg/icons/default.jpg','{$esc($uploader)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',1)");

if (mysqli_errno($con)) {
    thread_detail_attachment_fail('insert user failed: ' . mysqli_error($con));
}

$attachIds = array();

try {
    $id1 = $repo->create('attach-a.txt', 'test/a-' . $ts . '.txt', 123, $uploader, 0, 0, time());
    $id2 = $repo->create('attach-b.txt', 'test/b-' . $ts . '.txt', 456, $uploader, 2, 1, time());
    thread_detail_attachment_assert_true($id1 !== false && $id2 !== false, 'create attachments failed');
    $attachIds = array($id1, $id2);

    $rows = $repo->findByIds(array($id1, $id2, 0, -1, $id1));
    thread_detail_attachment_assert_true(count($rows) === 2, 'findByIds count mismatch');

    $mapped = thread_detail_query_get_attachments_by_id($con, array($id1, $id2));
    thread_detail_attachment_assert_true(isset($mapped[$id1]), 'mapped id1 missing');
    thread_detail_attachment_assert_true(isset($mapped[$id2]), 'mapped id2 missing');
    thread_detail_attachment_assert_true($mapped[$id1]['name'] === 'attach-a.txt', 'mapped id1 name mismatch');
    thread_detail_attachment_assert_true(intval($mapped[$id2]['price']) === 2, 'mapped id2 price mismatch');

    $empty = thread_detail_query_get_attachments_by_id($con, array());
    thread_detail_attachment_assert_true(is_array($empty) && count($empty) === 0, 'empty attachment list mismatch');
} finally {
    if (count($attachIds) > 0) {
        mysqli_query($con, "DELETE FROM attachments WHERE id IN (" . implode(',', array_map('intval', $attachIds)) . ")");
    }
    mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($uploader)}'");
}

echo "thread-detail-attachment-domain-ok\n";
