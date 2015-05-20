<?php
	include "../lib/mainfunc.php";
	$res=getuser();
	$username=@$res['username'];
	date_default_timezone_set('Asia/Shanghai');
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" href="message.css" />
<link rel="stylesheet" href="../lib/general.css" />
<?php
	if ($username=="") {
		echo '<script>alert("超时，请重新登录！");window.parent.location="../login/";</script>';
		echo '</head></html>';
		exit;
	}
	$type=@$_GET['type'];
	if ($type!="private" && $type!="new" && $type!="chat")
		$type="system";
	$touser=@$_GET['to'];
	if ($type=="chat" && @$touser=="") $type="system";
	$p=intval(@$_GET['p']);
	if ($p<1) $p=1;

	$data=array();
	if ($type=="private")
		$data=mainfunc(array("ask"=>"msg","type"=>"private"));
	else if ($type=="chat")
		$data=mainfunc(array("ask"=>"msg","type"=>"chat","to"=>$touser));
	else if ($type!="new") {
		$type="system";
		$data=mainfunc(array("ask"=>"msg","type"=>"system","p"=>$p));
	}
	$infos=$data[0];
	$code=intval($infos['code']);
	if ($code!=0) {
		echo '<script>alert("'.$infos['msg'].'");</script>"';
		echo '</head></html>';
		exit;
	}
	$sysmsg=intval($infos['sysmsg']);
	$prvmsg=intval($infos['prvmsg']);
	$systotal=intval($infos['systotal']);
?>
<script src="../lib/jquery.min.js"></script>
</head>
<body>
<div class="topbar">
<p>
<?php
	if ($type!="system") echo '<a href="message.php?type=system">';
	echo "系统消息";
	if ($type!="system") echo '</a>';
	if ($sysmsg>0) echo '&nbsp;<span class="badge">'.$sysmsg.'</span>';
	echo " | ";
	if ($type!="private") echo '<a href="message.php?type=private">';
	echo "私信消息";
	if ($type!="private") echo '</a>';
	if ($prvmsg>0) echo '&nbsp;<span class="badge">'.$prvmsg.'</span>';
	echo " | ";
	if ($type!="new") echo '<a href="message.php?type=new">';
	echo "发送新消息";
	if ($type!="new") echo '</a>';
	if ($type=="chat")
		echo " | 和 $touser 的聊天记录";
?>
</p>
</div>

