<?php
    require_once __DIR__ . '/../../lib.php';
    require_once __DIR__ . '/../../src/Bootstrap.php';
    require_once __DIR__ . '/../../bbs/lib/mainfunc.php';

    $ask = @$_POST['ask'];
    date_default_timezone_set("Asia/Shanghai");
    if ($ask == "getfilesize") getfilesize();
    if ($ask == "loadcalendar") loadcalendar();
    if ($ask == "savecalendar") savecalendar();
    if ($ask == "addinform") addinform();
    if ($ask == "delinform") delinform();
    if ($ask == "saveimg") saveimg();
    if ($ask == "login") login();
    if ($ask == "add_download") adddownload();
    if ($ask == "edit_download") editdownload();
    if ($ask == "del_download") deldownload();

    function trans($x) {
        return "<![CDATA[".$x."]]>";
    }

    function loadcalendar() {
        $con = dbconnect_mysqli();
        $results = capubbs_mainpage_service($con)->legacyLoadCalendar($_POST);
        header('Content-type: application/xml;charset:UTF-8');
        echo '<capu>';
        foreach ($results as $res) {
            echo '<data>';
            foreach ($res as $key => $value) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo '</data>';
        }

        echo '</capu>';
        exit;
    }

    function savecalendar() {
        $con = dbconnect_mysqli();
        $result = capubbs_mainpage_service($con)->legacySaveCalendar(@$_COOKIE['token'], $_POST);
        echo mainpage_plain_code($result);
        exit;
    }

    function saveimg() {
        $con = dbconnect_mysqli();
        $result = capubbs_mainpage_service($con)->legacySaveImages(@$_COOKIE['token'], $_POST);
        echo mainpage_plain_code($result);
        exit;
    }

    function getfilesize() {
        $con = dbconnect_mysqli();
        $result = capubbs_mainpage_service($con)->legacyGetFilesize($_POST);
        echo isset($result[1]['size']) ? $result[1]['size'] : 0;
        exit;
    }

    function addinform() {
        $con = dbconnect_mysqli();
        $result = capubbs_mainpage_service($con)->legacyAddInform(@$_COOKIE['token'], $_POST);
        echo mainpage_plain_code($result);
        exit;
    }

    function delinform() {
        $con = dbconnect_mysqli();
        $result = capubbs_mainpage_service($con)->legacyDeleteInform(@$_COOKIE['token'], $_POST);
        echo mainpage_plain_code($result);
        exit;
    }


    function login() {
        $username = @$_POST['username'];
        $password = @$_POST['password'];
        $result = mainfunc(array(
            "ask" => "login",
            "username" => $username,
            "password" => $password,
            "onlinetype" => "web",
            "browser" => @$_SERVER['HTTP_USER_AGENT']
        ));
        $result = $result[0];
        $code = (int)$result['code'];
        $token = $result['token'];
        if ($code == 0) {
            $time = time() + 99999;
            $date = date("D, d M Y H:i:s", $time)." GMT";
            header('Set-cookie: token='.$token.'; domain=.'.CAPUBBS_HOST.'; expires='.$date.'; path=/'."\n");
        }
        echo $code;
        exit;
    }


    function adddownload() {
        $con = dbconnect_mysqli();
        $result = capubbs_mainpage_service($con)->legacyAddDownload(@$_COOKIE['token'], $_POST);
        echo mainpage_plain_code($result);
        exit;
    }

    function editdownload() {
        $con = dbconnect_mysqli();
        $result = capubbs_mainpage_service($con)->legacyEditDownload(@$_COOKIE['token'], $_POST);
        echo mainpage_plain_code($result);
        exit;
    }

    function deldownload() {
        $con = dbconnect_mysqli();
        $result = capubbs_mainpage_service($con)->legacyDeleteDownload(@$_COOKIE['token'], $_POST);
        echo mainpage_plain_code($result);
        exit;
    }

    function mainpage_plain_code($result) {
        $code = isset($result[0]['code']) ? strval($result[0]['code']) : '0';
        if ($code === '8' && isset($result[0]['msg']) && preg_match('/Database error:\\s*(\\d+)/', $result[0]['msg'], $matches)) {
            return $matches[1];
        }
        return $code;
    }
?>
