<?php
	include("../lib/mainfunc.php");
	$bid=@$_POST['bid'];
	$tid=@$_POST['tid'];
	$pid=@$_POST['pid'];
	$result=mainfunc(array(
	"ask"=>"delete",
	"bid"=>$bid,
	"tid"=>$tid,
	"pid"=>$pid));
	#echo($result);exit;
	$result=$result[0];
	if($result['code']==0){
		echo 0;
	}else{
		echo($result['msg']);
	}
?>
