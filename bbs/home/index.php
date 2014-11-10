<?php
	include("../lib/mainfunc.php");
	$users=getuser();
	$username=$users['username'];
?>

<html>
<head>
<meta charset="utf-8">
<title>CAPUBBS - 我</title>
<link rel="stylesheet" href="../lib/general.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<style type="text/css">
body{
	background-image: url("/static/img/bg.jpg");
	background-position: center top;
	background-repeat: no-repeat;
	background-color: #ABC9B6;
}
div.main{
	width: 1000px;
	min-height: 100%;
	overflow: hidden;
	margin-left: auto;
	margin-right: auto;
/* 	background-color: #CBD0E3; */
}
div.head{
/* 	background-color: red; */
	height: 240px;
}
div.navi{
	float: left;
	margin-top: 40px;
}
iframe.sub{
	float: left;
	border: none;
	margin-left: 30px;
	margin-right: 40px;
	width: 770px;
	height: 600px;
}
ul{
	list-style-type:none;
	line-height: 26px;
}
li{
	border-bottom: 1px dashed rgba(0,0,0,0.38);
}
span.userinfo a{
	color: #6d90ee;	
	text-decoration: none;
}
span.userinfo{
	float: right;
	margin-right: 50px;
	margin-top: 18px;
	color: #6d706e;
}
img.usericon{
	-webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.1) inset;
	-moz-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
	box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
	width: 64px;
	height: 64px;
	background-color: white;
	border: 3px solid white;
	float: left;
}
div.userinfo{
	float: left;
	margin-left: 25px;
	font-size: 13px;
	line-height: 24px;
	margin-top: 0px;
}

a{
	text-decoration: none;
	color: #0096ff;
}
div.unlogin{
	width: 800px;
	height: 200px;
	margin-left: auto;
	margin-right: auto;
	border-radius: 20px;
	border: 3px dashed white;
	color: white;
	text-align: center;
	line-height: 200px;
	font-size: 16px;
}
a:hover{
	color: #c50000;
}
</style>
</head>
<body>
<div class="main">
<div class="head">

<div class="user">
<?php
if($username!=""){
	$userinfo=mainfunc(array("view"=>$username));
	$userinfo=$userinfo[0];
	$msg=intval($userinfo['newmsg']);
	$icon=translateicon($userinfo['icon']);
	$rank=$userinfo['star'];

	$nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
	$nowurl=urlencode($nowurl);
}else{
	$nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
	$msg=0;
	$nowurl=urlencode($nowurl);
	echo("<span class='guest'>欢迎您，游客！<a href='../login?from=$nowurl'>登录</a> 或者 <a href='../register'>注册</a></span>");
}
?>

</div>
</div>

<div class="content">
<?php
if($username!=""){
?>
<div class="navi">
<ul>
<li><a href='javascript:setframe("information");'>个人信息</a></li>
<li><a href='javascript:setframe("message");'>我的消息<?php
		if($msg!=0) echo("<font color='#AA0000'>($msg)</font>");
?></a></li>
<li><a href='javascript:setframe("security");'>账号安全</a></li>
<li><a href='../logout'>登出</a></li>
</ul>
</div>
<iframe class="sub" id="sub" src="information.php">
</iframe>
</div>

<?php
}else{
?>
<div class="unlogin">
	<span>请先 <a href='../login?from=<?php echo $nowurl;?>'>登录</a> 或者 <a href='../register'>注册</a> 以访问此页面。</span>
</div>
<?php
}
?>
</div>
<script type="text/javascript">
function ifrmLoaded(){
	document.getElementById("sub").style.opacity=1;
}
function setframe(frame){
	document.getElementById("sub").style.opacity=0.7;
	document.getElementById("sub").src=frame+".php";
	if (frame=="message") {
		window.scrollTo(0,99999);
	}
	else {window.scrollTo(0,0);}
}
<?php
if(@$_GET['pos']){
	echo('setframe("'.@$_GET['pos'].'")');
}
?>
</script>
</body>
</html>
