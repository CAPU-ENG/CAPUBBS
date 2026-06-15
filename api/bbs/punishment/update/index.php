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
    $punishment_id = isset($_POST['punishment_id']) ? $_POST['punishment_id'] : null;
    $end_date = isset($_POST['end_date']) ? $_POST['end_date'] : '';
    $action = isset($_POST['action']) ? $_POST['action'] : '';
} else if ($method == 'GET') {
    $punishment_id = isset($_GET['punishment_id']) ? $_GET['punishment_id'] : null;
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';
    $action = isset($_GET['action']) ? $_GET['action'] : '';
}

header('Content-Type:application/json; charset=utf-8');
if (!capubbs_punishment_service($con)->canManage($username)) {
    exit;
}

$ret = capubbs_punishment_service($con)->legacyUpdate($username, array(
    'punishment_id' => $punishment_id,
    'end_date' => $end_date,
    'action' => $action,
), array(
    '_POST' => $_POST,
    '_GET' => $_GET,
));

echo json_encode($ret);
