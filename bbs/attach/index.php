<?php
	include("../lib/mainfunc.php");
	$maxsize = 100; //Mb
	header('content-type: application/json');
	if(!$_FILES['file']){
		reportWithCode(0);
	}
	if($_FILES['file']['size'] > ($maxsize * 1048576)){
		reportWithCode(1);
	}
	$folder = '../attachment/';
	if(!is_dir($folder)){
		mkdir($folder);
	}
	$filename = sha1(@microtime()) . '.attach';
	$name = $_FILES['file']['name'];
	$name=str_replace("%", "%25", $name);
	move_uploaded_file($_FILES["file"]["tmp_name"], $folder.$filename);
	$auth=$_POST['auth'];
	$price=$_POST['price'];
	if(!$auth) $auth=0;
	if(!$price) $price=0;
	$result=mainfunc(array(
	"ask"=>"attach",
	"path"=>$filename,
	"filename"=>$name,
	"auth"=>$auth,
	"price"=>$price));
	$result=$result[0];
	if($result['code']=='0'){
		$ans=array(
		"code"=>$result['code'],
		"id"=>$result['msg']);
	}else{
		$ans=array(
		"code"=>$result['code'],
		"msg"=>$result['msg']);
		unlink($folder.$filename);
	}
	echo(json_encode($result));
	function reportWithCode($code){
		$result=array("code"=>$code);
		echo(json_encode($result));
		exit();
	}
?>