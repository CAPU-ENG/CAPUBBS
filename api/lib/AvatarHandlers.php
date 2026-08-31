<?php

if (!defined('AVATAR_IMAGE_MAX_UPLOAD_BYTES')) {
    define('AVATAR_IMAGE_MAX_UPLOAD_BYTES', 2 * 1024 * 1024);
}
if (!defined('AVATAR_IMAGE_MAX_SOURCE_SIZE')) {
    define('AVATAR_IMAGE_MAX_SOURCE_SIZE', 4096);
}
if (!defined('AVATAR_IMAGE_OUTPUT_SIZE')) {
    define('AVATAR_IMAGE_OUTPUT_SIZE', 320);
}
if (!defined('AVATAR_IMAGE_MAX_OUTPUT_BYTES')) {
    define('AVATAR_IMAGE_MAX_OUTPUT_BYTES', 512 * 1024);
}

function jiekoufunc_avatar_update($con, $token, $params, $file) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }

    $use_default = isset($params['use_default']) && intval($params['use_default']) === 1;
    $has_upload = avatar_image_upload_present($file);
    if ($use_default && $has_upload) {
        return jiekoufunc_report('14', '不能同时上传头像并恢复默认头像。');
    }
    if (!$use_default && !$has_upload) {
        return jiekoufunc_report('14', '未收到可用的头像图片。');
    }

    $encoded = null;
    if (!$use_default) {
        $image_error = '';
        $encoded = avatar_image_prepare($file, $image_error);
        if ($encoded === false) {
            return jiekoufunc_report('14', $image_error ?: '头像图片处理失败。');
        }
    }

    $username = strval($user['username']);
    if (!avatar_update_lock($con, $username, true)) {
        return jiekoufunc_report('8', '头像更新繁忙，请稍后重试。');
    }

    $stored = null;
    $old_icon = avatar_current_icon($con, $username);
    if ($old_icon === false) {
        avatar_update_lock($con, $username, false);
        return jiekoufunc_report('8', '读取当前头像失败。');
    }

    $target_icon = '';
    if (!$use_default) {
        $stored = avatar_image_store($username, $encoded);
        if ($stored === false) {
            avatar_update_lock($con, $username, false);
            return jiekoufunc_report('8', '头像图片保存失败。');
        }
        $target_icon = $stored['public_path'];
    }

    $username_escaped = mysqli_real_escape_string($con, $username);
    $target_escaped = mysqli_real_escape_string($con, $target_icon);
    $updated = mysqli_query(
        $con,
        "UPDATE userinfo SET icon='$target_escaped' WHERE username='$username_escaped' LIMIT 1"
    );
    if (!$updated) {
        if ($stored && $stored['created']) {
            @unlink($stored['absolute_path']);
        }
        avatar_update_lock($con, $username, false);
        return jiekoufunc_report('8', '保存头像资料失败。');
    }

    if ($old_icon !== $target_icon) {
        avatar_delete_legacy_upload_if_unreferenced($con, $old_icon);
    }
    avatar_cleanup_user_directory($username, $target_icon);
    avatar_update_lock($con, $username, false);

    return array(array('code' => '0'), array(
        'icon' => $target_icon,
    ));
}

function avatar_image_upload_present($file) {
    return is_array($file)
        && isset($file['error'])
        && intval($file['error']) !== UPLOAD_ERR_NO_FILE;
}

