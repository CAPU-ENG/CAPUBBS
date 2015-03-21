<?php
	require_once('../bbs/lib/mainfunc.php');

	header("Content-type: text/html;charset=utf-8");

	$save=@$_GET['saved'];
	$start=intval(@$_GET['start']);
	if ($start=="" || $start<0) $start=10001;
	$number=intval(@$_GET['number']);
	if ($number=="" || $number==0 || $number<=0) $number=1000;
	$end=$start+$number;

	if ($save=="yes")
		dbconnect;

	echo "<pre>";
	for ($i=$start;$i<$end;$i++) {
		$code=md5($i);
		$str=substr($code,0,1).substr($code,4,1).substr($code,9,1).substr($code,16,1).substr($code,20,1).substr($code,23,1).substr($code,26,1).substr($code,30,1);
		echo $str."\n";
		if ($save=="yes") {
			$statement="insert into capubbs.codes values ($i,'$str',0)";
			mysql_query($statement);
		}
	}
	echo "</pre>";



?>
