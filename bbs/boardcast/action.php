<?php
	include '../lib/mainfunc.php';
	$text=@$_POST['text'];
	$result=mainfunc(array("ask"=>"boardcast","text"=>$text));
	$result=$result[0];
	$code=intval($result['code']);
	if ($code==0) echo '0';
	else echo @$result['msg'];
?>
