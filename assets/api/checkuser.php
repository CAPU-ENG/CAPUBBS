<?php
	require_once('../../bbs/lib/mainfunc.php');

	function checkuser() {
		$token=@$_COOKIE['token'];
		if ($token=="") return array("",0);

		dbconnect;
		mysql_query("SET NAMES 'UTF8'");
		$time=time();
		$statement="select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=1800";
		$results=mysql_query($statement);
		if (mysql_num_rows($results)==0) return array("",0);
		$res=mysql_fetch_row($results);
		return $res;
	}



?>
