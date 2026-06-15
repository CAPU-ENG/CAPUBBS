<?php
require_once __DIR__ . "/../../../../bbs/lib/mainfunc.php";
require_once __DIR__ . '/../../../../lib.php';
require_once __DIR__ . '/../../../../src/Bootstrap.php';

$con = dbconnect_mysqli();
$user = checkuser_con($con);
$username = $user["username"];

$year = @$_GET['year'];
$history = intval(@$_GET['history']);

header('Content-Type:application/json; charset=utf-8');
$ret = capubbs_punishment_service($con)->legacyList(array(
    'year' => $year,
    'history' => $history,
    'username' => $username,
));
echo json_encode($ret);
