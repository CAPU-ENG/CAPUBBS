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


function dbconnect_mysqli() {
    $con = @mysqli_connect(CAPUBBS_DB_HOSTNAME, CAPUBBS_DB_USERNAME,
        CAPUBBS_DB_PASSWORD, "capubbs") or die("Cannot connect to database !!!");
    if (mysqli_connect_errno($con)) { 
        echo "连接 MySQL 失败: " . mysqli_connect_error();
        return null;
    } 

    // Set to `utf8mb4` in order to support emoji
    mysqli_query($con, "SET NAMES 'utf8mb4'");

	// Allow insert null while the column is defined with not null
    mysqli_query($con, "SET sql_mode = ''");
    
    return $con;
}

// Check user.
function checkuser() {
    $token=@$_COOKIE['token'];
    if ($token=="") return array("",0);
    dbconnect();
    $time=time();
    $statement="select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=60*60*24*7";
    $results=mysql_query($statement);
    if (mysql_num_rows($results)==0) return array("",0);
    $res=mysql_fetch_row($results);
    return $res;
}

function checkuser_mysqli() {
    $token=@$_COOKIE['token'];
    if ($token=="") return array("",0);
    $con = dbconnect_mysqli();
    $time = time();
    $statement="select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=60*60*24*7";
    $results=mysqli_query($con, $statement);
    if (mysqli_num_rows($results)==0) return array("",0);
    $res=mysqli_fetch_array($results);
    return $res;
}

function checkuser_con($con) {
    $token=@$_COOKIE['token'];
    if ($token=="") return array("",0);
    $time = time();
    $statement="select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=60*60*24*7";
    $results=mysqli_query($con, $statement);
    if (mysqli_num_rows($results)==0) return array("",0);
    $res=mysqli_fetch_array($results);
    return $res;
}
?>
