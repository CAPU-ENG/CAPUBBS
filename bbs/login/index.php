<?php
    require_once "../../bootstrap.php";
    include_once "../../config.php";
?>
<html>
<head>
<meta charset="utf-8">
<title>CAPUBBS - 登录</title>
<link rel="stylesheet" href="../lib/general.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<style type="text/css">
body{
    background-color: #ABC9B6;
    background-image: url("/assets/images/static/bg.jpg");
    background-position: center top;
    background-repeat: no-repeat;
    margin: 0;
}
div.main{
    margin-left: auto;
    margin-right: auto;
    width: 400px;
    margin-top: 240px;
}
h1{
    text-align: center;
    color: white;
}
form{
    margin-left: auto;
    margin-right: auto;
    width: 240px;
    line-height: 30px;
}
input.text{
/*  -webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 0, 0, 0.1) inset; */
    border-radius: 10px;
    outline: none;
    padding-left: 7px;
    background-color: #f2ffbc;
}
input.button{
    border-radius: 10px;
    background-color: #ffffff;
}
.tip{
    color: #be0000;
    text-align: center;
}
.reset-panel{
    box-sizing: border-box;
    display: none;
    width: 360px;
    margin: 22px auto 0;
    padding: 14px 18px;
    border: 1px solid rgba(255,255,255,0.75);
    border-radius: 10px;
    background: rgba(255,255,255,0.86);
    color: #333;
}
.reset-panel h2{
    margin: 0 0 12px;
    text-align: center;
    font-size: 18px;
}
.reset-row{
    margin-top: 9px;
    white-space: nowrap;
}
.reset-row label{
    display: inline-block;
    width: 82px;
}
.reset-row input.text{
    box-sizing: border-box;
    width: 190px;
}
.reset-actions{
    margin-top: 12px;
    text-align: center;
}
.reset-help,
.reset-msg{
    margin-top: 9px;
    font-size: 12px;
}
</style>
</head>
<body>
<div class="main">
<div>
<h1>登录CAPUBBS</h1>
<form>
用户名：<input name="username" type="text" class="text" id="username" value="<?php echo(@$_GET['username']) ?>"><br>
　密码：<input name="password" type="password" class="text" id="password"><br>
<input type="hidden" value="" name="password1" id="password1">
<input type="hidden" value="<?php echo(@$_GET['from']); ?>" name="from" id="from">
&nbsp;&nbsp;&nbsp;&nbsp;
<input type="button" value="登录" class="button" onclick="check();">
<input type="button" value="注册" class="button" onclick="register();">
&nbsp;<a href="javascript:forget()">忘记密码？</a>
</form>
<div id="tip" class="tip">
<?php echo(@$_GET['tip']); ?>
</div>
</div>
<?php if (CAPUBBS_ENABLE_EMAIL_VERIFY): ?>
<div id="resetPanel" class="reset-panel">
    <h2>重置密码</h2>
    <div class="reset-row">
        <label for="resetUsername">论坛 ID：</label>
        <input id="resetUsername" type="text" class="text" autocomplete="username">
    </div>
    <div class="reset-row">
        <label for="resetEmail">注册邮箱：</label>
        <input id="resetEmail" type="text" class="text" autocomplete="email">
    </div>
    <div class="reset-row">
        <label for="resetCode">验证码：</label>
        <input id="resetCode" type="text" class="text" autocomplete="one-time-code">
    </div>
    <div class="reset-actions">
        <input type="button" value="发送验证码" class="button" id="resetSendBtn" onclick="sendResetCode()">
        <input type="button" value="重置密码" class="button" onclick="resetPassword()">
        <span id="resetCountdown"></span>
    </div>
    <div id="resetMsg" class="reset-msg"></div>
    <div class="reset-help">无法通过邮箱重设？联系管理员：<a href="mailto:<?php echo ADMIN_EMAIL; ?>"><?php echo ADMIN_EMAIL; ?></a></div>
