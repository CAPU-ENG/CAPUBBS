<?php
function dbconnect() {
	$con = @mysql_connect('localhost','root','199521025') 
		or die("Cannot connect to database !!!");
	mysql_query("SET NAMES 'UTF8'");
}
?>
