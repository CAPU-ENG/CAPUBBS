<?php
	include("../lib/mainfunc.php");
	$users=getuser();
	$username=$users['username'];
?>

<html>
<head>
<meta charset="utf-8">
<style type="text/css">
div.userpic{
	background-color: white;
	width: 100px;
	margin-top: 20px;
	float: left;
}
.drop-shadow{
	-webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.1) inset;
	-moz-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
	box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
}
img.icon{
	width: 90%;
	margin-left: 5%;
	margin-top: 10px;
	margin-bottom: 10px;
}
div.infos{
	width: 570px;
	float: left;
	margin-left: 50px;
	margin-top: 20px;
}
table.infos{
	width: 100%;
	
}
img.tipic{
	height: 15px;
	width: 15px;
}
span.info{
	color: #6F6F6F;
	font-size: 15px;
}
div.button{
	background-image: -webkit-linear-gradient(#76caff 0%, #1d9eff 100%);
	background-color: #1d9eff;
	background-size: 100%,100%;
	background-repeat: no-repeat;
	width: 100px;
	height: 24px;
	color: white;
	border-radius: 10px;
	font-size: 15px;
	text-align: center;
	line-height: 20px;
	padding-top: 5px;
	float: left;
	cursor: pointer;
	-webkit-transition: background-image 0.2s,background-color 0.2s;
}
div.button:hover{
	background-image: -webkit-linear-gradient(#98ecff 0%, #3fafff 100%);
	background-color: #3fafff;
}
</style>
</head>
<body>
<?php
if($username==""){
	echo("</body></html>");exit;
}
	$userinfo=mainfunc(array("view"=>$username));
	$userinfo=$userinfo[0];
	$icon=translateicon($userinfo['icon']);

?>

<div class="content">
<div class="userpic drop-shadow">
<img class="icon" src="<?php echo translateicon($userinfo['icon']);?>">
</div>
<div class="infos">
<table border="0" class="infos">
<?php
$icons=array('username','qq','level','email','rank','hobby','place','time','date','key','post','reply','pen','water');
$tips=array('用户名','QQ','星数','Email','注册码','爱好','地点','上次在线','注册日期','权限','发帖','回复','签到','灌水');
$keys=array('username','qq','star','mail','code','hobby','place','lastdate','regdate','rights','post','reply','sign','water');
for($i=0;$i<count($icons);$i++){
	if($i%2==0){
		echo("<tr height='27px'>");
	}
	echo("<td width='120px'><img src='../user/icons/".$icons[$i].".png' class='tipic'>&nbsp;&nbsp;&nbsp;");
	echo("<span class='info'>".$tips[$i]."：</span></td>");
	echo("<td><span class='info'>".trans(@$key,$userinfo[$keys[$i]]));
	if($tips[$i]=='用户名'){
		echo("&nbsp;&nbsp;");
		if($userinfo['sex']=="男"){
			echo("<img class='tipic' src='../user/icons/boy.png'>");
		}else if($userinfo['sex']=="女"){
			echo("<img class='tipic' src='../user/icons/girl.png'>");	
		}
	}
	echo("</span>");
	echo("</td>");
}

function trans($key,$value){
	if(!$value&&$value!=0) return "不知道";
	if($key=="regdate"||$key=="lastdate") return formatstamp($value);
	return $value;
}
?>
</table>
</div>
<div class="button" onclick="window.open('../edituser');" style="margin-left:300px;margin-top:50px;">修改</div>
<script type="text/javascript">
window.onload=function(){
	window.parent.ifrmLoaded();
}

</script>

</body>
</html>
