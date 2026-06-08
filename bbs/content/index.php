<?php
    require_once __DIR__."/../lib/mainfunc.php";
    require_once __DIR__."/../lib/mainfunc.new.php";
    require_once __DIR__."/../lib/content_shared.php";
    include "./utils/activityService.php";
    require_once __DIR__.'/../../lib.php';

    $bid=@$_GET['bid'];
    $tid=@$_GET['tid'];
    $page=@$_GET['p'];
    $see_lz=@$_GET['see_lz'];
    $users=getuser();
    $currentuser=$users['username'];
    $ip = $_SERVER["REMOTE_ADDR"];
    $token = @$_COOKIE['token'];

    if(!$page) $page=1;
    if(!$bid) $bid=1;
    if(!$tid) $tid=1;
    $bid = intval($bid);
    $tid = intval($tid);
    $activity = getActivity($bid, $tid);
    if ($activity) {
        require "./utils/activity.php";
        exit();
    }

    $con = dbconnect_mysqli();
    checkUserAndSign($con, $ip, $token);
    $data = getOnePage($con, $bid, $tid, $page, $see_lz, $ip, $token);
    $tdata = getTidInfo($con, $bid, $tid);

    $floordata="";
    if ($see_lz!="") {
        $floordata=mainfunc(array("bid"=>$bid,"tid"=>$tid,"ask"=>"getlznum"));
        $floordata=$floordata[0];
    }
    if(count($tdata)==0){
        $tdata=null;
    }
    else $tdata=$tdata[0];
    if ($floordata!="") {
        $floors=intval($floordata['num']);
        if ($floors!=0)
            $tdata['reply']=$floors-1;
    }
    $bbsdata=mainfunc(array("ask"=>"bbsinfo"));
    $bdata=array();
    foreach ($bbsdata as $dt) {
        if (intval($dt['bid'])==$bid)
            $bdata=$dt;
    }

    $title=count($data)>0?$tdata['title']:"没有这个帖子= =";
    $lztitle="";if($see_lz!="") $lztitle="（只看楼主）&nbsp;&nbsp;";

    // 检查当前用户是否已收藏
    $isFaved = false;
    if ($currentuser != "") {
        $username_escaped = mysqli_real_escape_string($con, $currentuser);
        $fav_check = mysqli_query($con, "select 1 from favorites where username='$username_escaped' and bid=$bid and tid=$tid");
        $isFaved = (mysqli_num_rows($fav_check) > 0);
    }
?>

