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
    if ($ask == "add_download") adddownload();
    if ($ask == "edit_download") editdownload();
    if ($ask == "del_download") deldownload();

    function trans($x) {
        return "<![CDATA[".$x."]]>";
    }

    function loadcalendar() {
        $con = dbconnect_mysqli();
        $year = @$_POST['year'];
        $month = @$_POST['month'];
        $day = @$_POST['day'];
        $statement = "select * from capubbs.calendar where year='$year' && month='$month' && day='$day'";
        $results = mysqli_query($con, $statement);
        header('Content-type: application/xml;charset:UTF-8');
        echo '<capu>';
        while ($res = mysqli_fetch_array($results, MYSQLI_ASSOC)) {
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
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights == 0) { echo '-18'; exit; }
        $year = mysqli_real_escape_string($con, @$_POST['year']);
        $month = mysqli_real_escape_string($con, @$_POST['month']);
        $day = mysqli_real_escape_string($con, @$_POST['day']);
        $json = @$_POST['content'];
        $statement = "delete from capubbs.calendar where year='$year' && month='$month' && day='$day'";
        mysqli_query($con, $statement);
        $de_json = json_decode($json, true);
        $count_json = count($de_json);
        for ($i = 0; $i < $count_json; $i++) {
            $time = mysqli_real_escape_string($con, $de_json[$i]['time']);
            $title = mysqli_real_escape_string($con, $de_json[$i]['title']);
            $text = mysqli_real_escape_string($con, $de_json[$i]['content']);
            $statement = "insert into capubbs.calendar values ('$year','$month','$day','$time','$title','$text')";
            mysqli_query($con, $statement);
        }
        echo mysqli_errno($con);
        exit;
    }

    function saveimg() {
        $con = dbconnect_mysqli();
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights == 0) { echo '-18'; exit; }
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
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights == 0) { echo '-18'; exit; }
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
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights == 0) { echo '-18'; exit; }
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


    function adddownload() {
        $con = dbconnect_mysqli();
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights == 0) { echo '-18'; exit; }
        $title = mysqli_real_escape_string($con, @$_POST['title']);
        $url = mysqli_real_escape_string($con, @$_POST['url']);
        $statement = "insert into capubbs.downloads values (null,'$title','$url',0)";
        mysqli_query($con, $statement);
        echo mysqli_errno($con);
        exit;
    }

    function editdownload() {
        $con = dbconnect_mysqli();
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights == 0) { echo '-18'; exit; }
        $title = mysqli_real_escape_string($con, @$_POST['title']);
        $url = mysqli_real_escape_string($con, @$_POST['url']);
        $id = mysqli_real_escape_string($con, @$_POST['id']);
        $statement = "update capubbs.downloads set name='$title', url='$url' where id=$id";
        mysqli_query($con, $statement);
        echo mysqli_errno($con);
        exit;
    }

    function deldownload() {
        $con = dbconnect_mysqli();
        $res = checkuser_con($con);
        $rights = (int)$res[1];
        if ($rights == 0) { echo '-18'; exit; }
        $id = @$_POST['id'];
        $statement = "delete from capubbs.downloads where id=$id";
        mysqli_query($con, $statement);
        echo mysqli_errno($con);
        exit;
    }
?>
