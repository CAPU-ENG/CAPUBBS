<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../api/jiekoufunc.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

function user_domain_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function user_domain_assert_true($cond, $msg) {
    if (!$cond) {
        user_domain_fail($msg);
    }
}

function user_domain_assert_code($result, $code, $msg) {
    $actual = isset($result[0]['code']) ? strval($result[0]['code']) : 'missing';
    if ($actual !== strval($code)) {
        user_domain_fail($msg . ': expected code ' . $code . ', got ' . $actual . ' => ' . json_encode($result));
    }
}

$ts = time();
$username = 'usersvc_' . $ts;
$admin = 'usersvc_admin_' . $ts;
$adminToken = md5($admin . '_seed');
$email = sprintf('%010d', $ts % 10000000000) . '@pku.edu.cn';
$date = date('Y-m-d');
$ip = '127.0.0.1';

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM email_verification WHERE email='{$esc($email)}' OR username='{$esc($username)}'");
mysqli_query($con, "DELETE FROM user_sig WHERE username='{$esc($username)}' OR username='{$esc($admin)}'");
mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($username)}' OR username='{$esc($admin)}'");

$adminPwd = strtoupper(md5('root-pass'));
$adminEmail = sprintf('%010d', ($ts + 1) % 10000000000) . '@bjmu.edu.cn';
mysqli_query($con, "INSERT INTO userinfo (username,password,token,tokentime,sex,icon,mail,verified,email_visible,place,regdate,lastdate,lastip,post,reply,extr,sign,water,star,onlinetype,rights)
    VALUES ('{$esc($admin)}','{$esc($adminPwd)}','{$esc($adminToken)}'," . (time() + 86400) . ",'男','/bbsimg/icons/default.jpg','{$esc($adminEmail)}',1,0,'北京','$date','$date','$ip',0,0,0,0,0,9,'web',10)");
if (mysqli_errno($con)) {
    user_domain_fail('insert admin failed: ' . mysqli_error($con));
}

$registerCode = '445566';
$expires = time() + 600;
mysqli_query($con, "INSERT INTO email_verification (username,email,code,type,created_at,expires_at,used)
    VALUES ('','{$esc($email)}','{$registerCode}','register'," . time() . ",$expires,0)");
if (mysqli_errno($con)) {
    user_domain_fail('insert email verification failed: ' . mysqli_error($con));
}

$result = jiekoufunc_userexists($con, array('user' => $username));
user_domain_assert_code($result, 0, 'userexists before register');
$result = jiekoufunc_userexists($con, array('user' => "bad'user"));
user_domain_assert_code($result, 2, 'userexists invalid char');

$params = array(
    'username' => $username,
    'password' => md5('test123456'),
    'sex' => '男',
    'icon' => '/bbsimg/icons/default.jpg',
    'qq' => '123456',
    'mail' => $email,
    'intro' => 'intro text',
    'place' => '北京',
    'hobby' => '骑行',
    'sig1' => 'sig1 raw',
    'sig2' => 'sig2 raw',
    'sig3' => 'sig3 raw',
    'sig1_type' => 'raw',
    'sig2_type' => 'html',
    'sig3_type' => 'null',
    'onlinetype' => 'web',
    'browser' => 'PHPUnit',
    'verify_code' => $registerCode,
);
$result = jiekoufunc_register($con, $ip, $params);
user_domain_assert_code($result, 0, 'register');
user_domain_assert_true(isset($result[0]['token']) && $result[0]['token'] !== '', 'register token missing');
$userToken = $result[0]['token'];

$row = mysqli_fetch_array(mysqli_query($con, "SELECT username, mail, verified, email_visible FROM userinfo WHERE username='{$esc($username)}' LIMIT 1"), MYSQLI_ASSOC);
user_domain_assert_true($row && $row['mail'] === $email, 'register mail mismatch');
user_domain_assert_true(intval($row['verified']) === 1, 'register verified mismatch');
user_domain_assert_true(intval($row['email_visible']) === 0, 'register email_visible mismatch');

$codeRow = mysqli_fetch_array(mysqli_query($con, "SELECT used FROM email_verification WHERE email='{$esc($email)}' AND code='{$registerCode}' ORDER BY id DESC LIMIT 1"), MYSQLI_ASSOC);
user_domain_assert_true($codeRow && intval($codeRow['used']) === 1, 'register code not marked used');

$sigRows = array();
$res = mysqli_query($con, "SELECT sig_num, sig, sig_type FROM user_sig WHERE username='{$esc($username)}' ORDER BY sig_num");
while ($res && ($row = mysqli_fetch_assoc($res))) {
    $sigRows[] = $row;
}
user_domain_assert_true(count($sigRows) === 3, 'user sig rows missing');
user_domain_assert_true($sigRows[1]['sig_type'] === 'html', 'sig2 type mismatch');

$result = jiekoufunc_userexists($con, array('user' => $username));
user_domain_assert_code($result, 1, 'userexists after register');

$result = jiekoufunc_getuser($con, $userToken);
user_domain_assert_true(isset($result[0]['username']) && $result[0]['username'] === $username, 'getuser username mismatch');

$current = jiekoufunc_currentUserInfo($con, $userToken);
user_domain_assert_true(count($current) >= 1 && $current[0]['username'] === $username, 'currentUserInfo missing user');

$editResult = jiekoufunc_edituser($con, $userToken, $ip, array(
    'sex' => '女',
    'icon' => '/bbsimg/icons/edited.jpg',
    'mail' => sprintf('%010d', ($ts + 2) % 10000000000) . '@pku.edu.cn',
    'email_visible' => 1,
    'qq' => '654321',
    'intro' => 'edited intro',
    'place' => '上海',
    'hobby' => '夜骑',
    'sig1' => 'sig1 edited',
    'sig2' => 'sig2 edited',
    'sig3' => 'sig3 edited',
    'sig1_type' => 'html',
    'sig2_type' => 'raw',
    'sig3_type' => 'html',
));
user_domain_assert_code($editResult, 0, 'edituser');

$row = mysqli_fetch_array(mysqli_query($con, "SELECT sex, icon, mail, email_visible, qq, intro, place, hobby FROM userinfo WHERE username='{$esc($username)}' LIMIT 1"), MYSQLI_ASSOC);
user_domain_assert_true($row && $row['mail'] === $email, 'edituser should keep original mail');
user_domain_assert_true(intval($row['email_visible']) === 1, 'edituser email_visible mismatch');
user_domain_assert_true($row['sex'] === '女', 'edituser sex mismatch');
user_domain_assert_true($row['place'] === '上海', 'edituser place mismatch');

$sigRows = array();
$res = mysqli_query($con, "SELECT sig_num, sig, sig_type FROM user_sig WHERE username='{$esc($username)}' ORDER BY sig_num");
while ($res && ($row = mysqli_fetch_assoc($res))) {
    $sigRows[] = $row;
}
user_domain_assert_true($sigRows[0]['sig'] === 'sig1 edited' && $sigRows[0]['sig_type'] === 'html', 'edituser sig1 mismatch');
user_domain_assert_true($sigRows[2]['sig_type'] === 'html', 'edituser sig3 type mismatch');

$profile = jiekoufunc_user_profile($con, array('username' => $username, 'token' => ''));
user_domain_assert_true(isset($profile[1]['mail']) && $profile[1]['mail'] === '', 'user profile should hide mail for anonymous viewer');
$profileSelf = jiekoufunc_user_profile($con, array('username' => $username, 'token' => $userToken));
user_domain_assert_true(isset($profileSelf[1]['mail']) && $profileSelf[1]['mail'] === $email, 'user profile should show mail to self');

$oldPasswordRow = mysqli_fetch_array(mysqli_query($con, "SELECT password FROM userinfo WHERE username='{$esc($username)}' LIMIT 1"), MYSQLI_ASSOC);
$changeResult = jiekoufunc_changepsd($con, $userToken, array(
    'old' => md5('test123456'),
    'new' => md5('newpass123'),
));
user_domain_assert_code($changeResult, 0, 'changepsd');
$newToken = isset($changeResult[0]['msg']) ? $changeResult[0]['msg'] : '';
user_domain_assert_true($newToken !== '' && $newToken !== $userToken, 'changepsd token missing');
$newPasswordRow = mysqli_fetch_array(mysqli_query($con, "SELECT password, token FROM userinfo WHERE username='{$esc($username)}' LIMIT 1"), MYSQLI_ASSOC);
user_domain_assert_true($newPasswordRow && $newPasswordRow['password'] !== $oldPasswordRow['password'], 'changepsd password unchanged');
user_domain_assert_true($newPasswordRow['token'] === $newToken, 'changepsd token not updated');
$userToken = $newToken;

$badChange = jiekoufunc_changepsd($con, $userToken, array(
    'old' => md5('wrong-old'),
    'new' => md5('anotherpass'),
));
user_domain_assert_code($badChange, 2, 'changepsd wrong old');

$normalReset = jiekoufunc_admin_reset_password($con, $userToken, array('target_username' => $admin));
user_domain_assert_code($normalReset, 2, 'admin reset should reject normal user');

$adminReset = jiekoufunc_admin_reset_password($con, $adminToken, array('target_username' => $username));
user_domain_assert_code($adminReset, 0, 'admin reset password');
$resetRow = mysqli_fetch_array(mysqli_query($con, "SELECT password, tokentime FROM userinfo WHERE username='{$esc($username)}' LIMIT 1"), MYSQLI_ASSOC);
user_domain_assert_true($resetRow && strtoupper($resetRow['password']) === strtoupper(md5('123456')), 'admin reset password hash mismatch');
user_domain_assert_true(intval($resetRow['tokentime']) > 0, 'admin reset tokentime invalid');

mysqli_query($con, "DELETE FROM email_verification WHERE email='{$esc($email)}' OR username='{$esc($username)}'");
mysqli_query($con, "DELETE FROM user_sig WHERE username='{$esc($username)}' OR username='{$esc($admin)}'");
mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($username)}' OR username='{$esc($admin)}'");

echo "user-domain-ok\n";
