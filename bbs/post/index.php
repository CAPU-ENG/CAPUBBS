<?php
	include("../lib/mainfunc.php");
	$bid=$_POST["bid"];
	$tid=@$_POST["tid"];
	$title=$_POST["title"];
	$text=$_POST["text"];
	$sig=$_POST["sig"];
	$attachs=$_POST['attachs'];
	if(intval($tid)<0){
		$result=mainfunc(array(
		"ask"=>"post",
		"bid"=>$bid,
		"title"=>$title,
		"text"=>$text,
		"sig"=>$sig,
		"attachs"=>$attachs,
		"type"=>"web"
		));
		$result=$result[0];
		if($result['code']=="0"){
			//header("Location: ../main?bid=$bid");
			echo '0';
		}else{
			//header("Content-type: text/html; charest=utf-8");
			//echo '<html><head><script>alert(\''.$result['msg'].'\');window.history.back();</script></head></html>';
			echo $result['msg'];
		}
	}else{
		
		$result=mainfunc(array(
		"ask"=>"reply",
		"bid"=>$bid,
		"tid"=>$tid,
		"title"=>$title,
		"text"=>$text,
		"sig"=>$sig,
		"type"=>"web",
		"attachs"=>$attachs));
		$result=$result[0];

		if($result['code']=="0"){
			//header("Location: ../content?bid=$bid&tid=$tid");
			echo 0;
		}else{
			//header("Content-type: text/html; charest=utf-8");
			//echo '<html><head><script>alert(\''.$result['msg'].'\');window.history.back();</script></head></html>';
			echo $result['msg'];
		}		
	}
	
?>
