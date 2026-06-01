<?php
    include("../lib/mainfunc.php");
    $maxsize = 2; //Mb
    header('content-type: application/json');

    function reportWithCode($code, $msg = ''){
        $result = array("code" => $code, "msg" => $msg);
        echo(json_encode($result));
        exit();
    }

    // 认证检查
    $user = getuser();
    if ($user['username'] == '') {
        reportWithCode(2, '请先登录');
    }

    if (!isset($_FILES['file'])) {
        reportWithCode(1, '未收到文件');
    }

    // 检查上传错误
    if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        reportWithCode(1, '上传出错，错误码: ' . $_FILES['file']['error']);
    }

    // 检查文件大小（修复原 ! 运算符优先级 bug）
    if ($_FILES['file']['size'] > ($maxsize * 1048576)) {
        reportWithCode(1, '文件超过 ' . $maxsize . 'MB 限制');
    }

    // 验证文件是否为真实图片
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo) {
        $mime = finfo_file($finfo, $_FILES['file']['tmp_name']);
        finfo_close($finfo);
        $allowed = array('image/png', 'image/jpeg', 'image/gif', 'image/webp');
        if (!in_array($mime, $allowed, true)) {
            reportWithCode(1, '不支持的文件类型');
        }
    }

    // 二次验证：用 getimagesize 确保是有效的图片文件
    $imageInfo = @getimagesize($_FILES['file']['tmp_name']);
    if ($imageInfo === false) {
        reportWithCode(1, '无法识别的图片格式');
    }

    $folder = '../../bbsimg/icons/user_upload/';
    $urlroot = 'user_upload/';
    if (!is_dir($folder)) {
        if (!mkdir($folder, 0755, true)) {
            reportWithCode(2, '服务器错误：无法创建目录');
        }
    }

    // 生成唯一随机文件名，避免覆盖已有文件
    $maxRetries = 10;
    do {
        $filename = sha1(microtime() . uniqid('', true) . $_FILES['file']['name'] . mt_rand()) . '.png';
        $maxRetries--;
    } while (file_exists($folder . $filename) && $maxRetries > 0);

    if ($maxRetries <= 0 && file_exists($folder . $filename)) {
        reportWithCode(2, '服务器错误：文件名冲突，请重试');
    }

    if (!move_uploaded_file($_FILES['file']['tmp_name'], $folder . $filename)) {
        reportWithCode(2, '服务器错误：文件保存失败');
    }

    echo(json_encode(array("code" => 0, "url" => $urlroot . $filename, "msg" => '')));
?>
