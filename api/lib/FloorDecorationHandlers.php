<?php

if (!defined('FLOOR_DECORATION_MAX_BYTES')) {
    define('FLOOR_DECORATION_MAX_BYTES', 64 * 1024);
}
if (!defined('FLOOR_DECORATION_OUTPUT_SIZE')) {
    define('FLOOR_DECORATION_OUTPUT_SIZE', 320);
}

function jiekoufunc_floor_decoration_upload($con, $token, $params, $file) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }

    $variant = floor_decoration_variant($params);
    if ($variant === '') {
        return jiekoufunc_report('14', '装饰类型必须为 light 或 dark。');
    }
    if (!is_array($file) || !isset($file['error']) || intval($file['error']) !== UPLOAD_ERR_OK) {
        return jiekoufunc_report('14', '未收到可用的装饰图片。');
    }
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return jiekoufunc_report('14', '装饰图片上传无效。');
    }

    $uploaded_size = isset($file['size']) ? intval($file['size']) : 0;
    if ($uploaded_size <= 0 || $uploaded_size >= FLOOR_DECORATION_MAX_BYTES) {
        return jiekoufunc_report('14', '装饰图片必须小于 64 KB。');
    }

    $image_info = @getimagesize($file['tmp_name']);
    if (!$image_info || intval($image_info[0]) <= 0 || intval($image_info[0]) !== intval($image_info[1])) {
        return jiekoufunc_report('14', '装饰图片必须是方形图片。');
    }
    if (intval($image_info[0]) > 4096) {
        return jiekoufunc_report('14', '装饰图片尺寸过大。');
    }

    $mime = floor_decoration_detect_mime($file['tmp_name']);
    if (!in_array($mime, array('image/jpeg', 'image/png', 'image/webp'), true)) {
        return jiekoufunc_report('14', '仅支持 JPEG、PNG 或 WebP 图片。');
    }

    $encoded = floor_decoration_reencode($file['tmp_name']);
    if ($encoded === false) {
        return jiekoufunc_report('14', '装饰图片无法处理或压缩至 64 KB 以下。');
    }

    $username = strval($user['username']);
    $user_hash = hash('sha256', $username);
    $content_hash = substr(hash('sha256', $encoded), 0, 24);
    $relative_directory = '/bbsimg/floor-decorations/' . $user_hash;
    $public_path = $relative_directory . '/' . $variant . '-' . $content_hash . '.webp';
    $absolute_directory = dirname(dirname(__DIR__)) . $relative_directory;
    $absolute_path = dirname(dirname(__DIR__)) . $public_path;

    if (!is_dir($absolute_directory) && !@mkdir($absolute_directory, 0755, true)) {
        return jiekoufunc_report('8', '无法创建装饰图片目录。');
    }
    if (@file_put_contents($absolute_path, $encoded, LOCK_EX) === false) {
        return jiekoufunc_report('8', '装饰图片保存失败。');
    }

    $old_decoration = floor_decoration_query_for_username($con, $username);
    $column = $variant === 'light' ? 'light_image_path' : 'dark_image_path';
    $username_escaped = mysqli_real_escape_string($con, $username);
    $path_escaped = mysqli_real_escape_string($con, $public_path);
    $statement = "INSERT INTO user_floor_decoration (username, $column)
        VALUES ('$username_escaped', '$path_escaped')
        ON DUPLICATE KEY UPDATE $column=VALUES($column)";
    if (!mysqli_query($con, $statement)) {
        @unlink($absolute_path);
        return jiekoufunc_report('8', '楼层装饰功能尚未完成数据库初始化。');
    }

    $old_path = $variant === 'light'
        ? $old_decoration['lightImagePath']
        : $old_decoration['darkImagePath'];
    if ($old_path && $old_path !== $public_path) {
        floor_decoration_delete_owned_file($username, $old_path);
    }

    $decoration = floor_decoration_query_for_username($con, $username);
    return array(array('code' => '0'), array('floorDecoration' => $decoration));
}

function jiekoufunc_floor_decoration_delete($con, $token, $params) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }

    $variant = floor_decoration_variant($params);
    if ($variant === '') {
        return jiekoufunc_report('14', '装饰类型必须为 light 或 dark。');
    }

    $username = strval($user['username']);
    $decoration = floor_decoration_query_for_username($con, $username);
    $old_path = $variant === 'light'
        ? $decoration['lightImagePath']
        : $decoration['darkImagePath'];
    $column = $variant === 'light' ? 'light_image_path' : 'dark_image_path';
    $username_escaped = mysqli_real_escape_string($con, $username);

    if (!mysqli_query($con, "UPDATE user_floor_decoration SET $column=NULL WHERE username='$username_escaped'")) {
        return jiekoufunc_report('8', '楼层装饰功能尚未完成数据库初始化。');
    }
    mysqli_query($con,
        "DELETE FROM user_floor_decoration
         WHERE username='$username_escaped' AND light_image_path IS NULL AND dark_image_path IS NULL");

    if ($old_path) {
        floor_decoration_delete_owned_file($username, $old_path);
    }

    return array(array('code' => '0'), array(
        'floorDecoration' => floor_decoration_query_for_username($con, $username),
    ));
}

