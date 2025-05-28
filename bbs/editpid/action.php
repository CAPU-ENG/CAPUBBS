<?php
	include("../lib/mainfunc.php");
	$bid=$_POST["bid"];
	$tid=@$_POST["tid"];
	$pid=@$_POST["pid"];
	$icon=$_POST["icon"];
	$token=$_POST["token"];
	$title=$_POST["title"];
	$text=$_POST["text"];
	$sig=$_POST["sig"];
	$attachs=$_POST['attachs'];
	$p= ceil((intval($pid))/12);		
		$result=mainfunc(array(
		"ask"=>"edit",
		"bid"=>$bid,
		"tid"=>$tid,
		"pid"=>$pid,
		"token"=>$token,
		"title"=>$title,
		"text"=>$text,
		"icon"=>$icon,
		"sig"=>$sig,
		"type"=>"web",
		"attachs"=>$attachs));
		$result=$result[0];
		if($result['code']=="0"){
			//header("Location: ../content/?bid=$bid&tid=$tid&p=$p");
			echo "0../content/?bid=$bid&tid=$tid&p=$p#$pid";
		}else{
			//echo($result['code']);
			echo "1".$result['msg'];
		}		
	
?>