</div>
<?php endif; ?>
</div>
<script type="text/javascript" src="../lib/md5.js"></script>
<script src="../lib/jquery.min.js"></script>
<script>
$(window).load(function() {
    $('#username').keypress(function(e) {
        if (e.keyCode==13)
            $('#password').focus();
    });
    $('#password').keypress(function(e) {
        if (e.keyCode==13)
            check();
    });
});
function register(){
    window.location="../register";
}
function check(){
    var user=$('#username');
    var pass=$('#password');
    var tip=$('#tip');
    if(user.val().length==0){
        tip.html("请填写用户名！");
        user.focus();
        return;
    }
    if(pass.val().length==0){
        tip.html("请填写密码！");
        pass.focus();
        return;
    }
    var password=hex_md5(pass.val());
    $.post("action.php",{
        username:user.val(),
        password1:password
        },function(data) {
            var x=parseInt(data);
            if (x==0) {
                var from=$('#from').val();
                if (from=="") from="../index";
                else from=unescape(from);
                window.location=from;
                return;
            }
            else
                tip.html(data);
    });
}
function forget() {
    <?php if (CAPUBBS_ENABLE_EMAIL_VERIFY): ?>
    $('#resetPanel').toggle();
    <?php else: ?>
    $('#tip').html('请联系管理员，邮箱：<a href="mailto:<?php echo ADMIN_EMAIL; ?>"><?php echo ADMIN_EMAIL; ?></a>');
    <?php endif; ?>
}

<?php if (CAPUBBS_ENABLE_EMAIL_VERIFY): ?>
var resetCountdownTimer = null;

function sendResetCode() {
    var username = $('#resetUsername').val().trim();
    var email = $('#resetEmail').val().trim();
    if (!username || !email) { $('#resetMsg').css('color','#be0000').text('请填写论坛 ID 和注册邮箱。'); return; }

    var btn = $('#resetSendBtn');
    btn.prop('disabled', true);
    $('#resetMsg').css('color','#666').text('发送中...');

    $.post('/api/jiekoujson.php', {
        ask: 'sendResetPasswordCode',
        username: username,
        email: email
    }, function(resp) {
        try { var r = JSON.parse(resp); } catch(e) { r = resp; }
        if (r.code == 0) {
            $('#resetMsg').css('color','green').text('验证码已发送，请检查邮箱。');
            var sec = 60;
            resetCountdownTimer = setInterval(function() {
                sec--;
                if (sec <= 0) {
                    clearInterval(resetCountdownTimer);
                    $('#resetCountdown').text('');
                    btn.prop('disabled', false);
                } else {
                    $('#resetCountdown').text('(' + sec + 's)');
                }
            }, 1000);
        } else {
            $('#resetMsg').css('color','#be0000').text(r.msg || '发送失败');
            btn.prop('disabled', false);
        }
    }).fail(function() {
        $('#resetMsg').css('color','#be0000').text('网络错误，请重试。');
        btn.prop('disabled', false);
    });
}

function resetPassword() {
    var username = $('#resetUsername').val().trim();
    var email = $('#resetEmail').val().trim();
    var code = $('#resetCode').val().trim();
    if (!username || !email || !code) { $('#resetMsg').css('color','#be0000').text('请填写论坛 ID、注册邮箱和验证码。'); return; }

    $('#resetMsg').css('color','#666').text('处理中...');

    $.post('/api/jiekoujson.php', {
        ask: 'resetPasswordByEmail',
        username: username,
        email: email,
        code: code
    }, function(resp) {
        try { var r = JSON.parse(resp); } catch(e) { r = resp; }
        if (r.code == 0) {
            $('#resetMsg').css('color','green').text('密码已重置，新密码已发送至您的邮箱。');
        } else {
            $('#resetMsg').css('color','#be0000').text(r.msg || '重置失败');
        }
    }).fail(function() {
        $('#resetMsg').css('color','#be0000').text('网络错误，请重试。');
    });
}
<?php endif; ?>
</script>
</body>
</html>
