<?php
include("../lib/mainfunc.php");
date_default_timezone_set("Asia/Shanghai");
$username=$_REQUEST['username'];
$password=$_REQUEST['password1'];
$result=mainfunc(array("ask"=>"login",
"username"=>$username,
"password"=>$password,
"onlinetype"=>"web",
"browser"=>@$_SERVER['HTTP_USER_AGENT']
#"md5"=>"yes"));
));
$result=$result[0];
$code=intval($result['code']);
$time=time()+999999;
$date=date("D, d M Y H:i:s",$time)." GMT";

if($code==0){
	$token=$result['token'];
	header('Set-cookie: token='.$token.'; domain=.chexie.net; expires='.$date.'; path=/'."\n");
	echo 0;
} else echo $result['msg'];
?>