function floor_decoration_query_for_username($con, $username) {
    $decorations = floor_decoration_query_by_usernames($con, array($username));
    return isset($decorations[$username])
        ? $decorations[$username]
        : floor_decoration_empty();
}

function floor_decoration_query_by_usernames($con, $usernames) {
    $requested = array();
    foreach ($usernames as $username) {
        $username = strval($username);
        if ($username !== '') {
            $requested[$username] = floor_decoration_empty();
        }
    }
    if (count($requested) === 0) {
        return array();
    }

    $escaped = array();
    foreach (array_keys($requested) as $username) {
        $escaped[] = "'" . mysqli_real_escape_string($con, $username) . "'";
    }
    $result = mysqli_query($con,
        'SELECT username, light_image_path, dark_image_path FROM user_floor_decoration'
        . ' WHERE username IN (' . implode(',', $escaped) . ')');
    if (!$result) {
        return $requested;
    }

    while ($row = mysqli_fetch_assoc($result)) {
        $username = strval($row['username']);
        $requested[$username] = array(
            'lightImagePath' => floor_decoration_nullable_path($row['light_image_path']),
            'darkImagePath' => floor_decoration_nullable_path($row['dark_image_path']),
        );
    }
    return $requested;
}

function floor_decoration_empty() {
    return array('lightImagePath' => null, 'darkImagePath' => null);
}

function floor_decoration_variant($params) {
    $variant = isset($params['variant']) ? strtolower(trim(strval($params['variant']))) : '';
    return $variant === 'light' || $variant === 'dark' ? $variant : '';
}

function floor_decoration_nullable_path($value) {
    $path = trim(strval($value));
    return $path === '' ? null : $path;
}

function floor_decoration_detect_mime($path) {
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $mime = finfo_file($finfo, $path);
            finfo_close($finfo);
            if (is_string($mime)) {
                return strtolower($mime);
            }
        }
    }
    $info = @getimagesize($path);
    return $info && isset($info['mime']) ? strtolower(strval($info['mime'])) : '';
}

function floor_decoration_reencode($path) {
    if (!function_exists('imagecreatefromstring') || !function_exists('imagewebp')) {
        return false;
    }
    $source_bytes = @file_get_contents($path);
    $source = $source_bytes === false ? false : @imagecreatefromstring($source_bytes);
    if (!$source) {
        return false;
    }

    $output = imagecreatetruecolor(FLOOR_DECORATION_OUTPUT_SIZE, FLOOR_DECORATION_OUTPUT_SIZE);
    if (!$output) {
        floor_decoration_release_image($source);
        return false;
    }
    imagealphablending($output, false);
    imagesavealpha($output, true);
    $transparent = imagecolorallocatealpha($output, 0, 0, 0, 127);
    imagefilledrectangle($output, 0, 0, FLOOR_DECORATION_OUTPUT_SIZE, FLOOR_DECORATION_OUTPUT_SIZE, $transparent);
    imagecopyresampled(
        $output,
        $source,
        0,
        0,
        0,
        0,
        FLOOR_DECORATION_OUTPUT_SIZE,
        FLOOR_DECORATION_OUTPUT_SIZE,
        imagesx($source),
        imagesy($source)
    );
    floor_decoration_release_image($source);

    $encoded = false;
    foreach (array(82, 74, 66, 58, 50, 42, 34) as $quality) {
        ob_start();
        $success = imagewebp($output, null, $quality);
        $bytes = ob_get_clean();
        if ($success && is_string($bytes) && strlen($bytes) < FLOOR_DECORATION_MAX_BYTES) {
            $encoded = $bytes;
            break;
        }
    }
    floor_decoration_release_image($output);
    return $encoded;
}

function floor_decoration_release_image($image) {
    if (PHP_VERSION_ID < 80500 && function_exists('imagedestroy')) {
        imagedestroy($image);
    }
}

function floor_decoration_delete_owned_file($username, $public_path) {
    $user_hash = hash('sha256', $username);
    $relative_directory = '/bbsimg/floor-decorations/' . $user_hash . '/';
    if (strpos($public_path, $relative_directory) !== 0 || basename($public_path) !== substr($public_path, strlen($relative_directory))) {
        return;
    }
    $absolute_path = dirname(dirname(__DIR__)) . $public_path;
    if (is_file($absolute_path)) {
        @unlink($absolute_path);
    }
}
