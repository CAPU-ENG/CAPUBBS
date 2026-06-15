<?php
require_once "../../../../bbs/lib/mainfunc.php";
require_once '../../../../lib.php';
require_once '../../../../bbs/content/utils/activityService.php';

$con = dbconnect_mysqli();
$user = checkuser_con($con);
$username = isset($user["username"]) ? $user["username"] : '';

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

// 邮箱验证禁言检查（与普通发帖对齐）
if (CAPUBBS_ENABLE_POST_CONTROL) {
    $username_esc = mysqli_real_escape_string($con, $username);
    $user_check = mysqli_fetch_array(mysqli_query($con,
        "SELECT verified, post, reply, mail FROM userinfo WHERE username='$username_esc'"));
    if ($user_check) {
        if (intval($user_check['verified']) === 0) {
            if ((intval($user_check['post']) + intval($user_check['reply'])) <= 20) {
                if (intval($bid) !== 28) {
                    header('Content-Type:application/json; charset=utf-8');
                    echo json_encode(array("code"=> -1, "msg"=> "您暂时不能发帖（邮箱未验证）。请先验证邮箱或联系管理员。"));
                    exit;
                }
            }
        }
        if (CAPUBBS_ENABLE_EMAIL_MUTE) {
            $mail = $user_check['mail'];
            if ($mail) {
                $mail_esc = mysqli_real_escape_string($con, $mail);
                $mute_check = mysqli_fetch_array(mysqli_query($con,
                    "SELECT COUNT(*) as cnt FROM email_mutes WHERE email='$mail_esc' AND active=1"));
                if ($mute_check && intval($mute_check['cnt']) > 0) {
                    header('Content-Type:application/json; charset=utf-8');
                    echo json_encode(array("code"=> -1, "msg"=> "您暂时不能发帖（邮箱已被管理员禁言）。请先验证邮箱或联系管理员。"));
                    exit;
                }
            }
        }
    }
}

// 发帖间隔检查（与普通发帖对齐）
$time = time();
$token = @$_COOKIE['token'];
$delay_res = mysqli_fetch_array(mysqli_query($con,
    "SELECT star, rights, lastpost FROM userinfo WHERE token='$token'"));
if ($delay_res) {
    $star = intval($delay_res['star']);
    $rights = intval($delay_res['rights']);
    $lastpost = intval($delay_res['lastpost']);
    $delta = ($rights >= 1 || $star >= 3) ? 15 : 180;
    if ($time - $lastpost >= 0 && $time - $lastpost <= $delta) {
        header('Content-Type:application/json; charset=utf-8');
        echo json_encode(array("code"=> -1, "msg"=> "两次发表的时间间隔不能少于{$delta}秒！"));
        exit;
    }
}

if (!is_array($options)) {
    $options = array();
}

foreach ($options as $option) {
    if (empty($option['option_name'])) {
        header('Content-Type:application/json; charset=utf-8');
        echo json_encode(array("code"=> -1, "msg"=> "问题名称不能为空"));
        exit;
    }
    $type_id = intval($option['type_id']);
    if ($type_id === 1 || $type_id === 3) {
        $cases = isset($option['cases']) ? $option['cases'] : array();
        $validCases = array();
        foreach ($cases as $case) {
            if (!empty($case['case_name'])) {
                $validCases[] = $case;
            }
        }
        if (count($validCases) < 2) {
            header('Content-Type:application/json; charset=utf-8');
            echo json_encode(array("code"=> -1, "msg"=> "「" . $option['option_name'] . "」的选项数量不能少于2个"));
            exit;
        }
    }
}

$result = createActivity($username, $bid, $title, $text, $options, $sig, $attachs);

header('Content-Type:application/json; charset=utf-8');
echo json_encode(array("code"=> 0, "msg"=> "success", "bid"=> $result["bid"], "tid"=> $result["tid"]));
