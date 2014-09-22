<?php
	include("../lib/mainfunc.php");
	$bid=@$_GET['bid'];
	$tid=@$_GET['tid'];
	$page=@$_GET['page'];
	if(!$page) $page=1;
	$action=@$_GET['action'];
	if(!in_array($action, array("lock","top","extr"))){
		die(json_encode(array("code"=>1,"msg"=>"非法操作")));
	}
	$result=mainfunc(array(
	"ask"=>$action,
	"bid"=>$bid,
	"tid"=>$tid));
	$result=$result[0];
	if($result['code']==0){
		header("Location: ../main/?tid=$tid&bid=$bid&p=$page");
	}else{
		echo(json_encode($result));
	}
?>
