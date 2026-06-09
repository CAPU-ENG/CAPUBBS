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
$no_email = empty($mail);
$email_visible_val = isset($userinfo['email_visible']) ? intval($userinfo['email_visible']) : 0;
$need_change = $no_email || !$is_pku_email;
?>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../lib/general.css">
<script src="../lib/jquery.min.js"></script>
<script src="/assets/js/api.js"></script>
<style>
body {
    background-color: #ABC9B6;
    background-position: center top;
    background-repeat: no-repeat;
    margin: 0;
}
div.main {
    width: 600px;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
}
div.tag {
    text-align: center;
    color: #777777;
    font-size: 22px;
    letter-spacing: 5px;
}
hr {
    width: 60%;
}
table.content {
    width: 500px;
    margin-left: auto;
    margin-right: auto;
}
td.left {
    text-align: right;
    width: 100px;
}
td.right {
    text-align: left;
    width: 250px;
}
input[type="text"] {
    width: 200px;
    height: 23px;
    border-radius: 10px;
    outline: none;
    padding-left: 10px;
    background-color: #faffd7;
}
input[readonly] {
    background: #eee;
}
input[type="button"] {
    width: auto;
    font-size: 12px;
}
table.content tr {
    height: 35px;
}
</style>
</head>
<body>
<div class="main">
<div class="tag">邮箱管理</div>
<hr>
<table class="content">

<tr>
    <td class="left"><span>当前邮箱：</span></td>
    <td class="right">
        <input type="text" value="<?php echo htmlspecialchars($mail); ?>" readonly>
        <?php if ($no_email): ?>
            <span style="color:#f44336;font-size:12px;margin-left:8px;">未设置</span>
        <?php elseif ($verified): ?>
            <span style="color:#4CAF50;font-size:12px;margin-left:8px;">已验证</span>
        <?php elseif (!$is_pku_email): ?>
            <span style="color:#f44336;font-size:12px;margin-left:8px;">格式不正确</span>
        <?php else: ?>
            <span style="color:#FF9800;font-size:12px;margin-left:8px;">未验证</span>
        <?php endif; ?>
    </td>
</tr>

<tr id="emailChangeRow" style="<?php echo $need_change ? '' : 'display:none;'; ?>">
    <td class="left"><span id="changeLabel"><?php echo $no_email ? '设置邮箱：' : '新邮箱：'; ?></span></td>
    <td class="right">
        <input type="text" id="newEmail" placeholder="输入PKU邮箱">
        <input type="button" value="发送验证码" id="changeSendBtn" onclick="sendChangeCode()">
        <span id="changeCountdown" style="font-size:12px;color:#999;margin-left:4px;"></span>
        <br><input type="text" id="changeCode" placeholder="6位验证码" maxlength="6" style="width:100px;margin-top:4px;">
        <input type="button" value="验证" id="changeVerifyBtn" onclick="verifyChangeEmail()" style="margin-top:4px;">
        <span id="changeMsg" style="font-size:12px;margin-left:8px;"></span>
    </td>
</tr>

<?php if (!$no_email): ?>
<tr id="changeLinkRow" style="<?php echo $need_change ? 'display:none;' : ''; ?>">
    <td></td>
    <td class="right">
        <a href="javascript:showEmailChange()" style="font-size:12px;">更换邮箱</a>
    </td>
</tr>
<?php endif; ?>

<?php if (!$no_email && !$verified && $is_pku_email): ?>
<tr>
    <td class="left"><span>验证邮箱：</span></td>
    <td class="right">
        <input type="text" id="verifyCode" placeholder="6位验证码" maxlength="6" style="width:100px;">
        <input type="button" value="发送验证码" id="sendBtn" onclick="sendCode()">
        <span id="countdown" style="font-size:12px;color:#999;margin-left:4px;"></span>
        <br><input type="button" value="验证" onclick="verify()" style="margin-top:4px;">
        <span id="msg" style="font-size:12px;margin-left:8px;"></span>
    </td>
</tr>
<?php endif; ?>

<?php if (!$no_email): ?>
<tr>
    <td class="left"><span>邮箱公开：</span></td>
    <td class="right">
        <label style="width:initial;">
            <input type="checkbox" id="emailVisible" value="1" <?php echo $email_visible_val ? 'checked' : ''; ?> onchange="toggleEmailVisible()" style="width:initial;">
            在个人主页公开显示邮箱
        </label>
        <span id="visibleMsg" style="font-size:12px;margin-left:8px;"></span>
    </td>
</tr>
<?php endif; ?>

</table>
</div>

<script>
var changeTimer = null;
var countdownTimer = null;
var countdownNum = 0;

function showEmailChange() {
    $('#emailChangeRow').toggle();
    $('#changeLinkRow').toggle();
    if ($('#emailChangeRow').is(':visible')) {
        $('#changeLabel').text('新邮箱：');
    }
}

