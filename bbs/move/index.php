<?php
	include("../lib/mainfunc.php");
	$from=$_GET['from'];
	$tid=$_GET['tid'];
	$p=$_GET['p'];
	$to=$_GET['to'];
	
	$result=mainfunc(array(
		"ask"=>"move",
		"bid"=>$from,
		"tid"=>$tid,
		"to"=>$to));
	//echo($result);exit;
	//$result=$result[0];
	//echo(json_encode($result));

	$result=$result[0];
	$code=intval($result['code']);
	if ($code==0) {
		$bid=$result['bid'];
		$tid=$result['tid'];
		header("Location: ../content/?bid=$bid&tid=$tid");
	}
	else
		echo $result['msg'];

?>
