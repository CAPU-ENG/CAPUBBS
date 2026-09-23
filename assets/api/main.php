<?php
    require_once '../../lib.php';
    require_once '../../bbs/lib/mainfunc.php';

    $ask = @$_POST['ask'];
    date_default_timezone_set("Asia/Shanghai");
    if ($ask == "getfilesize") getfilesize();
    if ($ask == "loadcalendar") loadcalendar();
    if ($ask == "savecalendar") savecalendar();
    if ($ask == "addinform") addinform();
    if ($ask == "delinform") delinform();
    if ($ask == "saveimg") saveimg();
    if ($ask == "login") login();
    if (in_array($ask, array("add_download", "edit_download", "del_download"), true)) {
        http_response_code(410);
        echo '2206';
        exit;
    }

    function trans($x) {
        return "<![CDATA[".$x."]]>";
    }

    function loadcalendar() {
        require_once __DIR__ . '/../../api/lib/MainpageHandlers.php';
        $rows = mainpage_loadcalendar(dbconnect_mysqli(), $_POST);
        header('Content-type: application/xml;charset:UTF-8');
        echo '<capu>';
        foreach ($rows as $row) {
            echo '<data>';
            foreach ($row as $key => $value) {
                echo '<' . $key . '>' . htmlspecialchars(strval($value), ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</' . $key . '>';
            }
            echo '</data>';
        }
        echo '</capu>';
        exit;
    }

    function savecalendar() {
        require_once __DIR__ . '/../../api/lib/MainpageHandlers.php';
        $result = mainpage_savecalendar(dbconnect_mysqli(), $_POST);
        echo $result[0]['code'];
        exit;
    }

    function saveimg() {
        $con = dbconnect_mysqli();
        if (!isset($_COOKIE['token']) || !is_string($_COOKIE['token'])
            || preg_match('/^[a-z0-9_-]{1,256}$/iD', $_COOKIE['token']) !== 1) { echo '-18'; exit; }
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights < 3) { echo '-18'; exit; }
        mysqli_query($con, "delete from capubbs.mainpage where id=0");
        $json = @$_POST['json'];
        $de_json = json_decode($json, true);
        $count_json = count($de_json);
        usort($de_json, function($a, $b) {
            $al = (int)@$a['id'];
            $bl = (int)@$b['id'];
            return ($al > $bl) ? 1 : -1;
        });
        for ($i = 0; $i < $count_json; $i++) {
            $fld1 = mysqli_real_escape_string($con, $de_json[$i]['img']);
            $fld2 = mysqli_real_escape_string($con, $de_json[$i]['imgthumb']);
            $fld3 = mysqli_real_escape_string($con, $de_json[$i]['title']);
            $statement = "insert into capubbs.mainpage values (null,0,'$fld1','$fld2','$fld3','','')";
            mysqli_query($con, $statement);
        }
        echo mysqli_errno($con);
        mysqli_query($con, "alter table capubbs.mainpage order by number");
        exit;
    }

    function getfilesize() {
        $url = @$_POST['url'];
        $info = get_headers($url, true);
        echo $info['Content-Length'];
        exit;
    }

    function addinform() {
        $con = dbconnect_mysqli();
        if (!isset($_COOKIE['token']) || !is_string($_COOKIE['token'])
            || preg_match('/^[a-z0-9_-]{1,256}$/iD', $_COOKIE['token']) !== 1) { echo '-18'; exit; }
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights < 3) { echo '-18'; exit; }
        $title = mysqli_real_escape_string($con, @$_POST['title']);
        $url = mysqli_real_escape_string($con, @$_POST['url']);
        $time = time();
        $statement = "insert into capubbs.mainpage values (null,1,'$title','$url','$time','','')";
        mysqli_query($con, $statement);
        echo mysqli_errno($con);
        mysqli_query($con, "alter table capubbs.mainpage order by number");
        exit;
    }

    function delinform() {
        $con = dbconnect_mysqli();
        if (!isset($_COOKIE['token']) || !is_string($_COOKIE['token'])
            || preg_match('/^[a-z0-9_-]{1,256}$/iD', $_COOKIE['token']) !== 1) { echo '-18'; exit; }
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights < 3) { echo '-18'; exit; }
        $time = (int)@$_POST['time'];
        mysqli_query($con, "delete from capubbs.mainpage where id=1 && field3='$time'");
        echo mysqli_errno($con);
        mysqli_query($con, "alter table capubbs.mainpage order by number");
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
