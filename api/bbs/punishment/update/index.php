<?php
require_once "../../../../bbs/lib/mainfunc.php";
require_once '../../../../lib.php';

$con = dbconnect_mysqli();
$user = checkuser_con($con);
$username = $user["username"];

$method = $_SERVER['REQUEST_METHOD'];
// if ($method != 'POST') {
//     exit;
// } 

// {
//     "action": "finish",
//     "end_date": "2027-08-01",
//     "punishment_id": 90
// }
// {
//     "action": "cancel_finish",
//     "punishment_id": 90
// }

if ($username != "组织部") {
    exit;
}

if ($method == 'POST') {
    $punishment_id = $_POST['punishment_id'];
    $end_date = $_POST['end_date'];
    $action = $_POST['action'];
} else if ($method == 'GET') {
    $punishment_id = $_GET['punishment_id'];
    $end_date = $_GET['end_date'];
    $action = $_GET['action'];
}

if (is_null($punishment_id)) {
    $debug_info = "punishment_id is null";
} else {
    $punishment_id = intval($punishment_id);
    if ($action == 'finish') {
        $end_date = mysqli_real_escape_string($con, $end_date);
        $statement = "update punishment set is_end=1, end_date='$end_date' where id=$punishment_id";
    } else if ($action == 'cancel_finish') {
        $punishment_id = intval($_POST['end_date']);
        $statement = "update punishment set is_end=0 where id=$punishment_id";
    } else {
        $statement = "";
    }
    $result = mysqli_query($con, $statement);
}

header('Content-Type:application/json; charset=utf-8');

// $result = mysqli_query($con, $statement);
// $punishment = mysqli_fetch_all($result, MYSQLI_ASSOC);
$debug_info = $statement;
$ret = array(
    "result" => $punishment,
    "debug" => $debug_info,
    "_POST" => $_POST,
    "_GET" => $_GET,
);

echo json_encode($ret);
mysqli_free_result($result);
mysqli_close($con);
