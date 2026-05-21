<?php
include("../lib/mainfunc.php");
include_once "../../config.php";
date_default_timezone_set('Asia/Shanghai');

$users = getuser();
$username = $users['username'];

// 未登录用户跳转登录页
if ($username == "") {
    $nowurl = urlencode($_SERVER["PHP_SELF"] . "?" . $_SERVER["QUERY_STRING"]);
    header("Location: ../login?from=$nowurl");
    exit;
}

$sort = isset($_GET['sort']) ? $_GET['sort'] : 'time';
$page = intval(@$_GET['p']);
if ($page < 1) $page = 1;

// 获取收藏列表
$fav_result = mainfunc(array(
    "ask" => "favorite_list",
    "sort" => $sort,
    "limit" => "-1"  // 不分页，全部获取
));

$fav_list = array();
if (@$fav_result[0]['code'] == '0') {
    for ($i = 1; $i < count($fav_result); $i++) {
        $fav_list[] = $fav_result[$i];
    }
}

// 获取版面信息
$bbsdata = mainfunc(array("ask" => "bbsinfo"));

// 获取用户信息
$userinfo = mainfunc(array("view" => $username));
$userinfo = $userinfo[0];
$msg = intval($userinfo['newmsg']);
$star = intval($userinfo['star']);

// 处理排序操作（上移/下移）
if (isset($_GET['action']) && isset($_GET['bid']) && isset($_GET['tid'])) {
    $act_bid = intval($_GET['bid']);
    $act_tid = intval($_GET['tid']);
    $action = $_GET['action'];

    if ($action == 'up' || $action == 'down') {
        // 确保所有项的 sort_order 已初始化
        $need_init = true;
        foreach ($fav_list as $fv) {
            if (intval($fv['sort_order']) != 0) {
                $need_init = false;
                break;
            }
        }
        if ($need_init) {
            for ($k = 0; $k < count($fav_list); $k++) {
                $fv = $fav_list[$k];
                mainfunc(array(
                    "ask" => "favorite_sort",
                    "bid" => $fv['bid'],
                    "tid" => $fv['tid'],
                    "sort_order" => $k
                ));
                $fav_list[$k]['sort_order'] = $k;
            }
        }

        // 找到当前项和相邻项的索引
        $cur_idx = -1;
        for ($k = 0; $k < count($fav_list); $k++) {
            if (intval($fav_list[$k]['bid']) == $act_bid && intval($fav_list[$k]['tid']) == $act_tid) {
                $cur_idx = $k;
                break;
            }
        }

        if ($cur_idx >= 0) {
            $swap_idx = ($action == 'up') ? $cur_idx - 1 : $cur_idx + 1;
            if ($swap_idx >= 0 && $swap_idx < count($fav_list)) {
                $cur_order = intval($fav_list[$cur_idx]['sort_order']);
                $swap_order = intval($fav_list[$swap_idx]['sort_order']);

                mainfunc(array(
                    "ask" => "favorite_sort", "bid" => $act_bid, "tid" => $act_tid,
                    "sort_order" => $swap_order
                ));
                mainfunc(array(
                    "ask" => "favorite_sort", "bid" => $fav_list[$swap_idx]['bid'],
                    "tid" => $fav_list[$swap_idx]['tid'], "sort_order" => $cur_order
                ));

                header("Location: ./?sort=$sort");
                exit;
            }
        }
    }

    if ($action == 'remove') {
        mainfunc(array("ask" => "favorite_remove", "bid" => $act_bid, "tid" => $act_tid));
        header("Location: ./?sort=$sort");
        exit;
    }
}
?>
<html>
<head>
<meta charset="utf-8">
<meta name="apple-itunes-app" content="app-id=826386033">
<title>我的收藏 - CAPUBBS</title>
<script type="text/javascript" src="../lib/general.js"></script>
<script type="text/javascript" src="../lib/t.js"></script>
<script src="../lib/jquery.min.js"></script>
<link rel="stylesheet" href="../lib/general.css">
<link rel="stylesheet" href="style.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
</head>
<body>
<div class="header">
<br>
<h2>我的收藏</h2>

