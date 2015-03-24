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
</body>
</html>