<?php
	if ($type=="system") {
		if ($systotal==0) {
			echo '<table id="mainTable"><tr><td align="center">暂无系统消息</td></tr></table>';
			exit;
		}


		$pages=intval(ceil($systotal/10));
		$page=intval($p);
		echo '<table id="mainTable">';
		$count=count($data);
		for ($i=1;$i<$count;$i++) {
			$one=$data[$i];
			$userinfo=mainfunc(array("view"=>$one['username']));
			$userinfo=@$userinfo[0];
			$icon=translateicon($userinfo['icon']);
			$author=$one['username'];

			$type=$one['type'];
			$title=$one['title'];
			$time=date("Y-m-d H:i:s",$one['time']);
			$url=$one['url'];
			$hasread=$one['hasread'];

			echo '<tr><td class="lzltd">'."\n";
			echo '<div class="lzlicon"><img src="'.$icon.'" class="lzlicon"></div>'."\n";
			echo '<div class="lzlcontent">'."\n";
			echo '<a class="author" href="../user?name='.$author.'" target="_blank">'.$author.'</a>';
			if ($type=="reply") {
				echo '&nbsp;回复了您的帖子: <a href="'.$url.'" target="_blank">'.$title.'</a>';
			}
			else if ($type=="replylzl") {
				echo '&nbsp;评论了您在帖子 <a href="'.$url.'" target="_blank">'.$title.'</a> 中的回复';
			}
            else if ($type=="replylzlreply"){
				echo '&nbsp;评论了您在帖子 <a href="'.$url.'" target="_blank">'.$title.'</a> 的回复中的回复';
            }
			else if ($type=="at") {
				echo '&nbsp;在帖子 <a href="'.$url.'" target="_blank">'.$title.'</a> 中at了您。';
			}
			echo '<br><span class="lzltime">'.$time.'</span></div></td></tr>';
			
		}
		if ($page!=1 || $page!=$pages) {
			echo '<tr><td align="center">';
			if ($page!=1) {
				echo '<a href="message.php?type=system&p='.($page-1).'">上一页</a>';
			}
			if ($page!=1 && $page!=$pages) echo '&nbsp;&nbsp;';
			if ($page!=$pages) {
				echo '<a href="message.php?type=system&p='.($page+1).'">下一页</a>';
				
			}
			echo '</td></tr>';
		}
		echo '</table>';

?>
<?php
	}
	else if ($type=="private") {
		echo '<table id="mainTable">';
		$count=count($data);
		if ($count==1) {
			echo '<tr><td align="center">暂无私信消息往来</td></tr></table>';
			exit;
		}
		for ($i=1;$i<$count;$i++) {
			$one=$data[$i];
			$userinfo=mainfunc(array("view"=>$one['username']));
			$userinfo=@$userinfo[0];
			$icon=translateicon($userinfo['icon']);
			$author=$one['username'];
			$text=$one['text'];
			$time=date("Y-m-d H:i:s",$one['time']);
			$number=intval($one['number']);
			echo '<tr><td class="lzltd"><div class="lzlicon">';
			echo '<img src="'.$icon.'" class="lzlicon"></div>'."\n";
			echo '<div class="lzlcontent" style="margin-top:-7px">'.userhref($author);
			if ($number>0) echo '&nbsp;&nbsp;<span class="badge">'.$number.'</span>';
			echo '<span class="lzltime">'.$time."</span>";
			echo "<br><span onclick='window.location=\"message.php?type=chat&to=$author\"' style='cursor:pointer'>$text&nbsp;<span style='float:right'><a href='message.php?type=chat&to=$author' class='lzlreplybt'>查看全部</a>&nbsp;(".$one['totalnum'].")</span></span></span>";
			echo '</div></td></tr>';
		}
		echo '</table>';
?>
<?php
	}
	else if ($type=="new") {
?>
<div style="margin-top:90px;text-align:center">
	<span>发送新消息给：&nbsp;<input id="msg_to" placeholder="收件人id" style="width:100px"></span><br><br>
	<textarea id="msg_ta" style="width:400px;height:200px;font-size:13px;padding:5px;"></textarea><br><br>
	<button onclick="sendto()" id="msg_sendbt">发送</button>
</div>

<?php
	}
	else {
?>
<div class="talk">
	<div class="talk_record">
		<div id="jp-container" class="jp-container">
<?php
	$count=count($data);
	$touserinfo=mainfunc(array("view"=>$touser));
	$myuserinfo=mainfunc(array("view"=>$username));
	$hisicon=translateicon($touserinfo[0]['icon']);
	$myicon=translateicon($myuserinfo[0]['icon']);
	for ($i=1;$i<$count;$i++) {
		$one=$data[$i];
		$typed=$one['type'];
		$text=$one['text'];
		$time=formatstamp($one['time']);

		if ($typed=="send") {
			echo '<div class="talk_recordboxme">';
			echo '<div class="user"><img src="'.$myicon.'" class="lzlicon"></div>';
		}
		else {
			echo '<div class="talk_recordbox">';
			echo '<div class="user"><img src="'.$hisicon.'" class="lzlicon"></div>';
			
		}
		echo '<div class="talk_recordtextbg">&nbsp;</div>';
		echo '<div class="talk_recordtext"><pre>'.$text.'</pre><span class="talk_time">'.$time.'</span></div>';
		echo '</div>'."\n";
	}
?>
	<div class="talk_word">
		<textarea class="messages" id="msg_ta" placeholder="请输入你要发送的消息内容"></textarea>
		<br>
		<input class="talk_send" type="button" title="发送" value="发送" onclick="sendto()"/>
	</div>
</div>
<?php }?>
<script>
<?php
if ($type=="new") {
?>
function sendto() {
	var user=$('#msg_to').val();
	var text=$('#msg_ta').val();
	if (user=="") {alert("ID不能为空！");$('#msg_to').focus();return;}
	if (text=="") {alert("内容不能为空！");$('#msg_ta').focus();return;}
	confirmsendto(user,text);	
}
<?php
}
else {
?>
function sendto() {
	var user="<?php echo $touser;?>";
	var text=$('#msg_ta').val();
	if (text=="") {alert("内容不能为空！");$('#msg_ta').focus();return;}
	confirmsendto(user,text);
}
<?php }?>
function confirmsendto(to,text) {
	$.post("../message/",{target:to,text:text},
		function (results) {
		var result=JSON.parse(results);
		if(result.code==0){
			<?php
				if ($type=="new") {
					echo 'window.location="message.php?type=private"';
				}
				else {
					echo 'window.location.reload();';
				}
			?>
		}else{
			alert(result.msg);
		}
	});
}
<?php
	if ($type=="chat") echo 'window.scrollTo(0,99999)';
?>

</script>

</body>
</html>
