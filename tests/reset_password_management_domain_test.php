<?php
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../src/Bootstrap.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function reset_password_management_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function reset_password_management_assert_true($cond, $msg) {
    if (!$cond) {
        reset_password_management_fail($msg);
    }
}

$service = capubbs_user_service($con);
$ts = time();
$admin = 'reset_admin_' . $ts;
$target = 'reset_target_' . $ts;
$adminToken = md5($admin . '_token');
$targetToken = md5($target . '_token');
$date = date('Y-m-d');
$ip = '127.0.0.1';

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($admin)}' OR username='{$esc($target)}'");
mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights)
    VALUES
    ('{$esc($admin)}','" . strtoupper(md5('test123456')) . "','{$esc($adminToken)}'," . time() . ",'男','/bbsimg/icons/default.jpg','{$esc($admin)}@pku.edu.cn',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',10),
    ('{$esc($target)}','" . strtoupper(md5('test123456')) . "','{$esc($targetToken)}'," . time() . ",'女','/bbsimg/icons/default.jpg','{$esc($target)}@pku.edu.cn',1,0,'上海','$date','$date','$ip',12,34,0,0,0,7,'web',1)");

if (mysqli_errno($con)) {
    reset_password_management_fail('insert users failed: ' . mysqli_error($con));
}

try {
    $row = $service->findAdminResetPasswordSearchUser($target);
    reset_password_management_assert_true(is_array($row), 'search row missing');
    reset_password_management_assert_true($row['username'] === $target, 'username mismatch');
    reset_password_management_assert_true(intval($row['rights']) === 1, 'rights mismatch');
    reset_password_management_assert_true(intval($row['star']) === 7, 'star mismatch');
    reset_password_management_assert_true($row['mail'] === $target . '@pku.edu.cn', 'mail mismatch');
    reset_password_management_assert_true($row['regdate'] === $date, 'regdate mismatch');
    reset_password_management_assert_true($row['lastdate'] === $date, 'lastdate mismatch');

    $missing = $service->findAdminResetPasswordSearchUser($target . '_missing');
    reset_password_management_assert_true($missing === null, 'missing user should be null');

    $blank = $service->findAdminResetPasswordSearchUser('   ');
    reset_password_management_assert_true($blank === null, 'blank username should be null');
} finally {
    mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($admin)}' OR username='{$esc($target)}'");
}

echo "reset-password-management-domain-ok\n";
