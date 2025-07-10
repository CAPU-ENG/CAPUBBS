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
//     "action": "add",
//     "username": "ID",
//     "name": "姓名",
//     "reason": "原因",
//     "distance": 3,
//     "addition": 1,
//     "start_date": "2027-08-01"
// }

if ($username != "组织部") {
    exit;
}


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


if ($action == 'add') {
    $id = mysqli_real_escape_string($con, $id);
    $name = mysqli_real_escape_string($con, $name);
    $reason = mysqli_real_escape_string($con, $reason);
    $distance = mysqli_real_escape_string($con, $distance);
    $addition = mysqli_real_escape_string($con, $addition);
    $start_date = mysqli_real_escape_string($con, $start_date);
    $statement = "insert into punishment (username, name, reason, distance, addition, start_date) 
        values ('$id', '$name', '$reason', '$distance', '$addition', '$start_date')";
    $result = mysqli_query($con, $statement);
    $punishment = mysqli_fetch_all($result, MYSQLI_ASSOC);
}

header('Content-Type:application/json; charset=utf-8');

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
