<?php
function dbconnect() {
	$con = @mysql_connect('localhost','root','19921025') 
		or die("Cannot connect to database !!!");
}
?>
