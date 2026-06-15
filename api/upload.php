<?php
    header('content-type: text/xml; charset=utf-8');
    echo '<capu><info>';

    // 检查文件是否上传成功
    if (!isset($_FILES['image'])) {
        echo '<code>6</code><msg>未收到文件</msg></info></capu>';
        exit;
    }
    if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        echo '<code>6</code><msg>上传失败。错误代码: ' . $_FILES['image']['error'] . '</msg></info></capu>';
        exit;
    }

    // 按日期分文件夹：assets/images/posters/YYYY/MM/
    $datePath = date('Y') . '/' . date('m') . '/';
    $folder = '../assets/images/posters/' . $datePath;
    $urlPath = '/assets/images/posters/' . $datePath;
    if (!is_dir($folder)) {
        if (!mkdir($folder, 0755, true)) {
            echo '<code>6</code><msg>服务器错误：无法创建目录</msg></info></capu>';
            exit;
        }
    }

    // 生成唯一随机文件名，避免覆盖已有文件
    $maxRetries = 10;
    $originalName = $_FILES['image']['name'];
    do {
        $filename = sha1(microtime() . uniqid('', true) . $originalName . mt_rand()) . '.png';
        $maxRetries--;
    } while (file_exists($folder . $filename) && $maxRetries > 0);

    if ($maxRetries <= 0 && file_exists($folder . $filename)) {
        echo '<code>6</code><msg>服务器错误：文件名冲突，请重试</msg></info></capu>';
        exit;
    }

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $folder . $filename)) {
        echo '<code>6</code><msg>保存文件失败。</msg></info></capu>';
        exit;
    }
    echo '<code>-1</code><url>http://www.chexie.net' . $urlPath . $filename . '</url></info></capu>';
    exit;
?>