function sendChangeCode() {
    var email = $('#newEmail').val().trim();
    if (!/^\d{10}@((.+\.)*pku\.edu\.cn|bjmu\.edu\.cn)$/i.test(email)) {
        $('#changeMsg').css('color','#f44336').text('请输入正确的邮箱地址（学号@*.pku.edu.cn 或 学号@bjmu.edu.cn）。');
        return;
    }
    if (email === '<?php echo htmlspecialchars($mail, ENT_QUOTES); ?>') {
        $('#changeMsg').css('color','#f44336').text('新邮箱与当前邮箱相同，无需更换。');
        return;
    }

    var btn = $('#changeSendBtn');
    btn.prop('disabled', true);
    $('#changeMsg').css('color','#666').text('发送中...');

    API.call('sendVerifyCode', { type: 'change_email', new_email: email }, { silent: true })
        .done(function(resp) {
            if (resp.code === 0) {
                $('#changeMsg').css('color','#4CAF50').text(resp.message || '验证码已发送。');
                var sec = 60;
                if (changeTimer) clearInterval(changeTimer);
                changeTimer = setInterval(function() {
                    sec--;
                    if (sec <= 0) {
                        clearInterval(changeTimer);
                        $('#changeCountdown').text('');
                        btn.prop('disabled', false);
                    } else {
                        $('#changeCountdown').text('(' + sec + 's)');
                    }
                }, 1000);
            } else {
                $('#changeMsg').css('color','#f44336').text(resp.message || resp.msg || '发送失败');
                btn.prop('disabled', false);
            }
        })
        .fail(function(err) {
            $('#changeMsg').css('color','#f44336').text(err.message || '网络错误，请重试。');
            btn.prop('disabled', false);
        });
}

function verifyChangeEmail() {
    var code = $('#changeCode').val().trim();
    if (!code || code.length !== 6) {
        $('#changeMsg').css('color','#f44336').text('请输入6位验证码。');
        return;
    }

    $('#changeMsg').css('color','#666').text('验证中...');

    API.call('verifyEmail', { code: code, type: 'change_email' }, { silent: true })
        .done(function(resp) {
            if (resp.code === 0) {
                $('#changeMsg').css('color','#4CAF50').text('邮箱设置成功！');
                setTimeout(function() { location.reload(); }, 800);
            } else {
                $('#changeMsg').css('color','#f44336').text(resp.message || resp.msg || '验证失败');
            }
        })
        .fail(function(err) {
            $('#changeMsg').css('color','#f44336').text(err.message || '网络错误，请重试。');
        });
}

<?php if (!$no_email && !$verified && $is_pku_email): ?>
function sendCode() {
    var btn = $('#sendBtn');
    if (btn.prop('disabled')) return;
    btn.prop('disabled', true);
    $('#msg').css('color','#666').text('发送中...');

    API.call('sendVerifyCode', { type: 'verify_existing' })
        .done(function(resp) {
            if (resp.code === 0) {
                $('#msg').css('color','#4CAF50').text('验证码已发送，请检查邮箱。');
                startCountdown(60);
            } else {
                $('#msg').css('color','#f44336').text(resp.message || resp.msg || '发送失败');
                btn.prop('disabled', false);
            }
        })
        .fail(function(err) {
            $('#msg').css('color','#f44336').text(err.message || '网络错误，请重试。');
            btn.prop('disabled', false);
        });
}

function verify() {
    var code = $('#verifyCode').val().trim();
    if (!code) { $('#msg').css('color','#f44336').text('请输入验证码。'); return; }
    if (code.length !== 6) { $('#msg').css('color','#f44336').text('验证码为6位数字。'); return; }

    $('#msg').css('color','#666').text('验证中...');

    API.call('verifyEmail', { code: code, type: 'verify_existing' })
        .done(function(resp) {
            if (resp.code === 0) {
                $('#msg').css('color','#4CAF50').text('验证成功！');
                setTimeout(function() { location.reload(); }, 800);
            } else {
                $('#msg').css('color','#f44336').text(resp.message || resp.msg || '验证失败');
            }
        })
        .fail(function(err) {
            $('#msg').css('color','#f44336').text(err.message || '网络错误，请重试。');
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
<?php endif; ?>

function toggleEmailVisible() {
    var visible = $('#emailVisible').is(':checked') ? 1 : 0;
    $('#visibleMsg').css('color','#666').text('...');
    API.call('toggleEmailVisible', { email_visible: visible }, { silent: true })
        .done(function(resp) {
            if (resp.code === 0) {
                $('#visibleMsg').css('color','#4CAF50').text('已更新');
                setTimeout(function() { $('#visibleMsg').text(''); }, 1500);
            } else {
                $('#visibleMsg').css('color','#f44336').text('更新失败');
                $('#emailVisible').prop('checked', !$('#emailVisible').is(':checked'));
            }
        })
        .fail(function() {
            $('#visibleMsg').css('color','#f44336').text('网络错误');
            $('#emailVisible').prop('checked', !$('#emailVisible').is(':checked'));
        });
}

$(function() {
    window.parent.ifrmLoaded();
});
</script>
</body>
</html>
