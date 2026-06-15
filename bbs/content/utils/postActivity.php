<?php
require_once "../../lib/mainfunc.php";
require_once "activityService.php";
require_once '../../../lib.php';

$GLOBALS['validtime']=1800;
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo json_encode(array("code"=> -1,"msg"=> "error"));
    exit();
}

$con = dbconnect_mysqli();
mysqli_select_db($con, "capubbs");

if (!isset($_POST["data"]) || !is_array($_POST["data"])) {
    echo json_encode(array("code"=> -1,"msg"=> "invalid request"));
    exit();
}

$user = getuser();
$username = $user['username'];
$data = $_POST["data"];
if (!isset($data["bid"], $data["tid"], $data["action"])) {
    echo json_encode(array("code"=> -1,"msg"=> "missing parameters"));
    exit();
}
$bid = intval($data["bid"]);
$tid = intval($data["tid"]);
$title = isset($data["title"]) ? $data["title"] : '';
$action = $data["action"];
$option_values = isset($data["option_values"]) ? $data["option_values"] : array();
$sig = isset($option_values["sign"]) ? $option_values["sign"] : 0;
$token = isset($_COOKIE['token']) ? $_COOKIE['token'] : '';
$type = isset($_REQUEST['type']) ? $_REQUEST['type'] : '';
$ip = isset($_SERVER["REMOTE_ADDR"]) ? $_SERVER["REMOTE_ADDR"] : '';

$activityService = capubbs_activity_service($con);
$activity = $activityService->getActivity($bid, $tid);
if (empty($activity)) {
    echo json_encode(array("code"=> -1,"msg"=> "activity not found"));
    exit();
}

$thread = $activityService->getThreadState($bid, $tid);
if (!$thread) {
    echo json_encode(array("code"=> -1,"msg"=> "主题不存在"));
    exit;
}

if (intval(isset($thread['locked']) ? $thread['locked'] : 0) === 1) {
    echo json_encode(array("code"=> -1,"msg"=> "主题已锁定"));
    exit;
}

if ($action == "join") {
    $ret = $activityService->joinActivityByContent($token, $bid, $tid, $username, $option_values, $title, $sig, $type, $ip);
    echo json_encode($ret ? $ret : array("code"=> -1,"msg"=> "error"));
    exit();
} else if ($action == "modify") {
    $ret = $activityService->modifyJoinActivityByContent($token, $bid, $tid, $username, $option_values, $title, $sig, $type, $ip);
    echo json_encode($ret ? $ret : array("code"=> -1,"msg"=> "error"));
    exit();
} else if ($action == "cancel") {
    $ret = $activityService->cancelJoinActivityByContent($token, $bid, $tid, $username, $title, 0, $type, $ip, true);
    echo json_encode($ret ? $ret : array("code"=> -1,"msg"=> "error"));
    exit();
} else if ($action == "restore") {
    $ret = $activityService->cancelJoinActivityByContent($token, $bid, $tid, $username, $title, 0, $type, $ip, false);
    echo json_encode($ret ? $ret : array("code"=> -1,"msg"=> "error"));
    exit();
}

echo json_encode(array("code"=> -1,"msg"=> "unknown action"));
