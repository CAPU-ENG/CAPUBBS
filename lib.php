<?php
/**
 * Global shared lib for CAPUBBS.
 */
require_once 'config.php';

// Database connector.
function dbconnect() {
    $con = @mysql_connect(CAPUBBS_DB_HOSTNAME, CAPUBBS_DB_USERNAME,
        CAPUBBS_DB_PASSWORD) or die("Cannot connect to database !!!");

    // Set to `utf8mb4` in order to support emoji
	mysql_query("SET NAMES 'utf8mb4'");

	// Allow insert null while the column is defined with not null
    mysql_query("SET sql_mode = ''");
}

// Check user.
function checkuser() {
    $token=@$_COOKIE['token'];
    if ($token=="") return array("",0);
    dbconnect();
    $time=time();
    $statement="select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=1800";
    $results=mysql_query($statement);
    if (mysql_num_rows($results)==0) return array("",0);
    $res=mysql_fetch_row($results);
    return $res;
}
?>
