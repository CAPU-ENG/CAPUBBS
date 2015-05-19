<?php
function dbconnect() {
    $con = @mysql_connect('<dbserver>','<username>','<password>')
        or die("Cannot connect to database !!!");
    mysql_query("SET NAMES 'UTF8'");
}
?>
