<?php
	include "../../config.php";
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
/* 	-webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 0, 0, 0.1) inset; */
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
<h1>登录CAPUBBS</h1>
<form>
用户名：<input name="username" type="text" class="text" id="username" value="<?php echo(@$_GET['username']) ?>"><br>
　密码：<input name="password" type="password" class="text" id="password"><br>
<input type="hidden" value="" name="password1" id="password1">
<input type="hidden" value="<?php echo(@$_GET['from']); ?>" name="from" id="from">
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<input type="button" value="登录" class="button" onclick="check();">
<input type="button" value="注册" class="button" onclick="register();">
&nbsp;&nbsp;<a href="javascript:forget()">忘记密码？</a>
</form>
<div id="tip" class="tip">
<?php echo(@$_GET['tip']); ?>
</span>
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
	var x="请联系管理员，邮箱：<a href='mailto:pkuzhd@pku.edu.cn'>pkuzhd@pku.edu.cn</a>";
	$('#tip').html(x);
}
</script>
</body>
</html>
