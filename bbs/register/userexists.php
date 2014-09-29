<?php
include("../lib/mainfunc.php");
$result=mainfunc(array("ask"=>"userexists",
"user"=>$_GET['user']));
$result=$result[0];
echo($result["code"]);
?>