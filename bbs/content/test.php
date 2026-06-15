<?php
    include("../lib/mainfunc.php");
    header('content-type: application/json');

    // 登录检查
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");
    $user = checkuser_con($con);
    $username = isset($user["username"]) ? $user["username"] : '';
    if ($username == "") {
        http_response_code(401);
        echo "请先登录再上传图片";
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
                    http_response_code(403);
                    echo "您暂时不能上传图片（邮箱未验证）。请先验证邮箱或联系管理员。";
                    exit;
                }
            }
            if (CAPUBBS_ENABLE_EMAIL_MUTE) {
                $mail = $user_check['mail'];
                if ($mail) {
                    $mail_esc = mysqli_real_escape_string($con, $mail);
                    $mute_check = mysqli_fetch_array(mysqli_query($con,
                        "SELECT COUNT(*) as cnt FROM email_mutes WHERE email='$mail_esc' AND active=1"));
                    if ($mute_check && intval($mute_check['cnt']) > 0) {
                        http_response_code(403);
                        echo "您暂时不能上传图片（邮箱已被管理员禁言）。请先验证邮箱或联系管理员。";
                        exit;
                    }
                }
            }
        }
    }

    if (!@$_FILES['image']) exit;

    // 检查上传错误
    if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo "上传出错，错误码: " . $_FILES['image']['error'];
        exit;
    }

    // 验证文件是否为真实图片
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo) {
        $mime = finfo_file($finfo, $_FILES['image']['tmp_name']);
        finfo_close($finfo);
        $allowed = array('image/png', 'image/jpeg', 'image/gif', 'image/webp');
        if (!in_array($mime, $allowed, true)) {
            http_response_code(400);
            echo "不支持的文件类型";
            exit;
        }
    }

    // 二次验证：用 getimagesize 确保是有效的图片文件
    $imageInfo = @getimagesize($_FILES['image']['tmp_name']);
    if ($imageInfo === false) {
        http_response_code(400);
        echo "无法识别的图片格式";
        exit;
    }

    $name = $_FILES['image']['name'];
    $extension=get_extension($name);
    if (strcasecmp($extension, "HEIC") === 0) {
        http_response_code(400);
        echo "不支持的图片格式（HEIC）";
        exit;
    }

    // 按日期分文件夹：bbs/images/YYYY/MM/
    $datePath = date('Y') . '/' . date('m') . '/';
    $folder = '../images/' . $datePath;
    $urlPath = '/bbs/images/' . $datePath;
    if (!is_dir($folder)) {
        if (!mkdir($folder, 0755, true)) {
            http_response_code(500);
            echo "服务器错误：无法创建目录";
            exit;
        }
    }

    // 生成唯一随机文件名，避免覆盖已有文件
    $maxRetries = 10;
    do {
        $filename = sha1(microtime() . uniqid('', true) . $name . mt_rand()) . '.' . $extension;
        $maxRetries--;
    } while (file_exists($folder . $filename) && $maxRetries > 0);

    if ($maxRetries <= 0 && file_exists($folder . $filename)) {
        http_response_code(500);
        echo "服务器错误：文件名冲突，请重试";
        exit;
    }

    $target = $folder . $filename;
    if (!move_uploaded_file($_FILES["image"]["tmp_name"], $target)) {
        http_response_code(500);
        echo "服务器错误：文件保存失败";
        exit;
    }

    function get_extension($file){
        return substr(strrchr($file, '.'), 1);
    }
    // CreateThumbnail($target,1920,1920);
    $result=array("upload"=> array("links"=> array("original"=> $urlPath . $filename)));
    echo(json_encode($result));

    function CreateThumbnail($srcFile, $toW, $toH, $toFile="")
    {
        if ($toFile == "")
        {
            $toFile = $srcFile;
        }
        $info = "";
        //返回含有4个单元的数组，0-宽，1-高，2-图像类型，3-宽高的文本描述。
        //失败返回false并产生警告。
        $data = getimagesize($srcFile, $info);
        if (!$data)
            return false;

        //将文件载入到资源变量im中
        switch ($data[2]) //1-GIF，2-JPG，3-PNG
        {
        case 1:
            if(!function_exists("imagecreatefromgif"))
            {
                echo "the GD can't support .gif, please use .jpeg or .png! <a href='javascript:history.back();'>back</a>";
                exit();
            }
            $im = imagecreatefromgif($srcFile);
            break;

        case 2:
            if(!function_exists("imagecreatefromjpeg"))
            {
                echo "the GD can't support .jpeg, please use other picture! <a href='javascript:history.back();'>back</a>";
                exit();
            }
            $im = imagecreatefromjpeg($srcFile);
            break;

        case 3:
            $im = imagecreatefrompng($srcFile);
            break;
        }

        //计算缩略图的宽高
        $srcW = imagesx($im);
        $srcH = imagesy($im);
        $toWH = $toW / $toH;
        $srcWH = $srcW / $srcH;
        if ($toWH <= $srcWH)
        {
            $ftoW = $toW;
            $ftoH = (int)($ftoW * ($srcH / $srcW));
        }
        else
        {
            $ftoH = $toH;
            $ftoW = (int)($ftoH * ($srcW / $srcH));
        }

        if (function_exists("imagecreatetruecolor"))
        {
            $ni = imagecreatetruecolor($ftoW, $ftoH); //新建一个真彩色图像
            if ($ni)
            {
                //重采样拷贝部分图像并调整大小 可保持较好的清晰度
                imagecopyresampled($ni, $im, 0, 0, 0, 0, $ftoW, $ftoH, $srcW, $srcH);
            }
            else
            {
                //拷贝部分图像并调整大小
                $ni = imagecreate($ftoW, $ftoH);
                imagecopyresized($ni, $im, 0, 0, 0, 0, $ftoW, $ftoH, $srcW, $srcH);
            }
        }
        else
        {
            $ni = imagecreate($ftoW, $ftoH);
            imagecopyresized($ni, $im, 0, 0, 0, 0, $ftoW, $ftoH, $srcW, $srcH);
        }

        //保存到文件 统一为.png格式
        $suc= imagejpeg($ni, $toFile); //以 PNG 格式将图像输出到浏览器或文件
        ImageDestroy($ni);
        ImageDestroy($im);
        return true;
    }
?>
