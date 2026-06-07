<?php
include("../lib/mainfunc.php");
include_once "../../config.php";

if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
    echo '<html><head><meta charset="utf-8"><link rel="stylesheet" href="../lib/general.css"></head><body>';
    echo '<p style="text-align:center;color:#999;margin-top:100px;">管理员已关闭邮箱验证功能。</p>';
    echo '</body></html>';
    exit;
}

$userinfo = mainfunc(array("ask" => "currentUserInfo"));
if (count($userinfo) == 0) {
    echo '<html><head><meta charset="utf-8"><link rel="stylesheet" href="../lib/general.css"></head><body>';
    echo '<p style="text-align:center;color:#999;margin-top:100px;">请先登录。</p>';
    echo '</body></html>';
    exit;
}
$userinfo = $userinfo[0];
$mail = isset($userinfo['mail']) ? $userinfo['mail'] : '';
$verified = isset($userinfo['verified']) ? intval($userinfo['verified']) : 0;
$is_pku_email = preg_match('/^\d{10}@(.+\.)*pku\.edu\.cn$/i', $mail)
    || preg_match('/^\d{10}@bjmu\.edu\.cn$/i', $mail);
?>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../lib/general.css">
<script src="../lib/jquery.min.js"></script>
<script src="/assets/js/api.js"></script>
<style>
    .verify-container { max-width: 500px; margin: 40px auto; font-family: "Microsoft YaHei", sans-serif; }
    .verify-box { background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .verify-box h3 { margin: 0 0 20px; color: #444; text-align: center; }
    .verify-status { text-align: center; padding: 20px; }
    .verified-badge { display: inline-block; background: #4CAF50; color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 15px; }
    .unverified-badge { display: inline-block; background: #FF9800; color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 15px; }
    .no-email-badge { display: inline-block; background: #f44336; color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 15px; }
    .invalid-badge { display: inline-block; background: #f44336; color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 15px; }
    .form-group { margin: 15px 0; }
    .form-group label { display: block; margin-bottom: 5px; color: #666; font-size: 13px; }
    .form-group input[type="text"] { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
    .btn { display: inline-block; padding: 8px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    .btn-primary { background: #337ab7; color: #fff; }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
    .msg { margin-top: 10px; font-size: 13px; }
    .msg-success { color: #4CAF50; }
    .msg-error { color: #f44336; }
    .email-display { font-size: 16px; color: #333; word-break: break-all; }
    .countdown { color: #999; font-size: 12px; margin-left: 10px; }
</style>
</head>
<body>
<div class="verify-container">
<div class="verify-box">
<h3>邮箱验证</h3>

<?php if (empty($mail)): ?>
    <div class="verify-status">
        <span class="no-email-badge">未设置邮箱</span>
        <p style="color:#666;margin-top:15px;">请先前往 <a href="../edituser/" target="_blank">编辑资料</a> 页面设置邮箱。</p>
    </div>
<?php elseif ($verified): ?>
    <div class="verify-status">
        <span class="verified-badge">已验证</span>
        <p class="email-display" style="margin-top:15px;"><?php echo htmlspecialchars($mail); ?></p>
    </div>
<?php elseif (!$is_pku_email): ?>
    <div class="verify-status">
        <span class="invalid-badge">邮箱格式不正确</span>
        <p class="email-display" style="margin-top:15px;"><?php echo htmlspecialchars($mail); ?></p>
        <p style="color:#f44336;margin-top:15px;">当前邮箱不是有效的北大邮箱（需为 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn 格式）。</p>
        <p style="color:#666;margin-top:10px;">请前往 <a href="../edituser/" target="_blank">编辑资料</a> 页面更换邮箱。</p>
    </div>
<?php else: ?>
    <div class="verify-status">
        <span class="unverified-badge" id="statusBadge">未验证</span>
        <p class="email-display" style="margin-top:15px;" id="emailDisplay">
            <?php
            // 脱敏显示邮箱
            $parts = explode('@', $mail);
            if (count($parts) == 2) {
                $name = $parts[0];
                $domain = $parts[1];
                $masked = substr($name, 0, 1) . str_repeat('*', max(strlen($name) - 1, 0));
                echo htmlspecialchars($masked . '@' . $domain);
            } else {
                echo htmlspecialchars($mail);
            }
            ?>
        </p>
    </div>

    <div class="form-group">
        <label>验证码</label>
        <input type="text" id="verifyCode" placeholder="请输入邮箱中的6位验证码" maxlength="6" style="width:150px;">
        <button class="btn btn-primary" id="sendBtn" onclick="sendCode()">发送验证码</button>
        <span class="countdown" id="countdown"></span>
    </div>
    <button class="btn btn-primary" onclick="verify()">验证</button>
    <div class="msg" id="msg"></div>
<?php endif; ?>
</div>
</div>

<script>
var countdownTimer = null;
var countdownNum = 0;

function sendCode() {
    var btn = $('#sendBtn');
    if (btn.prop('disabled')) return;
    btn.prop('disabled', true);
    $('#msg').removeClass('msg-error msg-success').text('发送中...');

    API.call('sendVerifyCode', { type: 'verify_existing' })
        .done(function(resp) {
            if (resp.code === 0) {
                $('#msg').addClass('msg-success').text('验证码已发送，请检查邮箱。');
                startCountdown(60);
            } else {
                $('#msg').addClass('msg-error').text(resp.message || resp.msg || '发送失败');
                btn.prop('disabled', false);
            }
        })
        .fail(function(err) {
            $('#msg').addClass('msg-error').text(err.message || '网络错误，请重试。');
            btn.prop('disabled', false);
        });
}

function verify() {
    var code = $('#verifyCode').val().trim();
    if (!code) { $('#msg').addClass('msg-error').text('请输入验证码。'); return; }
    if (code.length !== 6) { $('#msg').addClass('msg-error').text('验证码为6位数字。'); return; }

    $('#msg').removeClass('msg-error msg-success').text('验证中...');

    API.call('verifyEmail', { code: code, type: 'verify_existing' })
        .done(function(resp) {
            if (resp.code === 0) {
                $('#msg').addClass('msg-success').text('验证成功！');
                $('#statusBadge').removeClass('unverified-badge').addClass('verified-badge').text('已验证');
                $('#sendBtn').hide();
                $('#verifyCode').hide();
                $('#countdown').hide();
                $('#emailDisplay').text('<?php echo htmlspecialchars($mail); ?>');
            } else {
                $('#msg').addClass('msg-error').text(resp.message || resp.msg || '验证失败');
            }
        })
        .fail(function(err) {
            $('#msg').addClass('msg-error').text(err.message || '网络错误，请重试。');
        });
}

function startCountdown(sec) {
    countdownNum = sec;
    updateCountdown();
    countdownTimer = setInterval(function() {
        countdownNum--;
        if (countdownNum <= 0) {
            clearInterval(countdownTimer);
            $('#countdown').text('');
            $('#sendBtn').prop('disabled', false);
        } else {
            updateCountdown();
        }
    }, 1000);
}

function updateCountdown() {
    $('#countdown').text('(' + countdownNum + 's后重新发送)');
}

$(function() {
    window.parent.ifrmLoaded();
});
</script>
</body>
</html>