function avatar_image_prepare($file, &$error) {
    $error = '';
    if (!is_array($file) || !isset($file['error']) || intval($file['error']) !== UPLOAD_ERR_OK) {
        $error = '未收到可用的头像图片。';
        return false;
    }
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        $error = '头像图片上传无效。';
        return false;
    }

    $uploaded_size = isset($file['size']) ? intval($file['size']) : 0;
    if ($uploaded_size <= 0 || $uploaded_size > AVATAR_IMAGE_MAX_UPLOAD_BYTES) {
        $error = '头像图片必须小于 2 MiB。';
        return false;
    }

    $image_info = @getimagesize($file['tmp_name']);
    if (!$image_info || intval($image_info[0]) <= 0 || intval($image_info[1]) <= 0) {
        $error = '头像图片无法识别。';
        return false;
    }
    if (intval($image_info[0]) !== intval($image_info[1])) {
        $error = '头像图片必须是方形裁剪结果。';
        return false;
    }
    if (intval($image_info[0]) < 64 || intval($image_info[0]) > AVATAR_IMAGE_MAX_SOURCE_SIZE) {
        $error = '头像图片尺寸必须在 64 至 4096 像素之间。';
        return false;
    }

    $mime = avatar_image_detect_mime($file['tmp_name']);
    if (!in_array($mime, array('image/jpeg', 'image/png', 'image/webp'), true)) {
        $error = '仅支持 JPEG、PNG 或 WebP 头像图片。';
        return false;
    }
    if (!function_exists('imagecreatefromstring') || !function_exists('imagewebp')) {
        $error = '服务器缺少头像图片处理组件。';
        return false;
    }

    $source_bytes = @file_get_contents($file['tmp_name']);
    $source = $source_bytes === false ? false : @imagecreatefromstring($source_bytes);
    if (!$source) {
        $error = '头像图片无法解码。';
        return false;
    }

    $output = imagecreatetruecolor(AVATAR_IMAGE_OUTPUT_SIZE, AVATAR_IMAGE_OUTPUT_SIZE);
    if (!$output) {
        avatar_image_release($source);
        $error = '头像图片处理失败。';
        return false;
    }
    imagealphablending($output, false);
    imagesavealpha($output, true);
    $transparent = imagecolorallocatealpha($output, 0, 0, 0, 127);
    imagefilledrectangle(
        $output,
        0,
        0,
        AVATAR_IMAGE_OUTPUT_SIZE,
        AVATAR_IMAGE_OUTPUT_SIZE,
        $transparent
    );
    imagecopyresampled(
        $output,
        $source,
        0,
        0,
        0,
        0,
        AVATAR_IMAGE_OUTPUT_SIZE,
        AVATAR_IMAGE_OUTPUT_SIZE,
        imagesx($source),
        imagesy($source)
    );
    avatar_image_release($source);

    $encoded = false;
    foreach (array(88, 82, 76, 70, 64, 58, 52, 46, 40) as $quality) {
        ob_start();
        $success = imagewebp($output, null, $quality);
        $bytes = ob_get_clean();
        if ($success && is_string($bytes) && strlen($bytes) <= AVATAR_IMAGE_MAX_OUTPUT_BYTES) {
            $encoded = $bytes;
            break;
        }
    }
    avatar_image_release($output);

    if ($encoded === false) {
        $error = '头像图片无法压缩到指定大小。';
        return false;
    }
    return $encoded;
}

function avatar_image_detect_mime($path) {
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $mime = finfo_file($finfo, $path);
            if (PHP_VERSION_ID < 80500) {
                finfo_close($finfo);
            }
            if (is_string($mime)) {
                return strtolower($mime);
            }
        }
    }
    $info = @getimagesize($path);
    return $info && isset($info['mime']) ? strtolower(strval($info['mime'])) : '';
}

function avatar_image_store($username, $encoded) {
    $user_hash = hash('sha256', $username);
    $content_hash = substr(hash('sha256', $encoded), 0, 24);
    $relative_directory = '/bbsimg/icons/user_upload/' . $user_hash;
    $public_path = $relative_directory . '/avatar-' . $content_hash . '.webp';
    $absolute_directory = dirname(__DIR__, 2) . $relative_directory;
    $absolute_path = dirname(__DIR__, 2) . $public_path;

    if (!is_dir($absolute_directory) && !@mkdir($absolute_directory, 0755, true)) {
        return false;
    }
    if (is_file($absolute_path)) {
        return array(
            'absolute_path' => $absolute_path,
            'created' => false,
            'public_path' => $public_path,
        );
    }

    try {
        $temporary_path = $absolute_directory . '/.' . bin2hex(random_bytes(12)) . '.tmp';
    } catch (Exception $error) {
        return false;
    }
    $written = @file_put_contents($temporary_path, $encoded, LOCK_EX);
    if ($written !== strlen($encoded) || !@rename($temporary_path, $absolute_path)) {
        @unlink($temporary_path);
        return false;
    }

    return array(
        'absolute_path' => $absolute_path,
        'created' => true,
        'public_path' => $public_path,
    );
}

