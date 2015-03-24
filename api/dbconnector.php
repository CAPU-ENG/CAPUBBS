<?php
function dbconnect() {
    $con = @mysql_connect('localhost','root','19951025')
        or die("Cannot connect to database !!!");
    mysql_query("SET NAMES 'UTF8'");
}
?>
