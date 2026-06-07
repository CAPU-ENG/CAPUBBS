<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../lib/general.css">
<script src="../lib/md5.js" type="text/javascript"></script>
<style type="text/css">
body{
    color: #444444;
}
form{
    margin-left: auto;
    margin-right: auto;
    width: 300px;
}
input.submit{
    margin-left: 80px;
}
</style>
<script type="text/javascript">
window.onload=function(){
    window.parent.ifrmLoaded();
}
</script>
</head>
<body>
<h2 align="center">修改密码</h2>
<?php
include_once "../../config.php";
include_once "../lib/mainfunc.php";
if (CAPUBBS_ENABLE_EMAIL_VERIFY) {
    $userinfo = mainfunc(array("ask" => "currentUserInfo"));
    if (!empty($userinfo)) {
        $u = $userinfo[0];
        $mail_val2 = isset($u['mail']) ? $u['mail'] : '';
        $verified2 = isset($u['verified']) ? intval($u['verified']) : 0;
    }
}
?>
<form action="s_action.php" onsubmit="return check();" method="post">
　　原密码：<input type="password" name="old_psd" id="old_psd"><br>
　　新密码：<input type="password" name="new_psd" id="new_psd"><br>
确认新密码：<input type="password" name="new_psd2" id="new_psd2"><br><br>
<input type="submit" class="submit">
<input type="hidden" name="old_md5" id="old_md5">
<input type="hidden" name="new_md5" id="new_md5">
</form>
<script type="text/javascript">
function check(){
    var oldpsd=document.getElementById("old_psd").value;
    var newpsd=document.getElementById("new_psd").value;
    var newpsd2=document.getElementById("new_psd2").value;
    if(!oldpsd){
        alert("请输入旧密码");
        return false;
    }
    if(!newpsd){
        alert("请输入新密码");
        return false;
    }
    if(!newpsd2==newpsd){
        alert("两次输入的新密码不一致");
        return false;
    }
    document.getElementById("old_md5").value=hex_md5(oldpsd);
    document.getElementById("new_md5").value=hex_md5(newpsd);
    document.getElementById("old_psd").value="";
    document.getElementById("new_psd").value="";
    document.getElementById("new_psd2").value="";
    return true;
    
}

</script>

<?php if (CAPUBBS_ENABLE_EMAIL_VERIFY && isset($mail_val2)): ?>
<br>
<div style="text-align:center;font-size:13px;color:#444;">
	<strong>邮箱状态：</strong>
	<?php if (empty($mail_val2)): ?>
		<span style="color:#f44336;">未设置邮箱</span>
		<a href="../edituser/" style="margin-left:8px;">去设置</a>
	<?php elseif ($verified2): ?>
		<span style="color:#4CAF50;">已验证 (<?php echo htmlspecialchars($mail_val2); ?>)</span>
	<?php else: ?>
		<span style="color:#FF9800;">未验证</span>
		<a href="javascript:window.parent.setframe('verify_email');" style="margin-left:8px;">去验证</a>
	<?php endif; ?>
</div>
<?php endif; ?>

</body>
</html>