function avatar_current_icon($con, $username) {
    $username_escaped = mysqli_real_escape_string($con, $username);
    $result = mysqli_query(
        $con,
        "SELECT icon FROM userinfo WHERE username='$username_escaped' LIMIT 1"
    );
    if (!$result) {
        return false;
    }
    $row = mysqli_fetch_assoc($result);
    return $row ? trim(strval($row['icon'])) : false;
}

function avatar_update_lock($con, $username, $acquire) {
    $lock_name = 'capubbs_avatar_' . substr(hash('sha256', $username), 0, 40);
    $lock_escaped = mysqli_real_escape_string($con, $lock_name);
    $statement = $acquire
        ? "SELECT GET_LOCK('$lock_escaped', 5) AS lock_state"
        : "SELECT RELEASE_LOCK('$lock_escaped') AS lock_state";
    $result = mysqli_query($con, $statement);
    if (!$result) {
        return false;
    }
    $row = mysqli_fetch_assoc($result);
    return !$acquire || ($row && intval($row['lock_state']) === 1);
}

function avatar_cleanup_user_directory($username, $current_icon) {
    $user_hash = hash('sha256', $username);
    $relative_directory = '/bbsimg/icons/user_upload/' . $user_hash . '/';
    $absolute_directory = dirname(__DIR__, 2) . rtrim($relative_directory, '/');
    if (!is_dir($absolute_directory)) {
        return;
    }

    $preserve = '';
    if (strpos($current_icon, $relative_directory) === 0
        && basename($current_icon) === substr($current_icon, strlen($relative_directory))) {
        $preserve = basename($current_icon);
    }
    $entries = @scandir($absolute_directory);
    if (!is_array($entries)) {
        return;
    }
    foreach ($entries as $entry) {
        if ($entry === $preserve || !preg_match('/^avatar-[a-f0-9]{24}\.webp$/', $entry)) {
            continue;
        }
        $absolute_path = $absolute_directory . '/' . $entry;
        if (is_file($absolute_path)) {
            @unlink($absolute_path);
        }
    }
    if ($preserve === '') {
        @rmdir($absolute_directory);
    }
}

function avatar_delete_legacy_upload_if_unreferenced($con, $icon) {
    $resolved = avatar_legacy_upload_path($icon);
    if ($resolved === null) {
        return;
    }

    $conditions = array();
    foreach ($resolved['aliases'] as $alias) {
        $conditions[] = "icon='" . mysqli_real_escape_string($con, $alias) . "'";
    }
    $result = mysqli_query(
        $con,
        'SELECT 1 FROM userinfo WHERE ' . implode(' OR ', $conditions) . ' LIMIT 1'
    );
    if (!$result || mysqli_fetch_assoc($result)) {
        return;
    }
    if (is_file($resolved['absolute_path'])) {
        @unlink($resolved['absolute_path']);
    }
}

function avatar_legacy_upload_path($icon) {
    $path = trim(strval($icon));
    $path = preg_replace('#^/?bbsimg/icons/#', '', $path);
    if (preg_match('#^user_upload_by_day/(\d{4})/(\d{2})/([a-f0-9]{40}\.png)$#', $path)) {
        $relative = $path;
    } elseif (preg_match(
        '#^user_upload/((?:[a-f0-9]{40}|\d{1,9})\.(?:png|jpe?g|gif|webp))$#',
        $path
    )) {
        $relative = $path;
    } else {
        return null;
    }

    return array(
        'absolute_path' => dirname(__DIR__, 2) . '/bbsimg/icons/' . $relative,
        'aliases' => array(
            $relative,
            'bbsimg/icons/' . $relative,
            '/bbsimg/icons/' . $relative,
        ),
    );
}

function avatar_image_release($image) {
    if (PHP_VERSION_ID < 80500 && function_exists('imagedestroy')) {
        imagedestroy($image);
    }
}