<div class="user">
<?php
$icon = translateicon($userinfo['icon']);
echo("<img src='$icon' class='usericon'></img>");
echo("<div class='userinfo'>");
echo("<a href='../user/?name=" . rawurlencode($username) . "' target='_blank'>$username</a>");
echo("&nbsp;等级：$star");

if ($msg == 0) {
    echo("&nbsp;<a href='../home' target='_blank'>个人中心</a>");
} else {
    echo("<br><a href='../home?pos=message' target='_blank'>您有 $msg 条未读消息</a>");
}
$nowurl = $_SERVER["PHP_SELF"] . "?" . $_SERVER["QUERY_STRING"];
$nowurl = urlencode($nowurl);
echo("<br><a href='../logout?from=$nowurl'>注销</a>");
echo("</div>");
?>
</div>

<div class="navigation">
<div class="back" onclick="window.location='../index/';"><span style="margin-left:32px;"><b>返回</b></span></div>
<span style="float:left;margin-left:20px;position:relative;">
<a href='../index/'>CAPUBBS</a>&nbsp;&gt;&nbsp;
<span>我的收藏</span>&nbsp;
<span style="margin-left:30px;">
排序：
<?php if ($sort == 'time'): ?>
<b>按收藏时间</b> | <a href="./?sort=custom">自定义排序</a>
<?php else: ?>
<a href="./?sort=time">按收藏时间</a> | <b>自定义排序</b>
<?php endif; ?>
</span>
</span>
</div>

<table class="main">
<?php
if (count($fav_list) == 0) {
    echo("<tr><td style='text-align:center;padding:40px;'>还没有收藏任何帖子</td></tr>");
} else {
    echo("<tr class='head'><th></th><th>帖子标题</th><th>所在版面</th><th>阅读/回复</th><th>发帖时间</th><th>最后回复</th><th>收藏时间</th><th>操作</th></tr>");

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

        // 版面名称查找
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

        // 排序按钮（仅自定义模式）
        echo("<td style='width:50px;text-align:center;'>");
        if ($sort == 'custom' && !$deleted) {
            echo("<a href='./?sort=custom&action=up&bid=$fv_bid&tid=$fv_tid' class='sort-arrow' title='上移'>&#9650;</a>");
            echo("&nbsp;");
            echo("<a href='./?sort=custom&action=down&bid=$fv_bid&tid=$fv_tid' class='sort-arrow' title='下移'>&#9660;</a>");
        }
        echo("</td>\n");

        // 标题
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

        // 版面
        echo("<td>");
        if (!$deleted && $board_name != "") {
            echo("<a href='../main/?bid=$fv_bid'>$board_name</a>");
        }
        echo("</td>\n");

        // 阅读/回复
        echo("<td>");
        if (!$deleted) {
            echo("$click / $reply");
        }
        echo("</td>\n");

        // 发帖时间
        echo("<td>");
        if (!$deleted && $postdate != "") {
            echo("<span class='date'>$postdate</span>");
        }
        echo("</td>\n");

        // 最后回复
        echo("<td>");
        if (!$deleted && $thread_timestamp > 0) {
            echo("<span class='date'>" . formatstamp($thread_timestamp) . "</span>");
        }
        echo("</td>\n");

        // 收藏时间
        echo("<td><span class='date'>" . formatstamp($fav_timestamp) . "</span></td>\n");

        // 操作
        echo("<td>");
        echo("<a href='./?sort=$sort&action=remove&bid=$fv_bid&tid=$fv_tid' class='unfav-btn' onclick='return confirm(\"确定取消收藏？\");'>取消收藏</a>");
        echo("</td>\n");

        echo("</tr>\n");
    }
}
?>
</table>

<br>
<div class="footer">
</div>
</div>
</body>
</html>
