<?php
	include("../lib/mainfunc.php");
	$user=@$_GET['name'];
	if ($user=="") exit;
	$userinfo=mainfunc(array("view"=>$user));
	if (count($userinfo)==0) {
		header("Content-type: text/html;charset='utf8'");
		echo '用户不存在！';
		exit;
	}
	$userinfo=$userinfo[0];
?>
<html>
<head>
<title>CAPUBBS - 个人信息</title>
<meta charset="utf-8">
<link rel="stylesheet" href="../lib/general.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<style>
body{
	background-image: url("/assets/images/static/bg.jpg");
	background-position: center top;
	background-repeat: no-repeat;
	background-color: #ABC9B6;
}
div.grxx,div.jqdt{
	width: 900px;
	margin-left: auto;
	margin-right: auto;
	margin-top: 250px;
}
div.jqdt{
	margin-top: 300px;
}
img.bar{
	width: 100%;
}
div.userpic{
	background-color: white;
	width: 150px;
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
	width: 700px;
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
table.recent{
	width: 95%;
	margin-left: 5%;
}
span.title a{
	color: #6F6F6F;
	text-decoration: none;
	font-size: 17px;
}
span.num{
	color: #96AF9F;
	font-size: 30px;
	font-weight: bold;
}
span.time{
	color: #6F6F6F;
}
</style>
</head>
<body>
<div class="grxx">
<img src="grxx.png" class="bar">
<div class="userpic drop-shadow">
<img class="icon" src="<?php echo translateicon($userinfo['icon']);?>">
</div>
<div class="infos">
<table border="0" class="infos">
<?php
$icons=array('username','qq','level','email','hobby','place','time','date','key','rank','post','reply','pen','water');
$tips=array('用户名','QQ','星数','Email','爱好','地点','上次在线','注册日期','权限','精品','发帖','回复','签到','灌水');
$keys=array('username','qq','star','mail','hobby','place','lastdate','regdate','rights','extr','post','reply','sign','water');
for($i=0;$i<count($icons);$i++){
	if($i%2==0){
		echo("<tr height='27px'>");
	}
	echo("<td width='120px'><img src='icons/".$icons[$i].".png' class='tipic'>&nbsp;&nbsp;&nbsp;");
	echo("<span class='info'>".$tips[$i]."：</span></td>");
	echo("<td><span class='info'>".trans(@$key,$userinfo[$keys[$i]]));
	if($tips[$i]=='用户名'){
		echo("&nbsp;&nbsp;");
		if($userinfo['sex']=="男"){
			echo("<img class='tipic' src='icons/boy.png'>");
		}else if($userinfo['sex']=="女"){
			echo("<img class='tipic' src='icons/girl.png'>");	
		}
	}
	echo("</span>");
	echo("</td>");
}
function trans($key,$value){
	if(!$value&&$value!=0) return "不知道";
	return $value;
}
?>
</table>
</div>
</div>
<div class="jqdt">
<img src="jqdt.png" class="bar">
<div class="recents">
<br>
&nbsp;&nbsp;&nbsp;<img src="recentposts.png" width="124px"><br>
<table border="0" class="recent">
<?php
$recentposts=mainfunc(array("view"=>$_GET['name'],"ask"=>"recentpost"));
if(count($recentposts)-1==0){
	echo("<tr><td><span class='time'>该用户暂未发表主题</span></td></tr>");
}else{
	for($i=1;$i<count($recentposts);$i++){
		echo("<tr>");
		echo("<td width='50px'><span class='num'>".heal($i)."</span></td>");
		$title=$recentposts[$i]['title'];
		$bid=$recentposts[$i]['bid'];
		$tid=$recentposts[$i]['tid'];
		$link="../content?bid=$bid&tid=$tid";
		echo("<td><span class='title'><a href='$link'>$title</a></span></td>");
		echo("<td width='100px' align='right'><span class='time'>".formatstamp($recentposts[$i]['timestamp'])."</span></td>");
	}
}
?>
</table>
</div>

<div class="recents">
<br>
&nbsp;&nbsp;&nbsp;<img src="recentreply.png" width="124px"><br>
<table border="0" class="recent">
<?php
$recentposts=mainfunc(array("view"=>$_GET['name'],"ask"=>"recentreply"));
if(count($recentposts)-1==0){
	echo("<tr><td><span class='time'>该用户暂无回复</span></td></tr>");
}else{
	for($i=1;$i<count($recentposts);$i++){
		echo("<tr>");
		echo("<td width='50px'><span class='num'>".heal($i)."</span></td>");
		$title=$recentposts[$i]['title'];
		$bid=$recentposts[$i]['bid'];
		$tid=$recentposts[$i]['tid'];
		$link="../content?bid=$bid&tid=$tid&p=1";
		echo("<td><span class='title'><a href='$link'>$title</a></span></td>");
		echo("<td width='100px' align='right'><span class='time'>".formatstamp($recentposts[$i]['updatetime'])."</span></td>");
	}
}
?>
</table>
</div>


</div>
</body>
</html>
