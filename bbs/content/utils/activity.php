<?php
    $con = dbconnect_mysqli();
    checkUserAndSign($con, $ip, $token);
    $data = getOnePage($con, $bid, $tid, $page, $see_lz, $ip, $token);
    $tdata = getTidInfo($con, $bid, $tid);
    if(count($tdata)==0){
        $tdata=null;
    }
    else $tdata=$tdata[0];
    $bbsdata=mainfunc(array("ask"=>"bbsinfo"));
    $bdata=array();
    foreach ($bbsdata as $dt) {
        if (intval($dt['bid'])==$bid)
            $bdata=$dt;
    }

    $title=count($data)>0?$tdata['title']:"没有这个帖子= =";

    $activity_id = $activity["activity_id"];
    $is_joint = get_joint($currentuser, $activity_id);
    $is_canceled = get_canceled($currentuser, $activity_id);
    $is_leader = ($currentuser == $activity["leader_username"] || $currentuser == "网络组" || $currentuser == "组织部" || $currentuser == "文体部" || $currentuser == "理事会");
?>

<html>
<head>
<meta charset="utf-8">
<title><?php echo $title;?></title>
<script type="text/javascript" src="../lib/general.js"></script>
<script type="text/javascript" src="../lib/json2.js"></script>
<script src="../lib/jquery.min.js"></script>
<link rel="stylesheet" href="../lib/general.css">
<link rel="stylesheet" href="style.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
</head>
<body>
    <div class="content">
    <div class="tabletop">
        <span class="title">
        <?php echo $title;?>
        </span>
        <span class="readclick">
        阅读&nbsp;<?php echo($tdata['click']) ?><br>
        回复&nbsp;<?php echo($tdata['reply']) ?>
        </span>
    </div>
    
    <div class="top">
        <div class="navigation"><div class="back" onclick="goback();"><span style="margin-left:32px;"><b>返回</b></span></div>
        <span style="float:left;margin-left:20px;"> 
        <?php
        echo("<a href='../index' onmouseover='showmenu();'>CAPUBBS</a>&nbsp;&gt;&nbsp;");
        echo("<a href='../main/?bid=$bid'>".$bdata['bbstitle']."</a>&nbsp;&gt;&nbsp;");
        echo("<a href='./?bid=$bid&tid=$tid&p=1' id='page_title'>".$title."</a>&nbsp;&gt;&nbsp;");
        echo("<span>第".$page."页</span>");
        ?>
        <div class="popover" id="popover" onmouseleave='hidemenu();'>
            <table class="popover">
            <?php
            foreach($bbsdata as $value){
                if($value['hide']=="1") continue;
                echo("<tr><td onclick='gotobbs(".$value['bid'].");'>".$value['bbstitle']."</td></tr>");
            }
            ?>
            </table>
        </div>
        </span></div>
        <span class="userinfo">
        <?php
        $rights=intval($users['rights']);$star=-1;
        if($currentuser!=""){
            echo("欢迎您，<a href='../user/?name=$currentuser' target='_blank'>$currentuser</a>");
            $userinfo=mainfunc(array("view"=>$currentuser));
            $userinfo=$userinfo[0];
            $star=intval($userinfo['star']);

            $right=mainfunc(array("ask"=>"rights","bid"=> $bid));

            $right=$right[0]['code'];
            echo("<script type='text/javascript'>");
            echo("var score=".$userinfo['score'].";");
            echo("var star=".$userinfo['star'].";");
            echo("</script>");
            $msg=intval($userinfo['newmsg']);
            if($msg==0){
                echo("&nbsp;<a href='../home' target='_blank'>个人中心</a>");
            }else{
                echo("，<a href='../home?pos=message' target='_blank'>您有 $msg 条未读消息</a>");
            }
            $nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
            $nowurl=urlencode($nowurl);
            echo("&nbsp;<a href='../logout?from=$nowurl'>注销</a>");
        }else{
            $nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
            $nowurl=urlencode($nowurl);
            $right=-1;
            $currentuser=null;
            echo("欢迎您，游客！<a href='../login?from=$nowurl'>登录</a> 或者 <a href='../register'>注册</a>");
            echo("<script type='text/javascript'>var score=-1;</script>");
        }
        echo("<script type='text/javascript'>");
        echo("var bid=".$bid.";");
        echo("var tid=".$tid.";");
        echo("var page=".$page.";");
        echo("</script>");
        $boardinfo=mainfunc(array(
        "ask"=>"bbsinfo",
        "bid"=>$bid));
        $boardinfo=$boardinfo[0];
        $need=intval($boardinfo['need']);
        $canreply=true;
        if ($rights<=1 && $star<$need) $canreply=false;
        ?>
        </span>
