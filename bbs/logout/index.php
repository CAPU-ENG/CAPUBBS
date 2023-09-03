<?php
	include("../lib/mainfunc.php");
	date_default_timezone_set('Asia/Shanghai');
	$from=@$_GET['from'];
	$from=urldecode($from);
	if(!$from) $from="../index";
	$result=mainfunc(array("ask"=>"logout"));
	$result=$result[0];
	$code=$result["code"];
	
	$time=time()-999999;
	$date=date("D, d M Y H:i:s",$time)." GMT";
	if(!$from) $from="../index";
	if($code==0){
		header('Set-cookie: token=invalid; domain=.chexie.net; expires='.$date.'; path=/'."\n",false);
		header("Location: $from");
	}else{
		echo("注销时遇到问题，错误编码：$code");
	}
?>
