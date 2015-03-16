<?php
include("../lib/mainfunc.php");
include("../../assets/api/captcha.php");
date_default_timezone_set("Asia/Shanghai");

captcha_check();

$username=$_POST['username'];
$password=$_POST['password1'];
$sex=$_POST['sex'];
$qq=$_POST['qq'];
$icon=$_POST['icon'];
$ip=$_SERVER['REMOTE_ADDR'];
$mail=$_POST['email'];
$intro=$_POST['intro'];
$hobby=$_POST['hobby'];
$place=$_POST['place'];
$sig1=$_POST['sig1'];
$sig2=$_POST['sig2'];
$sig3=$_POST['sig3'];
//$code=@$_POST['code'];

$result=mainfunc(array(
"ask"=>"register",
"username"=>$username,
"password"=>$password,
"sex"=>$sex,
"ip"=>$ip,
"qq"=>$qq,
"icon"=>$icon,
"mail"=>$mail,
"intro"=>$intro,
"hobby"=>$hobby,
"place"=>$place,
"sig1"=>$sig1,
"sig2"=>$sig2,
"sig3"=>$sig3,
//"code"=>$code,
"onlinetype"=>"web",
"browser"=>@$_SERVER['HTTP_USER_AGENT']
));

$result=$result[0];
#echo(json_encode($result));
header('Content-type:text/html;charset=utf-8');
if(intval($result['code'])==0){
	$time=time()+999999;
	$date=date("D, d M Y H:i:s",$time)." GMT";
	header('Set-cookie: token='.$result['token'].'; expires='.$date.'; path=/'."\n");
	echo 0;
	exit;
}else{
	echo($result['msg']);
}
?>
