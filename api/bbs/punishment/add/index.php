<?php
require_once __DIR__ . "/../../../../bbs/lib/mainfunc.php";
require_once __DIR__ . '/../../../../lib.php';
require_once __DIR__ . '/../../../../src/Bootstrap.php';

$con = dbconnect_mysqli();
$user = checkuser_con($con);
$username = $user["username"];

$method = $_SERVER['REQUEST_METHOD'];
// if ($method != 'POST') {
//     exit;
// }

if ($method == 'POST') {
    $action = $_POST['action'];
    $id = $_POST['username'];
    $name = $_POST['name'];
    $reason = $_POST['reason'];
    $distance = $_POST['distance'];
    $addition = $_POST['addition'];
    $start_date = $_POST['start_date'];
} else if ($method == 'GET') {
    $action = $_GET['action'];
    $id = $_GET['username'];
    $name = $_GET['name'];
    $reason = $_GET['reason'];
    $distance = $_GET['distance'];
    $addition = $_GET['addition'];
    $start_date = $_GET['start_date'];
}

header('Content-Type:application/json; charset=utf-8');
if (!capubbs_punishment_service($con)->canManage($username)) {
    exit;
}

$ret = capubbs_punishment_service($con)->legacyAdd($username, array(
    'action' => $action,
    'username' => $id,
    'name' => $name,
    'reason' => $reason,
    'distance' => $distance,
    'addition' => $addition,
    'start_date' => $start_date,
), array(
    '_POST' => $_POST,
    '_GET' => $_GET,
));

echo json_encode($ret);
