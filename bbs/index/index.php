<?php
	include("../lib/mainfunc.php");
    require_once "../content/utils/activityService.php";
    require_once "../../lib.php";
	date_default_timezone_set('Asia/Shanghai');
	$users=getuser();
	$username=$users['username'];
?>
<html>
<head>
<meta charset="utf-8">
<title>CAPUBBS - 选择讨论区</title>
<link rel="stylesheet" href="../lib/general.css">
<link rel="stylesheet" href="style.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<script src="../lib/jquery.min.js"></script>
<meta name="apple-itunes-app" content="app-id=826386033">
<?php

	$agent=@$_SERVER['HTTP_USER_AGENT'];
	if (stripos($agent,"Android 4") && $username=="") {
		echo '<script>';
		echo 'if (confirm("请下载CAPUBBS安卓客户端(898KB)，获取更好的浏览论坛的体验。"))
		{
		window.location="/index/download_file.php?d=13";
	}';
	echo '</script>';
}

?>

</head>
<body>
<div class="head">
<div class="user">
<?php
if ($username!="") {
	$userinfo=mainfunc(array("view"=>$username));
	$userinfo=$userinfo[0];
	$msg=intval($userinfo['newmsg']);
	$icon=translateicon($userinfo['icon']);
	$rank=$userinfo['star'];
	echo("<img src='$icon' class='usericon'></img>");
		echo("<div class='userinfo'>");
	echo("<a href='../user?name=$username' target='_blank'>$username</a>");
	echo("&nbsp;等级：$rank");
	if($msg==0){
	echo("&nbsp;<a href='../home' target='_blank'>个人中心</a>");
	}else{
		echo("<br><a href='../home?pos=message' target='_blank'>您有 $msg 条未读消息</a>");
	}
	echo("<br><a href='../logout?from=%2Fbbs%2Findex'>注销</a>");
	echo("</div>");
}else{
	echo("<span class='guest'>欢迎您，游客！<a href='../login?from=%2Fbbs%2Findex'>登录</a> 或者 <a href='../register'>注册</a></span>");
}
?>

</div>
</div>
<div class="content">
	<div class="left">
		<div class="title">
			<img src="tlbk.png" width="150">
		</div>
		<?php
		$blocks=mainfunc(array("ask"=>"bbsinfo"));
		for($i=0;$i<count($blocks);$i++){
			$block=$blocks[$i];
			if($block['hide']=="1") continue;
			echo("<div class='block raised' onclick='window.location.assign(\"../main?bid=".$block['bid']."\")'>");
			echo("<img src='b".$block['bid'].".jpeg' width='150' height='110'><br>");
			echo("<span class='title'>".$block['bbstitle']."</span><br>");
			echo("<span class='desc'>".@$block['desc']."</span><br>");
			$banzhus=userhref($block['m1'])." ".userhref($block['m2'])." ".userhref($block['m3'])." ".userhref($block['m4']);
			echo("<span class='banzhu'>版主：".$banzhus."</span>");
			echo("</div>");
		}
		?>
		<div style="float:left;margin-bottom:70px">
			<a href="javascript:showall()" id="showothers">显示所有版面↓</a>
			<div id="others" style="float:left;margin-top:20px;display:none">
			<?php
				for($i=0;$i<count($blocks);$i++){
					$block=$blocks[$i];
					if($block['hide']=="0") continue;
					echo "<a href='../main?bid=".$block['bid']."'  style='margin-top:20px;margin-right:10px;'>".$block['bbstitle'].'</a>';
				}
			?>
			</div>
		</div>
	</div>
	<div class="right">
		<div class="title">
			<img src="ltrd.png" width="150">
		</div>
		<div class="hot">
		<?php
		$hots=mainfunc(array("ask"=>"hot"));
		$global_tops=mainfunc(array("ask"=>"global_top"));
		echo("<ul>");
		foreach($global_tops as $hot){
			if(!@$hot['tid']) continue;
			$title=$hot['title'];
			$bid=$hot['bid'];
			$tid=$hot['tid'];
			$num=intval($hot['reply'])+1;
			$page=ceil(($num)/12);
            $activity = getActivity($bid, $tid);
			$link="../content/?bid=$bid&tid=$tid&p=$page#$num";
            if ($activity) {
                $link="../content/?bid=$bid&tid=$tid&p=1#1";
            }
			if ($num==1) $author=$hot['author'];
			else $author=$hot['replyer'];
			$time=date("Y-m-d H:i:s",$hot['timestamp']);
			echo "<li><a href='$link'>【置顶】$title</a><br>";
			echo "<span class='hint'><span class='hint2'>$author</span>&nbsp;于&nbsp;<span class='hint2'>$time</span></span></li>";
		}
		echo("</ul>");
		echo("<hr>");
		echo("<ul>");
		foreach($hots as $hot){
			if(!@$hot['tid']) continue;
			$title=$hot['title'];
			$bid=$hot['bid'];
			$tid=$hot['tid'];
			$num=intval($hot['reply'])+1;
			$page=ceil(($num)/12);
            $activity = getActivity($bid, $tid);
			$link="../content/?bid=$bid&tid=$tid&p=$page#$num";
            if ($activity) {
                $link="../content/?bid=$bid&tid=$tid&p=1#1";
            }
			if ($num==1) $author=$hot['author'];
			else $author=$hot['replyer'];
			$time=date("Y-m-d H:i:s",$hot['timestamp']);
			echo "<li><a href='$link'>$title</a><br>";
			echo "<span class='hint'><span class='hint2'>$author</span>&nbsp;于&nbsp;<span class='hint2'>$time</span></span></li>";
		}
		echo("</ul>");
		?>
		</div>
	</div>
</div>
<script>
function showall() {
	$('#others').show();
	$('#showothers').hide();
}
</script>
</body>
</html>