<?php
if (intval($bid)==1 && $currentuser=="") {
    echo '</div>
        <table class="main"></table><div class="editip" id="editip">
        <span class="editip">您需要&nbsp;<a href="../login?from='.$nowurl.'">登录</a>&nbsp;后才能查看本版面帖子内容；没有账号？&nbsp;<a href="../register">现在注册</a>&nbsp;</span>
        </div></div> ';
    echo '</body></html>';
    exit;
}
?>
        <br>
        <div class="pagecontainer" style="margin-top:60px">
            <div class="pagecontrol">

<?php
$pages = ceil((intval($tdata['reply']) + 1) / 12);
@$page = intval($_GET['p']);
if ($page < 1) $page = 1;
echo_page_control($page, $pages, $bid, $tid, $see_lz);
?>
</div></div>
    </div>


<table class="main">
<?php
for($i=0;$i<count(@$data);$i++){
    $floor=$data[$i];
    echo("<tr class='floor' id='".$floor['pid']."'>\n");

    echo("<td valign='top' class='left'>\n");
    echo("<a name='pid".$floor['pid']."'></a>");
    echo("<div class='content'>\n");
    echo("<div class='author'>\n");
    echo("<p align='center'>".userhrefbig($floor['author'])."</p>\n");

    echo("<div class='userpic drop-shadow'>\n");
    $userinfo=mainfunc(array("view"=>$floor['author']));
    $userinfo=@$userinfo[0];
    echo("<img src='".translateicon($userinfo['icon'])."' class='icon'>");
    echo "<p align='center' class='starline'>";
    for ($k=1;$k<=intval($userinfo['star']);$k++)
        echo "<img src='/bbsimg/star$k.gif' style='margin-left:3px;'>";
    echo "</p>";
    echo("<table class='subicon'><tr><td class='line'>".$userinfo['post']."<br>主题</td><td class='line'>".$userinfo['reply']."<br>回帖</td><td>".$userinfo['sign']."<br>签到</td></tr></table>\n");
    echo("<br>\n");
    echo("</div>\n");
    echo("<br>\n");
    echo("<div class='info'>\n");
    echo("星数：".$userinfo['star']."<br>\n");
    echo("精品：".$userinfo['extr']."<br>\n");
    echo("灌水：".$userinfo['water']."<br>\n");
    echo("权限：".$userinfo['rights']."<br>\n");
    echo("最近：".$userinfo['lastdate']."<br>\n");
    echo "IP：";
    if($rights>=1|| $floor['author']==$currentuser)
        echo $userinfo['lastip'];
    else echo '*.*.*.*';
    echo "<br><br>\n";
    echo("<a href='javascript:sendMessageTo(\"".$floor['author']."\")' class='message'><img src='mail.png' height='13px' style='position:relative;top:1px;'>&nbsp;发消息</a>\n");
    echo("</div>\n");
    echo("</div>\n");
    echo("<div class='bubble text'>\n");
    $time=$floor['replytime'];
    echo("<div class='headblock'><span class='floorinfo'>发表于 ".formatstamp($time));
    if($floor['updatetime']!=$floor['replytime']){
        echo("&nbsp;&nbsp;&nbsp;最后编辑于 ".formatstamp($floor['updatetime']));
    }
    echo("<span class='floornum'>".transfloornum($floor['pid'])."</span>\n");
    echo("<!-- fid: ".$floor['fid'].", pid: ".$floor['pid']." -->");
    echo("<hr class='hrt'></div>\n");
    $translated=translate($floor['text'],$floor['ishtml']=="YES");

    // textblock
    {
        echo "<div class='textblock' id='floor$i' style='line-height:160% !important'>";
        echo $translated;

        if ($floor['pid'] == 1) {
            if ($currentuser=="") {
                ?>
                <div style='justify-content: center; align-items: center; border: 1px solid black; padding: 10px 10px 10px 10px;'>
                    <div style="text-align: center;">
                        <font size="6px">请登录后参与</font>
                    </div>
                </div>
                <?php
            } else if (!$is_leader && !$is_joint) {
                ?>
                <br><br><hr>
                <div style='justify-content: center; align-items: center; border: 1px solid black; padding: 10px 20px 30px 40px;'>
                    <form action="#" id="join_activity" method="POST">
                    <?php
                        for($option_idx=0; $option_idx < count(@$activity["options"]); $option_idx++){
                            $option = $activity["options"][$option_idx];
                            echo "<div>";
                            echo "".($option_idx+1).". ".$option["option_name"].": ";
                            echo "<br>";
                            echo "<div>";
                            echo $option["comment"];
                            echo "</div>";

                            switch ($option["type_id"]) {
                                case 1: // 单项选择
                                    $cases = $option["cases"];
                                    echo "<div>";
                                    for ($case_id = 0; $case_id < count(@$cases); $case_id++) {
                                        echo "<input type='radio' name='".$option["option_id"]."' value='".$cases[$case_id]["case_id"]."' required>";
                                        echo $cases[$case_id]["case_name"];
                                    }
                                    echo "</div>";
                                    break;
                                case 3: // 多项选择
                                    $cases = $option["cases"];
                                    $required_attr = $option["required"] ? " data-required='1'" : "";
                                    echo "<div".$required_attr.">";
                                    for ($case_id = 0; $case_id < count(@$cases); $case_id++) {
                                        echo "<input type='checkbox' name='".$option["option_id"]."[]' value='".$cases[$case_id]["case_id"]."' class='multi-choice-".$option["option_id"]."'>";
                                        echo $cases[$case_id]["case_name"];
                                    }
                                    echo "</div>";
                                    break;
                                case 6:
                                    if ($option["option_name"] == "ID") {
                                        echo "<input style='width: 70%;' name='".$option["option_id"]."' value='".$currentuser."' required>";
                                    } else {
                                        echo "<input style='width: 70%;' name='".$option["option_id"]."' required>";
                                    }
                                    break;
                            }
                            echo "</div>";
                        }
                    ?>
                    <br>
                    <div>签名档：
                        <input type="radio" name="sign" value="0" >不使用
                        <input type="radio" name="sign" value="1" checked>1
                        <input type="radio" name="sign" value="2" >2
                        <input type="radio" name="sign" value="3" >3
                    </div>
                    <br>
                    <button>报名</button>
                    <br>
                    </form>
                    <script>
                        $("#join_activity").submit(function(e) {
                            e.preventDefault();
                            if (!validateMultiChoice($(this))) {
                                return;
                            }
                            option_values_array = $("#join_activity").serializeArray();
                            option_values = {};
                            for (let index = 0; index < option_values_array.length; index++) {
                                const element = option_values_array[index];
                                let name = element["name"].replace("[]", "");
                                if (option_values[name] === undefined) {
                                    option_values[name] = element["value"];
                                } else {
                                    option_values[name] += "," + element["value"];
                                }
                            }
                            send_data = {
                                data: {
                                    action: "join",
                                    bid: bid,
                                    tid: tid,
                                    title: "Re: "+$('#page_title').text(),
                                    activity_id: <?php echo $activity["activity_id"]; ?>,
                                    option_values: option_values
                                }
                            };
                            $.post("/bbs/content/utils/postActivity.php",
                                send_data,
                                function(text) {
                                    console.log(text);
                                    var result = JSON.parse(text);
                                    if (result['code'] == 0) {
                                        window.location.reload();
                                    } else {
                                        alert(result.msg);
                                    }
                                }
                            );
                        })
                    </script>
                </div>

                <?php
            } else if ($is_leader) {
                $join_value = get_activity_join($activity_id);
                ?>
                <div style='justify-content: center; align-items: center; border: 1px solid black; padding: 10px 10px 10px 10px;'>
                    <div style="text-align: center;">
                        <font size="6px">报名名单</font>
                        <br>
                        <br>
                        <button onclick="location.href='utils/getExcel.php?bid=<?php echo $bid;?>&tid=<?php echo $tid;?>'">下载</button>
                        <br>
                        <br>
                        <div style="overflow-x:scroll;">
                        <table style="border-collapse:collapse;border-spacing:0;table-layout: fixed;">
                        <thead>
                            <?php
                                $tag_begin = '<th style="border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 5px;text-align:left;vertical-align:middle;word-break:keep-all;white-space:nowrap;">';
                                $tag_end = '</th>';
                                echo $tag_begin."用户名".$tag_end;
                                echo $tag_begin."是否有罚跑".$tag_end;
                                for ($option_idx=0; $option_idx < count(@$activity["options"]); $option_idx++){
                                    $option = $activity["options"][$option_idx];
                                    echo $tag_begin.$option["option_name"].$tag_end;
                                }
                            ?>
                        </thead>
                        <tbody>
                            <?php
                                $tag_begin = '<td style="border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 5px;text-align:left;vertical-align:middle;word-break:keep-all;white-space:nowrap;">';
                                $tag_end = '</td>';
                                for ($user_idx = 0; $user_idx < count(@$join_value); $user_idx++){
                                    $_username = $join_value[$user_idx]['username'];
                                    $_option_value = $join_value[$user_idx]['option_value'];
                                    $cancel = $join_value[$user_idx]['cancel'];

                                    echo '<tr>';
                                    if ($cancel) {
                                        echo $tag_begin.'<font color="red"><strike>'.$_username.'</strike></font>'.$tag_end;
                                    } else {
                                        echo $tag_begin.$_username.$tag_end;
                                    }
                                    if ($join_value[$user_idx]['has_punishment'] == 1) {
                                        $punishment_text = "是";
                                    } else {
                                        $punishment_text = "";
                                    }
                                    if ($cancel) {
                                        echo $tag_begin.'<font color="red"><strike>'.$punishment_text.'</strike></font>'.$tag_end;
                                    } else {
                                        echo $tag_begin.$punishment_text.$tag_end;
                                    }
                                    for ($option_idx=0; $option_idx < count(@$activity["options"]); $option_idx++){
                                        $option = $activity["options"][$option_idx];

                                        switch ($option["type_id"]) {
                                            case 1:
                                                $cases = $option["cases"];
                                                for ($case_id = 0; $case_id < count(@$cases); $case_id++) {
                                                    if ($_option_value[$option["option_id"]] == $cases[$case_id]["case_id"]) {
                                                        $real_value = $cases[$case_id]["case_name"];
                                                        break;
                                                    }
                                                }
                                                break;
                                            case 3:
                                                $case_ids = explode(",", $_option_value[$option["option_id"]]);
                                                $names = array();
                                                foreach ($case_ids as $cid) {
                                                    foreach ($option["cases"] as $c) {
                                                        if ($c["case_id"] == intval($cid)) {
                                                            $names[] = $c["case_name"];
                                                            break;
                                                        }
                                                    }
                                                }
                                                $real_value = implode("、", $names);
                                                break;
                                            case 6:
                                                $real_value = $_option_value[$option["option_id"]];
                                                break;
                                        }

                                        if ($cancel) {
                                            echo $tag_begin.'<font color="red"><strike>'.htmlspecialchars($real_value).'</strike></font>'.$tag_end;
                                        } else {
                                            echo $tag_begin.htmlspecialchars($real_value).$tag_end;
                                        }
                                    }
                                    echo '</tr>';
                                }
                            ?>
                        </tbody>
                        </table>
                        </div>
                    </div>
                </div>
                <?php
            } else if ($is_canceled) {
                ?>
                <br><br><hr>
                <div style='justify-content: center; align-items: center; border: 1px solid black; padding: 10px 10px 10px 10px;'>
                    <div style="text-align: center;">
                        <font size="6px">已取消报名</font>
                        <br>
                        <br>
                        <button id="restore_join">恢复报名</button>
                    </div>
                    <script>
                        $("#restore_join").click(function(e) {
                            send_data = {
                                data: {
                                    action: "restore",
                                    bid: bid,
                                    tid: tid,
                                    activity_id: <?php echo $activity["activity_id"]; ?>
                                }
                            };
                            $.post("/bbs/content/utils/postActivity.php",
                                send_data,
                                function(text) {
                                    console.log(text);
                                    var result = JSON.parse(text);
                                    if (result['code'] == 0) {
                                        window.location.reload();
                                    } else {
                                        alert(result.msg);
                                    }
                                }
                            );
                        });
                    </script>
                </div>

                <?php
            } else if ($is_joint) {
                ?>
                <br><br><hr>
                <div style='justify-content: center; align-items: center; border: 1px solid black; padding: 10px 10px 10px 10px;'>
                    <div style="text-align: center;">
                        <font size="6px">已报名<?php
                            $floor_num1 = get_floor_num_1($currentuser, $activity_id);
                            $floor_num2 = get_floor_num_2($currentuser, $bid, $tid);
                            if ($floor_num1 == -1 || $floor_num2 == -1 || $floor_num1 != $floor_num2) {
                                echo '（出bug了，请联系好蛋）';
                                echo "$floor_num1 , $floor_num2";
                            } else {
                                $page_num = ceil(($floor_num2)/12);
                                if ($floor_num2 <= 12)
                                    echo "（<a href='#".$floor_num2."'>第".$floor_num2."楼</a>）";
                                else
                                    echo "（<a href='../content/?p=".$page_num."&bid=".$bid."&tid=".$tid."#".$floor_num2."'>第".$floor_num2."楼</a>）";
                            }
                        ?></font>
                        <?php
                            $text = get_activity_join_remind($activity_id);
                            if ($text)
                                echo $text;
                        ?>
                        <br>
                        <br>
                        <button id="cancel_join">取消报名</button>
                        <button onclick="var scr=$('#modify_join_activity');if(scr.css('height')=='0px'){scr.animate({height:scr[0].scrollHeight});$(this).html('收起报名信息')}else{scr.animate({height:'0px'});this.innerHTML='修改报名信息'}">修改报名信息</button>
                    </div>
                    <form action="#" id="modify_join_activity" method="POST" style="height: 0px; overflow-y: auto;">
                    <?php
                        $optionValue = getUsernameOptionValue($currentuser, $activity_id);
                        for($option_idx=0; $option_idx < count(@$activity["options"]); $option_idx++){
                            $option = $activity["options"][$option_idx];
                            echo "<div>";
                            echo "".($option_idx+1).". ".$option["option_name"].": ";
                            echo "<br>";
                            echo "<div>";
                            echo $option["comment"];
                            echo "</div>";

                            switch ($option["type_id"]) {
                                case 1:
                                    $cases = $option["cases"];
                                    echo "<div>";
                                    for ($case_id = 0; $case_id < count(@$cases); $case_id++) {
                                        if ($optionValue[$option["option_id"]] == $cases[$case_id]["case_id"])
                                            $checked = "checked";
                                        else
                                            $checked = "";
                                        echo "<input type='radio' name='".$option["option_id"]."' value='".$cases[$case_id]["case_id"]."' required $checked>";
                                        echo $cases[$case_id]["case_name"];
                                    }
                                    echo "</div>";
                                    break;
                                case 3:
                                    $cases = $option["cases"];
                                    $selected_ids = explode(",", $optionValue[$option["option_id"]]);
                                    $required_attr = $option["required"] ? " data-required='1'" : "";
                                    echo "<div".$required_attr.">";
                                    for ($case_id = 0; $case_id < count(@$cases); $case_id++) {
                                        $checked = in_array($cases[$case_id]["case_id"], $selected_ids) ? "checked" : "";
                                        echo "<input type='checkbox' name='".$option["option_id"]."[]' value='".$cases[$case_id]["case_id"]."' $checked>";
                                        echo $cases[$case_id]["case_name"];
                                    }
                                    echo "</div>";
                                    break;
                                case 6:
                                    echo "<input style='width: 70%;' name='".$option["option_id"]."' value='".$optionValue[$option["option_id"]]."'required>";
                                    break;
                            }
                            echo "</div>";
                        }
                    ?>
                    <br>
                    <div>签名档：
                        <input type="radio" name="sign" value="0" <?php if ($optionValue["sign"] == 0) echo "checked"; ?>>不使用
                        <input type="radio" name="sign" value="1" <?php if ($optionValue["sign"] == 1) echo "checked"; ?>>1
                        <input type="radio" name="sign" value="2" <?php if ($optionValue["sign"] == 2) echo "checked"; ?>>2
                        <input type="radio" name="sign" value="3" <?php if ($optionValue["sign"] == 3) echo "checked"; ?>>3
                    </div>
                    <br>
                    <button>修改</button>
                    <br>
                    </form>
                    <script>
                        $("#cancel_join").click(function(e) {
                            send_data = {
                                data: {
                                    action: "cancel",
                                    bid: bid,
                                    tid: tid,
                                    activity_id: <?php echo $activity["activity_id"]; ?>
                                }
                            };
                            $.post("/bbs/content/utils/postActivity.php",
                                send_data,
                                function(text) {
                                    console.log(text);
                                    var result = JSON.parse(text);
                                    if (result['code'] == 0) {
                                        window.location.reload();
                                    } else {
                                        alert(result.msg);
                                    }
                                }
                            );
                        });
                        $("#modify_join_activity").submit(function(e) {
                            e.preventDefault();
                            if (!validateMultiChoice($(this))) {
                                return;
                            }
                            option_values_array = $("#modify_join_activity").serializeArray();
                            option_values = {};
                            for (let index = 0; index < option_values_array.length; index++) {
                                const element = option_values_array[index];
                                let name = element["name"].replace("[]", "");
                                if (option_values[name] === undefined) {
                                    option_values[name] = element["value"];
                                } else {
                                    option_values[name] += "," + element["value"];
                                }
                            }
                            send_data = {
                                data: {
                                    action: "modify",
                                    bid: bid,
                                    tid: tid,
                                    title: "Re: "+$('#page_title').text(),
                                    activity_id: <?php echo $activity["activity_id"]; ?>,
                                    option_values: option_values
                                }
                            };
                            $.post("/bbs/content/utils/postActivity.php",
                                send_data,
                                function(text) {
                                    console.log(text);
                                    var result = JSON.parse(text);
                                    if (result['code'] == 0) {
                                        window.location.reload();
                                    } else {
                                        alert(result.msg);
                                    }
                                }
                            );
                        })
                    </script>
                </div>

                <?php
            }
        }
        echo "</div>\n";
    }

    if($floor['attachs']){
        echo('<span id="attachtipdark">本帖包含如下的附件：</span>');
        echo("<div class='attachsdark'>\n");
        $atts=explode(" ", $floor['attachs']);
        foreach($atts as $value){
            $nowa=mainfunc(array("ask"=>"attachinfo","id"=>$value));
            $nowa=$nowa[0];
            echo generateattach_html(@$nowa['name'],@$nowa['size'],@$nowa['id'],@$nowa['count']);
        }
        echo("</div>\n");
    }
    if(@$userinfo['sig'.$floor['sig']]){
        echo("<div class='sigblock'>\n");
        echo("<span class='sigtip'>--------</span>\n");
        echo("<div class='sig'>".translate($userinfo['sig'.$floor['sig']],false,false)."<br><br><br>"."</div>\n");
        echo("</div>");
    }
    $lzl=mainfunc(array(
    "ask"=>"lzl",
    "method"=>"ask",
    "fid"=> $floor['fid']
    ));
    if (count($lzl)==0) {
        ?>
        <table class="lzltable" style="display:none;" id="lzl<?php echo($i); ?>">
        <tr><td class="lzltd">
        <div id="writeboard<?php echo($i); ?>">
        <textarea class="lzltextarea" id="textarea<?php echo($i); ?>"></textarea>
        <button class="lzlpostbt" onclick="dolzlreply(<?php echo($i.",".$floor['fid']); ?>,this);">发表</button>
        </div>
        </td></tr>
        </table>

        <?php
    } else {
        ?>
        <table class="lzltable">
        <?php
        for($j=0;$j< count($lzl);$j++){
            $author=$lzl[$j]['author'];
            $authorinfo=mainfunc(array("view"=>$author));
            $authorinfo=$authorinfo[0];
            echo('<tr><td class="lzltd">');
            echo('<div class="lzlicon"><img src="'.translateicon($authorinfo['icon']).'" class="lzlicon"></div>');
            $html=str_replace(chr(10), "<br>",htmlspecialchars($lzl[$j]['text']));
            $html=str_replace(chr(13), "<br>",$html);
            echo('<div class="lzlcontent">'.userhref($author).': '.$html.'<br>');
            echo('<span class="lzltime">'.formatstamp($lzl[$j]['time']));
            if ($canreply) echo '&nbsp;<a href="javascript:insertlzlreply('.$i.',\''.$author.'\');" class="lzlreplybt">回复</a>';
            if($right>=1|| $author==$currentuser){
                echo('&nbsp;<a href="javascript:deletelzlreply('.$floor['fid'].','.$lzl[$j]['id'].');" class="lzlreplybt">删除</a>');
            }
            echo("</span>");
            echo("</div></td></tr>");
        }
        ?>
        <tr><td class="lzltd">
            <?php if ($canreply) echo '
            <button style="float:right" onclick="toggleslide('.$i.')">我也说一句</button>
            <div id="writeboard'.$i.'" style="display:none;">
                <textarea class="lzltextarea" id="textarea'.$i.'"></textarea>
                <button style="float:right" onclick="dolzlreply('.$i.",".$floor['fid'].',this);">发表</button>
            </div>';?>
            </td></tr>
            </table>
        <?php
    }
    echo("<div class='contentb'>\n");
    echo("<hr class='hrb'>\n");
    $ip="*.*.*.*";
    if($rights>=1|| $floor['author']==$currentuser)
        $ip=$floor['ip'];
    echo "<span style='margin-left:35px;float:left'><img src='/bbsimg/ip.gif'>&nbsp;$ip</span>";
    $os=$floor['type'];
    if ($os=="android") {
        echo "<span class='oshint'>来自于<a href='/index/download_file.php?d=13' target='_blank'>Android客户端</a></span>";
    }
    else if ($os=="ios") {
        echo "<span class='oshint'>来自于<a href='/index/download_file.php?d=14' target='_blank'>iOS客户端</a></span>";
    }
    if($right>=1){
        echo("<a class='replylzlbt' href='javascript:deletepid(".$floor['pid'].");'>删除</a>\n");
    }
    if ($is_leader && $floor['pid'] == 1) {
        echo("<a class='replylzlbt' href='../editpid?bid=$bid&tid=$tid&pid=".$floor['pid']."'>编辑</a>\n");
    }
    if ($canreply) {
        echo("<a class='replylzlbt' href='javascript:toggle".(count($lzl)==0?"reply":"slide")."($i);'>回复</a>\n");
    }
    echo("</div>\n");
    echo("</div>\n");
    echo("</div>\n");

    echo("<tr class='white'><td><div class='white'></div></td></tr>\n");

}
?>
        </table>
        <br>
        <div class="pagecontainer">
            <div class="pagecontrol">

