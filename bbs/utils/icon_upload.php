<?php
    include("../lib/mainfunc.php");
    $maxsize = 2; //Mb
    header('content-type: application/json');

    function reportWithCode($code, $msg = ''){
        $result = array("code" => $code, "msg" => $msg);
        echo(json_encode($result));
        exit();
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
    $mime = capubbs_detect_image_mime($_FILES['file']['tmp_name']);
    $allowed = array('image/png', 'image/jpeg', 'image/gif', 'image/webp');
    if ($mime !== '' && !in_array($mime, $allowed, true)) {
        reportWithCode(1, '不支持的文件类型');
    }

    // 二次验证：读取图片尺寸，兼容 PHP 5.6 无法识别 WebP 的情况
    $imageInfo = capubbs_get_image_size($_FILES['file']['tmp_name']);
    if ($imageInfo === false) {
        reportWithCode(1, '无法识别的图片格式');
    }

    $datePath = date('Y') . '/' . date('m') . '/';
    $folder = '../../bbsimg/icons/user_upload_by_day/' . $datePath;
    $urlroot = 'user_upload_by_day/' . $datePath;
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
