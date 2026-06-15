<?php
/**
 * Safe email-domain test without real SMTP.
 *
 * Usage:
 *   php tests/email_domain_test.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../api/jiekoufunc.php';

$con = dbconnect_mysqli();
if (!$con) {
    fwrite(STDERR, "db-connect-failed\n");
    exit(1);
}

$ts = time();
$user = 'emailsvc_' . $ts;
$admin = 'emailsvc_admin_' . $ts;
$userToken = md5($user . $ts);
$adminToken = md5($admin . $ts);
$email1 = sprintf('%010d', $ts % 10000000000) . '@pku.edu.cn';
$email2 = sprintf('%010d', ($ts + 1) % 10000000000) . '@stu.pku.edu.cn';
$email3 = sprintf('%010d', ($ts + 2) % 10000000000) . '@bjmu.edu.cn';
$ip = '127.0.0.1';
$date = date('Y-m-d');

function email_domain_fail($msg) {
    fwrite(STDERR, $msg . "\n");
    exit(1);
}

function email_domain_assert_true($cond, $msg) {
    if (!$cond) {
        email_domain_fail($msg);
    }
}

function email_domain_assert_code($result, $code, $msg) {
    $actual = isset($result[0]['code']) ? strval($result[0]['code']) : 'missing';
    if ($actual !== strval($code)) {
        email_domain_fail($msg . ': expected code ' . $code . ', got ' . $actual . ' => ' . json_encode($result));
    }
}

$esc = function($value) use ($con) {
    return mysqli_real_escape_string($con, $value);
};

mysqli_query($con, "DELETE FROM email_verification WHERE username LIKE 'emailsvc_%' OR username LIKE 'emailsvc_admin_%'");
mysqli_query($con, "DELETE FROM email_mutes WHERE email='$email1' OR email='$email2' OR email='$email3'");
mysqli_query($con, "DELETE FROM userinfo WHERE username='$user' OR username='$admin'");

$pwd = md5('test123');
mysqli_query($con, "INSERT INTO userinfo (username, password, token, tokentime, sex, icon, mail, verified, email_visible, place, regdate, lastdate, lastip, post, reply, extr, sign, water, star, onlinetype, rights)
    VALUES ('{$esc($user)}', '{$esc($pwd)}', '{$esc($userToken)}', " . (time() + 86400) . ", '男', '/bbsimg/icons/default.jpg', '{$esc($email1)}', 0, 0, '北京', '$date', '$date', '$ip', 0, 0, 0, 0, 0, 1, 'web', 0)");
if (mysqli_errno($con)) {
    email_domain_fail('insert user failed: ' . mysqli_error($con));
}

mysqli_query($con, "INSERT INTO userinfo (username, password, token, tokentime, sex, icon, mail, verified, email_visible, place, regdate, lastdate, lastip, post, reply, extr, sign, water, star, onlinetype, rights)
    VALUES ('{$esc($admin)}', '{$esc($pwd)}', '{$esc($adminToken)}', " . (time() + 86400) . ", '男', '/bbsimg/icons/default.jpg', '{$esc($email3)}', 1, 0, '北京', '$date', '$date', '$ip', 0, 0, 0, 0, 0, 1, 'web', 2)");
if (mysqli_errno($con)) {
    email_domain_fail('insert admin failed: ' . mysqli_error($con));
}

$sentCodes = array();
$resetNotices = array();
$service = new CapubbsEmailVerificationService(
    new CapubbsEmailVerificationRepository($con),
    new CapubbsEmailMuteRepository($con),
    capubbs_user_repository($con),
    capubbs_permission_service($con),
    function() {
        return '654321';
    },
    function($email, $code) use (&$sentCodes) {
        $sentCodes[] = array('email' => $email, 'code' => $code);
        return array('success' => true, 'message' => 'stub');
    },
    function($email, $username, $newPassword) use (&$resetNotices) {
        $resetNotices[] = array('email' => $email, 'username' => $username, 'password' => $newPassword);
        return array('success' => true, 'message' => 'stub');
    }
);

email_domain_assert_true(CapubbsEmailVerificationService::isPkuEmailAddress($email1) === true, 'valid PKU email rejected');
email_domain_assert_true(CapubbsEmailVerificationService::isPkuEmailAddress('bad@gmail.com') === false, 'invalid email accepted');

$result = $service->legacySendRegisterCode(array('email' => $email1));
email_domain_assert_code($result, 0, 'send register code');
$row = mysqli_fetch_array(mysqli_query($con, "SELECT code FROM email_verification WHERE email='{$esc($email1)}' AND type='register' ORDER BY id DESC LIMIT 1"), MYSQLI_ASSOC);
email_domain_assert_true($row && $row['code'] === '654321', 'register code not inserted');
email_domain_assert_true(count($sentCodes) === 1, 'register send callback missing');

mysqli_query($con, "INSERT INTO email_verification (username, email, code, type, created_at, expires_at, used)
    VALUES ('{$esc($user)}', '{$esc($email1)}', '111111', 'verify_existing', " . (time() - 30) . ", " . (time() + 600) . ", 0)");
email_domain_assert_true($service->canSendCode($user, $email1, 'verify_existing') === false, 'canSendCode should be limited');
$service->invalidateCodes($user, $email1, 'verify_existing');
$row = mysqli_fetch_array(mysqli_query($con, "SELECT used FROM email_verification WHERE username='{$esc($user)}' AND email='{$esc($email1)}' AND type='verify_existing' ORDER BY id DESC LIMIT 1"), MYSQLI_ASSOC);
email_domain_assert_true($row && intval($row['used']) === 1, 'invalidateCodes did not mark used');

$result = $service->legacySendVerifyCode($userToken, array('type' => 'change_email', 'new_email' => $email2));
email_domain_assert_code($result, 0, 'send verify code');
$row = mysqli_fetch_array(mysqli_query($con, "SELECT code FROM email_verification WHERE username='{$esc($user)}' AND email='{$esc($email2)}' AND type='change_email' ORDER BY id DESC LIMIT 1"), MYSQLI_ASSOC);
email_domain_assert_true($row && $row['code'] === '654321', 'change-email code not inserted');

mysqli_query($con, "INSERT INTO email_verification (username, email, code, type, created_at, expires_at, used)
    VALUES ('{$esc($user)}', '{$esc($email2)}', '222222', 'change_email', " . time() . ", " . (time() + 600) . ", 0)");
$result = jiekoufunc_verifyEmail($con, $userToken, array('code' => '222222', 'type' => 'change_email'));
email_domain_assert_code($result, 0, 'verify email');
$row = mysqli_fetch_array(mysqli_query($con, "SELECT mail, verified FROM userinfo WHERE username='{$esc($user)}' LIMIT 1"), MYSQLI_ASSOC);
email_domain_assert_true($row && $row['mail'] === $email2 && intval($row['verified']) === 1, 'verify email did not update user');

$result = jiekoufunc_toggleEmailVisible($con, $userToken, array('email_visible' => 1));
email_domain_assert_code($result, 0, 'toggle email visible');
$row = mysqli_fetch_array(mysqli_query($con, "SELECT email_visible FROM userinfo WHERE username='{$esc($user)}' LIMIT 1"), MYSQLI_ASSOC);
email_domain_assert_true($row && intval($row['email_visible']) === 1, 'email_visible not updated');

$result = $service->legacySendResetPasswordCode(array('email' => $email2));
email_domain_assert_code($result, 0, 'send reset password code');
$row = mysqli_fetch_array(mysqli_query($con, "SELECT code FROM email_verification WHERE username='{$esc($user)}' AND email='{$esc($email2)}' AND type='reset_password' ORDER BY id DESC LIMIT 1"), MYSQLI_ASSOC);
email_domain_assert_true($row && $row['code'] === '654321', 'reset code not inserted');

$oldUser = mysqli_fetch_array(mysqli_query($con, "SELECT password FROM userinfo WHERE username='{$esc($user)}' LIMIT 1"), MYSQLI_ASSOC);
mysqli_query($con, "INSERT INTO email_verification (username, email, code, type, created_at, expires_at, used)
    VALUES ('{$esc($user)}', '{$esc($email2)}', '333333', 'reset_password', " . time() . ", " . (time() + 600) . ", 0)");
$result = $service->legacyResetPasswordByEmail(array('email' => $email2, 'code' => '333333'));
email_domain_assert_code($result, 0, 'reset password by email');
$newUser = mysqli_fetch_array(mysqli_query($con, "SELECT password, tokentime FROM userinfo WHERE username='{$esc($user)}' LIMIT 1"), MYSQLI_ASSOC);
email_domain_assert_true($newUser && $newUser['password'] !== $oldUser['password'], 'password not reset');
email_domain_assert_true(intval($newUser['tokentime']) === 0, 'tokentime not cleared');
email_domain_assert_true(count($resetNotices) === 1 && $resetNotices[0]['email'] === $email2 && strlen($resetNotices[0]['password']) === 8, 'reset notice callback missing');

mysqli_query($con, "UPDATE userinfo SET tokentime=" . (time() + 86400) . " WHERE username='{$esc($user)}'");
email_domain_assert_true(jiekoufunc_is_muted($con, $user, 2) === false, 'verified user should not be muted');
mysqli_query($con, "UPDATE userinfo SET verified=0, post=0, reply=0 WHERE username='{$esc($user)}'");
email_domain_assert_true(jiekoufunc_is_muted($con, $user, 2) === '邮箱未验证', 'unverified user should be blocked');
mysqli_query($con, "UPDATE userinfo SET verified=1 WHERE username='{$esc($user)}'");

$result = jiekoufunc_muteEmail($con, $adminToken, array('email' => $email2, 'reason' => 'test-reason'));
email_domain_assert_code($result, 0, 'mute email');
email_domain_assert_true(jiekoufunc_is_muted($con, $user, 2) === '邮箱已被管理员禁言', 'muted email should be blocked');
$list = jiekoufunc_listEmailMutes($con, $adminToken);
$found = false;
foreach ($list as $item) {
    if (isset($item['email']) && $item['email'] === $email2) {
        $found = true;
        break;
    }
}
email_domain_assert_true($found, 'listEmailMutes missing muted row');

$result = jiekoufunc_unmuteEmail($con, $adminToken, array('email' => $email2));
email_domain_assert_code($result, 0, 'unmute email');
email_domain_assert_true(jiekoufunc_is_muted($con, $user, 2) === false, 'unmuted email should not be blocked');

$result = jiekoufunc_verifiedCount($con);
email_domain_assert_true(isset($result[0]['count']) && intval($result[0]['count']) >= 1, 'verifiedCount invalid');

mysqli_query($con, "DELETE FROM email_verification WHERE username='{$esc($user)}' OR username='{$esc($admin)}'");
mysqli_query($con, "DELETE FROM email_mutes WHERE email='{$esc($email1)}' OR email='{$esc($email2)}' OR email='{$esc($email3)}'");
mysqli_query($con, "DELETE FROM userinfo WHERE username='{$esc($user)}' OR username='{$esc($admin)}'");

echo "email-domain-ok\n";
