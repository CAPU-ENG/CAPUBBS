<?php
    include("../lib/mainfunc.php");
    include_once "../../config.php";
    date_default_timezone_set('Asia/Shanghai');

    $users = getuser();
    $username = $users['username'];

    if ($username == "") {
        $nowurl = urlencode($_SERVER["PHP_SELF"] . "?" . $_SERVER["QUERY_STRING"]);
        header("Location: ../login?from=$nowurl");
        exit;
    }

    $fav_result = mainfunc(array(
        "ask" => "favorite_list",
        "sort" => "time",
        "limit" => "-1"
    ));

    $fav_list = array();
    if (@$fav_result[0]['code'] == '0') {
        for ($i = 1; $i < count($fav_result); $i++) {
            $fav_list[] = $fav_result[$i];
        }
    }

    $bbsdata = mainfunc(array("ask" => "bbsinfo"));

    if (isset($_GET['action']) && $_GET['action'] == 'remove' && isset($_GET['bid']) && isset($_GET['tid'])) {
        $act_bid = intval($_GET['bid']);
        $act_tid = intval($_GET['tid']);
        mainfunc(array("ask" => "favorite_remove", "bid" => $act_bid, "tid" => $act_tid));
        header("Location: ./");
        exit;
    }
?>
<html>
<head>
<meta charset="utf-8">
<meta name="apple-itunes-app" content="app-id=826386033">
<title>我的收藏 - CAPUBBS</title>
<script type="text/javascript" src="../lib/general.js"></script>
<script src="../lib/jquery.min.js"></script>
<link rel="stylesheet" href="../lib/general.css">
<link rel="stylesheet" href="../main/style.css">
<link rel="stylesheet" href="style.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
</head>
<body>
<div class="header">
<br>

<div class="user">
<?php
$nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
$nowurl=urlencode($nowurl);
if($username!=""){
    $userinfo=mainfunc(array("view"=>$username));
    $userinfo=$userinfo[0];
    $msg=intval($userinfo['newmsg']);
    $icon=translateicon($userinfo['icon']);
    $star=intval($userinfo['star']);
    echo("<img src='$icon' class='usericon'></img>");
    echo("<div class='userinfo'>");
    echo("<a href='../user/?name=$username' target='_blank'>$username</a>");
    echo("&nbsp;等级：$star");

    echo("<script type='text/javascript'>");
    echo("var score=".$userinfo['score'].";");
    echo("var star=".$star.";");
    echo("</script>");

    if($msg==0){
        echo("&nbsp;<a href='../home' target='_blank'>个人中心</a>");
    }else{
        echo("<br><a href='../home?pos=message' target='_blank'>您有 $msg 条未读消息</a>");
    }
    echo("<br><a href='../logout?from=$nowurl'>注销</a>");
    echo("</div>");
}else{
    $nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
    $nowurl=urlencode($nowurl);
    echo("<script type='text/javascript'>var score=-1;</script>");
    echo("<span class='guest'>欢迎您，游客！<a href='../login?from=$nowurl'>登录</a> 或者 <a href='../register'>注册</a></span>");
}
?>

</div>

</div>

<div class="navigation">
<div class="back" onclick="window.location='../index/';"><span style="margin-left:32px;"><b>返回</b></span></div>
<span style="float:left;margin-left:20px;">
<a href='../index/'>CAPUBBS</a>&nbsp;&gt;&nbsp;
<span>我的收藏</span>
</span>
</div>

<br>

<table class="main">
<?php
if (count($fav_list) == 0) {
    echo("<tr><td style='text-align:center;padding:40px;'>还没有收藏任何帖子</td></tr>");
} else {
    echo("<tr class='head'><th>帖子标题</th><th>所在版面</th><th>阅读/回复</th><th>发帖时间</th><th>最后回复</th><th>收藏时间</th><th>操作</th></tr>");

    foreach ($fav_list as $idx => $fv) {
        $deleted = (@$fv['deleted'] == '1');
        $fv_bid = intval($fv['bid']);
        $fv_tid = intval($fv['tid']);
        $fav_timestamp = intval($fv['fav_timestamp']);
        $thread_timestamp = isset($fv['timestamp']) ? intval($fv['timestamp']) : 0;
        $click = isset($fv['click']) ? intval($fv['click']) : 0;
        $reply = isset($fv['reply']) ? intval($fv['reply']) : 0;
        $postdate = isset($fv['postdate']) ? $fv['postdate'] : '';
        $title = isset($fv['title']) ? $fv['title'] : '';
        $author = isset($fv['author']) ? $fv['author'] : '';

        $board_name = '';
        if (!$deleted) {
            foreach ($bbsdata as $bd) {
                if (intval($bd['bid']) == $fv_bid) {
                    $board_name = $bd['bbstitle'];
                    break;
                }
            }
        }

        $row_class = $deleted ? 'deleted' : ($idx % 2 == 0 ? 'even' : 'odd');

        echo("<tr class='content $row_class'>\n");

        echo("<td style='text-align:left;'>");
        if ($deleted) {
            echo("<span class='deleted-text'>帖子已删除</span>");
        } else {
            echo("<a href='../content/?bid=$fv_bid&tid=$fv_tid&p=1'>$title</a>");
            if ($author != "") {
                echo("&nbsp;<span class='date'>by " . userhref($author) . "</span>");
            }
        }
        echo("</td>\n");

        echo("<td>");
        if (!$deleted && $board_name != "") {
            echo("<a href='../main/?bid=$fv_bid'>$board_name</a>");
        }
        echo("</td>\n");

        echo("<td>");
        if (!$deleted) {
            echo("$click / $reply");
        }
        echo("</td>\n");

        echo("<td>");
        if (!$deleted && $postdate != "") {
            echo("<span class='date'>$postdate</span>");
        }
        echo("</td>\n");

        echo("<td>");
        if (!$deleted && $thread_timestamp > 0) {
            echo("<span class='date'>" . formatstamp($thread_timestamp) . "</span>");
        }
        echo("</td>\n");

        echo("<td><span class='date'>" . formatstamp($fav_timestamp) . "</span></td>\n");

        echo("<td>");
        echo("<a href='./?action=remove&bid=$fv_bid&tid=$fv_tid' class='unfav-btn' onclick='return confirm(\"确定取消收藏？\");'>取消收藏</a>");
        echo("</td>\n");

        echo("</tr>\n");
    }
}
?>
</table>

<br>
<div class="footer">
</div>

</body>
</html>
