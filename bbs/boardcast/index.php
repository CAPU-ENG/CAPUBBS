<?php
	include "../lib/mainfunc.php";
	$user=getuser();
	$rights=intval($user['rights']);
	if ($rights!=4) exit;
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>群发消息</title>
<link href="../lib/general.css" rel="stylesheet"/>
<script src="../lib/jquery.min.js"></script>
</head>

<body>
<center>

<h1>群发消息给所有用户</h1>
<p>
<textarea id="message" placeholder="请输入消息内容；将通过admin账号发送；系统会自动在前面加上 “尊敬的xxx您好，” 这几个字" style="width:400px;height:200px;font-size:13px;padding:5px;"></textarea>
<br><br>
<button onclick="sendto()">发送</button>
</center>
<script>
function sendto() {
	var text=$('#message').val();
	$.post("action.php",{text:text},
		function (val) {
			var x=parseInt(val);
			if (x==0) {
				alert("群发消息成功！");
				$('#message').val("");
			}
			else alert("Error: msg"+val);
		}
	);
}
</script>
</body>

