<?php
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
</span>
</div>
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
    var html = '<div style="margin-top:15px;text-align:left;">' +
        '<p style="font-size:13px;">第一步：输入注册邮箱，发送验证码</p>' +
        '<input id="resetEmail" type="text" class="text" placeholder="请输入PKU邮箱" style="width:200px;">' +
        '<input type="button" value="发送验证码" class="button" id="resetSendBtn" onclick="sendResetCode()" style="margin-left:5px;">' +
        '<span id="resetCountdown" style="font-size:12px;color:#999;margin-left:5px;"></span>' +
        '<p style="font-size:13px;margin-top:10px;">第二步：输入验证码，重置密码</p>' +
        '<input id="resetCode" type="text" class="text" placeholder="6位验证码" style="width:200px;">' +
        '<input type="button" value="重置密码" class="button" onclick="resetPassword()" style="margin-left:5px;">' +
        '<p style="font-size:12px;color:#999;margin-top:5px;">密码将重置为 123456，请登录后尽快修改。</p>' +
        '<div id="resetMsg" style="font-size:12px;margin-top:5px;"></div>' +
        '</div>';
    $('#tip').html(html);
    <?php else: ?>
    $('#tip').html('请联系管理员，邮箱：<a href="mailto:<?php echo ADMIN_EMAIL; ?>"><?php echo ADMIN_EMAIL; ?></a>');
    <?php endif; ?>
}

<?php if (CAPUBBS_ENABLE_EMAIL_VERIFY): ?>
var resetCountdownTimer = null;

function sendResetCode() {
    var email = $('#resetEmail').val().trim();
    if (!email) { $('#resetMsg').css('color','#be0000').text('请输入邮箱地址。'); return; }

    var btn = $('#resetSendBtn');
    btn.prop('disabled', true);
    $('#resetMsg').css('color','#666').text('发送中...');

    $.post('/api/jiekoujson.php', {
        ask: 'sendResetPasswordCode',
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
    var email = $('#resetEmail').val().trim();
    var code = $('#resetCode').val().trim();
    if (!email || !code) { $('#resetMsg').css('color','#be0000').text('请填写邮箱和验证码。'); return; }

    $('#resetMsg').css('color','#666').text('处理中...');

    $.post('/api/jiekoujson.php', {
        ask: 'resetPasswordByEmail',
        email: email,
        code: code
    }, function(resp) {
        try { var r = JSON.parse(resp); } catch(e) { r = resp; }
        if (r.code == 0) {
            $('#resetMsg').css('color','green').text('密码已重置为 123456，请登录后修改密码。');
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
