<?php
	include("../lib/mainfunc.php");
	$maxsize = 2; //Mb
	header('content-type: application/json');
	if(!@$_FILES['file']){
		reportWithCode(0);
	}
	if(!@$_FILES['file']['size'] > ($maxsize * 1048576)){
		reportWithCode(1);
	}
	$folder = '../../bbsimg/icons/user_upload/';
	$urlroot='user_upload/';
	if(!is_dir($folder)){
		mkdir($folder);
	}
	$filename = sha1(@microtime()) . '.png';
	$name = $_FILES['file']['name'];
	$name=str_replace("%", "%25", $name);
	move_uploaded_file($_FILES["file"]["tmp_name"], $folder.$filename);
	echo(json_encode(array("code"=>"0","url"=>$urlroot.$filename)));
	function reportWithCode($code){
		$result=array("code"=>$code);
		echo(json_encode($result));
		exit();
	}
?>
