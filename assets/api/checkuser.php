<?php
    require_once dirname(__FILE__) . '/../../config.php';
	function checkuser() {
		$token=@$_COOKIE['token'];
		if ($token=="") return array("",0);

		@$con=mysql_connect(CAPU_DB_HOST, CAPU_DB_USER, CAPU_DB_PWD);
		mysql_query("SET NAMES 'UTF8'");
		$time=time();
		$statement="select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=1800";
		$results=mysql_query($statement,$con);
		if (mysql_num_rows($results)==0) return array("",0);
		$res=mysql_fetch_row($results);
		return $res;
	}



?>