<html>
<head>
<meta charset="utf-8">
<meta name="apple-itunes-app" content="app-id=826386033">
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
        <?php echo $lztitle.$title;?>
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
        echo("<a href='./?bid=$bid&tid=$tid&p=1' id='page_title'>".$title."</a>&nbsp;");
        ?>
        <span id="fav-btn" class="fav-btn <?php echo $isFaved ? 'faved' : ''; ?>" onclick="toggleFav()"><?php echo $isFaved ? '★' : '☆'; ?></span>
        <?php
        echo "&nbsp;&gt;&nbsp;";
        echo("<span>第".$page."页</span>");
        echo "&nbsp;&nbsp;&nbsp;<a href='javascript:seelz()' style='color:#6d90ee'>";
        if ($see_lz=="") echo "只看楼主";
        else echo "查看整帖";
        echo "</a>";
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
            $url_currentuser = rawurlencode($currentuser);
            echo("欢迎您，<a href='../user/?name=$url_currentuser' target='_blank'>$currentuser</a>");
            $userinfo=mainfunc(array("view"=>$currentuser));
            $userinfo=$userinfo[0];
            $star=intval($userinfo['star']);

            // 检查邮箱验证禁言状态（bid=28 板块豁免）
            $email_muted = false;
            if (CAPUBBS_ENABLE_POST_CONTROL && $bid != 28) {
                $cu_verified = isset($userinfo['verified']) ? intval($userinfo['verified']) : 0;
                $cu_post = isset($userinfo['post']) ? intval($userinfo['post']) : 0;
                $cu_reply = isset($userinfo['reply']) ? intval($userinfo['reply']) : 0;
                if ($cu_verified === 0 && ($cu_post + $cu_reply) <= 20) {
                    $email_muted = true;
                }
            }

            $right=mainfunc(array("ask"=>"rights","bid"=> $bid));

            $right=$right[0]['code'];
            echo("<script type='text/javascript'>");
                        echo("var star=".$userinfo['star'].";");
            echo("</script>");
            $msg=intval($userinfo['newmsg']);
            if($msg==0){
                echo("&nbsp;<a href='../home' target='_blank'>个人中心</a>");
                echo("&nbsp;<a href='../favorite/'>我的收藏</a>");
            }else{
                echo("，<a href='../home?pos=message' target='_blank'>您有 $msg 条未读消息</a>");
                echo("&nbsp;<a href='../favorite/'>我的收藏</a>");
            }
            $nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
            $nowurl=urlencode($nowurl);
            echo("&nbsp;<a href='../logout?from=$nowurl'>注销</a>");
            // if (intval($users['rights']) >= 1) {
            //     echo("&nbsp;<a href='../manage/' style='color:#337ab7;'>管理工具</a>");
            // }
        }else{
            $nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
            $nowurl=urlencode($nowurl);
            $right=-1;
            $currentuser=null;
            $email_muted = false;
            echo("欢迎您，游客！<a href='../login?from=$nowurl'>登录</a> 或者 <a href='../register'>注册</a>");
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
        <script>var username='<?php echo $currentuser;?>';</script>
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
    echo("<hr class='hrt'></div>\n");
    $translated=translate($floor['text'],$floor['ishtml']=="YES");
    $translatedforquote=translateforquote($floor['text'],$floor['ishtml']=="YES");
    print "<div class='textblock' id='floor$i' style='line-height:160% !important'>$translated</div>\n";
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
        $sig_content = $userinfo['sig'.$floor['sig']];
        $sig_type = isset($userinfo['sig'.$floor['sig'].'_type']) ? $userinfo['sig'.$floor['sig'].'_type'] : 'null';
        echo("<div class='sigblock'>\n");
        echo("<span class='sigtip'>--------</span>\n");
        if ($sig_type === 'html') {
            echo("<div class='sig'>".translate($sig_content)."<br><br><br>"."</div>\n");
        } else if ($sig_type === 'raw') {
            echo("<div class='sig'>".translate($sig_content,false,true,true)."<br><br><br>"."</div>\n");
        } else {
            echo("<div class='sig'>".translate($sig_content,false,false,true)."<br><br><br>"."</div>\n");
        }
        echo("</div>");
    }
    $lzl=mainfunc(array(
    "ask"=>"lzl",
    "method"=>"ask",
    "fid"=> $floor['fid']
    ));
    if(count($lzl)==0){
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
    }else{
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
            if ($canreply && !$email_muted) echo '&nbsp;<a href="javascript:insertlzlreply('.$i.',\''.$author.'\');" class="lzlreplybt">回复</a>';
            else if ($canreply && $email_muted) echo '&nbsp;<a href="../home/?pos=verify_email" target="_blank" class="lzlreplybt" style="color:#FF9800;">验证邮箱后可回复</a>';
            if($right>=1|| $author==$currentuser){
                echo('&nbsp;<a href="javascript:deletelzlreply('.$floor['fid'].','.$lzl[$j]['id'].');" class="lzlreplybt">删除</a>');
            }
            echo("</span>");
            echo("</div></td></tr>");
        }
        ?>
        <tr><td class="lzltd">
            <?php if ($canreply && !$email_muted) echo '
                        <button style="float:right" onclick="toggleslide('.$i.')">我也说一句</button>
                        <div id="writeboard'.$i.'" style="display:none;">
                            <textarea class="lzltextarea" id="textarea'.$i.'"></textarea>
                            <button style="float:right" onclick="dolzlreply('.$i.",".$floor['fid'].',this);">发表</button>
                        </div>';
                        else if ($canreply && $email_muted) echo '
                        <span style="float:right;font-size:12px;color:#FF9800;"><a href="../home/?pos=verify_email" target="_blank">验证邮箱后可回复</span>
                        ';?>
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
    if($right>=1|| $floor['author']==$currentuser){
        echo("<a class='replylzlbt' href='javascript:deletepid(".$floor['pid'].");'>删除</a>\n");
        echo("<a class='replylzlbt' href='../editpid?bid=$bid&tid=$tid&pid=".$floor['pid']."'>编辑</a>\n");
    }
    if ($canreply && !$email_muted) {
        echo("<a class='replylzlbt' href='javascript:toggle".(count($lzl)==0?"reply":"slide")."($i);'>回复</a>
");
        echo("<a class='message reply' href='javascript:quote(\"".$floor['author']."\",$i)'><img src='reply.png' height='17px' style='position:relative;top:3px;'>&nbsp;引用</a>");
    } else if ($canreply && $email_muted) {
        echo("<a class='replylzlbt' href='../home/?pos=verify_email' target='_blank' style='color:#FF9800;'>验证邮箱后可回复</a>
");
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
<?php
if ($currentuser!="") {
if ($canreply && !$email_muted) {echo '
        <div class="editor" id="editor">
            <div id="edi_bar"></div>
            <div id="edi_content" onfocus="editorFocus();" onblur="editorBlur();"></div>
            <br>
';
if ($rights>=0 || $star>=0) echo '
            <div id="edi_attach" onclick="attach();">添加附件</div>
            <input type="file" id="file" style="display:none;" onchange="fileselected();"> ';
echo '
            <progress max="100" value="20" id="progress"></progress>
            选择签名档：
            <input type="radio" name="sign" value="0">不使用
            <input type="radio" name="sign" value="1" checked>1
            <input type="radio" name="sign" value="2">2
            <input type="radio" name="sign" value="3">3
            <div id="edi_submit" onclick="doreply();">发表回复</div>
            <br><br><br>
            <span id="attachtip" style="display:none;">本帖包含的附件：</span>
            <div class="attachs" id="attachs">
            
            </div>
            <span id="unusedattachtip" style="display:none;">您曾上传但未使用的附件：（可直接链接到本贴）<img src="waiting.gif" width="15px" id="waitinggif" style="visibility:hidden;"></span>
            <div class="attachs" id="unusedattachs">
            
            </div>
        </div>
';}
	else if ($canreply && $email_muted) {echo '
	        <div class="editip" id="editip">
	        <span class="editip">您的邮箱尚未验证，暂时无法发言。请前往&nbsp;<a href="../home/?pos=verify_email" target="_blank">个人中心</a>&nbsp;验证邮箱。</span>
	        </div>
	';}
	else echo '
        <div class="editip" id="editip">
        <span class="editip">在本版发帖或回复至少需要 '.$need.' 星</span>
        </div>
';
}
else echo '
        <div class="editip" id="editip">
        <span class="editip">您需要&nbsp;<a href="../login?from='.$nowurl.'">登录</a>&nbsp;后回复此贴；没有账号？&nbsp;<a href="../register">现在注册</a>&nbsp;</span>
        </div>';?>
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


var favTimer = null;
function toggleFav() {
    var $btn = $('#fav-btn');
    if (favTimer) return;
    favTimer = setTimeout(function() { favTimer = null; }, 500);
    var isFaved = $btn.hasClass('faved');
    var ask = isFaved ? 'favorite_remove' : 'favorite_add';
    $.post('/api/jiekoujson.php', { ask: ask, bid: bid, tid: tid }, function(res) {
        if (res.code === 0) {
            if (isFaved) {
                $btn.removeClass('faved').html('☆');
            } else {
                $btn.addClass('faved').html('★');
            }
        } else if (res.code === -2) {
            alert('请先登录');
        }
    });
}

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
