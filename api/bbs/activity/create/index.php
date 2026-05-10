<?php
require_once "../../../../bbs/lib/mainfunc.php";
require_once '../../../../lib.php';
require_once '../../../../bbs/content/utils/activityService.php';

$con = dbconnect_mysqli();
$user = checkuser_con($con);
$username = $user["username"] ?? '';

if ($username == "") {
    header('Content-Type:application/json; charset=utf-8');
    echo json_encode(array("code"=> -1, "msg"=> "未登录"));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    header('Content-Type:application/json; charset=utf-8');
    echo json_encode(array("code"=> -1, "msg"=> "仅支持POST"));
    exit;
}

$bid = intval(@$_POST['bid']);
$title = @$_POST['title'] ?: '';
$text = @$_POST['text'] ?: '';
$sig = intval(@$_POST['sig']);
$attachs = @$_POST['attachs'] ?: '';
$options_json = @$_POST['options'] ?: '[]';
$options = json_decode($options_json, true);

if (empty($bid) || empty($title) || empty($text)) {
    header('Content-Type:application/json; charset=utf-8');
    echo json_encode(array("code"=> -1, "msg"=> "参数不完整"));
    exit;
}

if (!is_array($options)) {
    $options = array();
}

createActivity($username, $bid, $title, $text, $options, $sig, $attachs);

header('Content-Type:application/json; charset=utf-8');
echo json_encode(array("code"=> 0, "msg"=> "success"));
