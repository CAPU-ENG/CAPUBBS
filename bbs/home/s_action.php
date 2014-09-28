<?php
	include("../lib/mainfunc.php");
	date_default_timezone_set("Asia/Shanghai");
	$result=mainfunc(array(
	"ask"=>"changepsd",
	"old"=> @$_POST['old_md5'],
	"new"=> @$_POST['new_md5']));
	$result=$result[0];
	if($result['code']==0){
		$token=$result['msg'];
		$time=time()+1800;
		$date=date("D, d M Y H:i:s",$time)." GMT";
		header('Set-cookie: token='.$token.'; expires='.$date.'; path=/'."\n",false);
		echo("修改成功");
	}else{
		echo($result['msg']."<br><a href='security.php'>返回</a>");
	}
?>