<?php
$pages = ceil(intval($tdata['reply'] + 1) / 12);
@$page = intval($_GET['p']);
if ($page < 1) $page = 1;
echo_page_control($page, $pages, $bid, $tid, $see_lz);
?>

            </div>
        </div>
    <br>
    </div>
    
    <div id="msg_overlay">
        <div>
            <span>您要对&nbsp;<span id='msg_to'></span>&nbsp;说：</span><br><br>
            <textarea id="msg_ta" style="width:400px;height:200px;font-size:13px;padding:5px;"></textarea><br><br>
            <button onclick="msg_send();" id="msg_sendbt">发送</button>&nbsp;<button onclick="msg_cancel();" id="msg_cancelbt">取消</button>
        </div>
     </div>
     
    <div class="footer">
    </div>
    <form method="post" id="fm" action="../post/">
    <input type="hidden" name="bid" id="fm_bid" value="<?php echo($tdata['bid']); ?>">
    <input type="hidden" name="tid" id="fm_tid" value="<?php echo($tdata['tid']); ?>">
    <input type="hidden" name="icon" value="1" id="fm_icon">
    <input type="hidden" name="token" id="fm_token">
    <input type="hidden" name="title" id="fm_title">
    <input type="hidden" name="text" id="fm_text">
    <input type="hidden" name="sig" id="fm_sig">
    <input type="hidden" name="attachs" id="fm_attachs">
    </form>
<script type="text/javascript" src="../lib/nic.js"></script>
<script type="text/javascript" src="../lib/content_shared.js"></script>
<script type="text/javascript">
var myNicEditor = new nicEditor({fullPanel : true});
myNicEditor.setPanel('edi_bar');
myNicEditor.addInstance('edi_content');
var attachs = [];
var unusedattachs = [];
<?php
$result=mainfunc(array("ask"=>"unusedattachinfo"));
for ($i = 1; $i < count($result); $i++) {
    echo "unusedattachs.push(" . json_encode($result[$i]) . ");\n";
}
?>


refreshAttach();
$(window).load(function() {
    $(".textblock").each(function() {
        var text = $(this);
        text.find("img").each(function() {
            var img = $(this);
            var width = parseInt(img.css("width"));
            width = (width > 700) ? 700 : width;
            img.css("width", width);
        });
    });
});
</script>
</body>
</html>
