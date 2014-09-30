<?php
	include("../lib/mainfunc.php");
	$bid=@$_GET['bid'];
	$tid=@$_GET['tid'];
	$page=@$_GET['p'];
	$see_lz=@$_GET['see_lz'];
	$users=getuser();
	$currentuser=$users['username'];
	if(!$page) $page=1;
	if(!$bid) $bid=1;
	if(!$tid) $tid=1;
	$data=mainfunc(array("bid"=>$bid,"tid"=>$tid,"p"=>$page,"see_lz"=>$see_lz),null);
	$tdata=mainfunc(array("bid"=>$bid,"tid"=>$tid,"ask"=>"tidinfo"));
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

	$title=count($data)>0?$data[0]['title']:"没有这个帖子= =";
	$lztitle="";if($see_lz!="") $lztitle="（只看楼主）&nbsp;&nbsp;";
	function generateattach($name,$size,$price,$auth,$id,$free,$count){
		$extension=substr($name, strrpos($name, ".")+1);
		$supportedExt=explode(" ", "bmp csv gif html jpg jpeg key mov mp3 mp4 numbers pages pdf png rtf tiff txt zip ipa ipsw doc docx ppt pptx xls avi wmv mkv mts");
		$imgsrc="file";
		if(in_array($extension, $supportedExt)){
			$imgsrc=$extension;
		}
		$imgsrc="../assets/fileicons/".$imgsrc.".png";
		$s='<div class="attachdark" onclick="attachdl(\''.$name.'\','.$price.','.$auth.','.$id.','.($free?"true":"false").')">';
		$s=$s.'<img src="'.$imgsrc.'" class="fileicon">';
		$s=$s.'<div class="fileinfo"><span class="filename">'.$name.'<br></span>';
		$s=$s.'<span class="sub">'.packSize($size).'<br>';
		if($free){
			$s=$s.'您可以免费下载';
		}else{
			if($price==0){
				$s=$s.'免费';
			}else{
				$s=$s.'售价：'.$price."积分";
			}
		}
		if($count==0){
			$s=$s."（暂时无人下载）";
		}else{
			$s=$s."（下载次数：".$count."）";
		}
		$s=$s."</span>";
		$s=$s.'</div></div>';
		return $s;
	}
	
	function packSize($size){
		if($size<1024) return $size."字节";
		if($size<1024*1024) return round($size/1024,1)."KB";
		if($size<1024*1024*1024) return round($size/1024/1024,1)."MB";
		return round($size/1024/1024/1024,1)."GB";
	}
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
		echo("<a href='./?bid=$bid&tid=$tid&p=1'>".$title."</a>&nbsp;&gt;&nbsp;");
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
			echo("欢迎您，".$currentuser);
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
$pages= ceil((intval($tdata['reply'])+1)/12);

@$page= intval($_GET['p']);
if($page<1) $page=1;
if($page>1){
	echo(packjump(1,"首页"));
	echo packjump($page-1,"上一页");
}
$start=$page-4;
if($start<1) $start=1;
$end=$start+9;
if($end>$pages) $end=$pages;
for($i=$start;$i<=$end;$i++){
	echo(packjump($i,$i==$page?"plain":$i));
}
if($page<$pages){
	echo(packjump($page+1,"下一页"));
	echo(packjump($pages,"尾页"));
}
echo("&nbsp;跳转到：<select onchange='jump(this.value);'>");
$a=array();
$counter=0;
for($i=$page;$i>0;){
	$counter++;
	array_unshift($a, $i);
	if($counter<50) $i--;
	else if($counter<100) $i-=10;
	else if($counter<150) $i-=100;
	else if($counter<200) $i-=1000;
	else break;
}
if($a[0]!=1) array_unshift($a, 1);
$counter=0;
for($i=$page+1;$i<=$pages;){
	$counter++;
	array_push($a, $i);
	if($counter<50) $i++;
	else if($counter<100) $i+=10;
	else if($counter<150) $i+=100;
	else if($counter<200) $i+=1000;
	else break;
}
if($a[count($a)-1]!=$pages) array_push($a, $pages);
for($i=0;$i< count($a);$i++){
	if($a[$i]==$page){
		echo("<option value='".$a[$i]."' selected='true'>".$a[$i]."</option>\n");
	}else{
		echo("<option value='".$a[$i]."'>".$a[$i]."</option>\n");
	}
}
echo("</select>");
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
	#$translated=$floor['text'];
	$translatedforquote=translateforquote($floor['text'],$floor['ishtml']=="YES");
	#echo("<div class='textblock' id='floor$i'>$translated</div>\n");
	print "<div class='textblock' id='floor$i'>$translated</div>\n";
	if($floor['attachs']){
		echo('<span id="attachtipdark">本帖包含如下的附件：</span>');
		echo("<div class='attachsdark'>\n");
		$atts=explode(" ", $floor['attachs']);
		foreach($atts as $value){
			$nowa=mainfunc(array("ask"=>"attachinfo","id"=>$value));
			$nowa=$nowa[0];
			echo generateattach($nowa['name'],$nowa['size'],$nowa['price'],$nowa['auth'],$nowa['id'],$nowa['isAuthor']=='YES'||$nowa['hasPurchased']=='YES',$nowa['count']);
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
			echo('<div class="lzlcontent">'.userhref($author).': '.$lzl[$j]['text'].'<br>');
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
		echo "<span class='oshint'>来自于IOS客户端</span>";
	}
	if($right>=1|| $floor['author']==$currentuser){
		echo("<a class='replylzlbt' href='javascript:deletepid(".$floor['pid'].");'>删除</a>\n");
		echo("<a class='replylzlbt' href='../editpid?bid=$bid&tid=$tid&pid=".$floor['pid']."'>编辑</a>\n");
	}
	if ($canreply) {
	echo("<a class='replylzlbt' href='javascript:toggle".(count($lzl)==0?"reply":"slide")."($i);'>回复</a>\n");
	echo("<a class='message reply' href='javascript:quote(\"".$floor['author']."\",$i)'><img src='reply.png' height='17px' style='position:relative;top:3px;'>&nbsp;引用</a>");
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
$pages= ceil((intval($tdata['reply'])+1)/12);
@$page= intval($_GET['p']);
if($page<1) $page=1;

if($page>1){
	echo(packjump(1,"首页"));
	echo packjump($page-1,"上一页");
}
$start=$page-4;
if($start<1) $start=1;
$end=$start+9;
if($end>$pages) $end=$pages;
for($i=$start;$i<=$end;$i++){
	echo(packjump($i,$i==$page?"plain":$i));
}
if($page<$pages){
	echo(packjump($page+1,"下一页"));
	echo(packjump($pages,"尾页"));
}
echo("&nbsp;跳转到：<select onchange='jump(this.value);'>");
$a=array();
$counter=0;
for($i=$page;$i>0;){
	$counter++;
	array_unshift($a, $i);
	if($counter<50) $i--;
	else if($counter<100) $i-=10;
	else if($counter<150) $i-=100;
	else if($counter<200) $i-=1000;
	else break;
}
if($a[0]!=1) array_unshift($a, 1);
$counter=0;
for($i=$page+1;$i<=$pages;){
	$counter++;
	array_push($a, $i);
	if($counter<50) $i++;
	else if($counter<100) $i+=10;
	else if($counter<150) $i+=100;
	else if($counter<200) $i+=1000;
	else break;
}
if($a[count($a)-1]!=$pages) array_push($a, $pages);
for($i=0;$i< count($a);$i++){
	if($a[$i]==$page){
		echo("<option value='".$a[$i]."' selected='true'>".$a[$i]."</option>\n");
	}else{
		echo("<option value='".$a[$i]."'>".$a[$i]."</option>\n");
	}
}
echo("</select>");
function packjump($p,$text){
	$lz="";
	if (@$_GET['see_lz']!="")
		$lz="&see_lz=1";
	if($text=="plain") return "<span class='page'>$p</span>";
	return "<a class='page' href='../content?p=$p&bid=".$_GET['bid']."&tid=".$_GET['tid']."$lz'>$text</a>";
}
?>

			</div>
		</div>
<?php
if ($currentuser!="") {
if ($canreply) {echo '
		<div class="editor" id="editor">
			<div id="edi_bar"></div>
			<div id="edi_content" onfocus="starttimer();" onblur="stoptimer();"></div>
			<br>
';
if ($rights>=1 || $star>=3)	echo '
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
	
	<div id="overlay">
		<div>
			为此附件填写阅读权限与下载售价：<br><br>
        	阅读权限：<input type="number" value="0" style="width:40px" id="auth">
        	<span class='tip'>&nbsp;积分不少于此数值才能浏览附件</span><br>
        	下载售价：<input type="number" value="0" style="width:40px" id="price">
        	<span class='tip'>&nbsp;每位下载者需向您支付的积分数</span><br><br>
        	<input type="button" value="&nbsp;好&nbsp;" onclick="priceok();" />
		</div>
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
<script type="text/javascript">
var myNicEditor = new nicEditor({fullPanel : true});
myNicEditor.setPanel('edi_bar');
myNicEditor.addInstance('edi_content');
var attachs=[];
var unusedattachs=[];
<?php
$result=mainfunc(array("ask"=>"unusedattachinfo"));
for($i=1;$i< count($result);$i++){
	echo("unusedattachs.push({
	name:'".$result[$i]['name']."',
	size:'".$result[$i]['size']."',
	price:'".$result[$i]['price']."',
	id:'".$result[$i]['id']."',
	auth:'".$result[$i]['auth']."'
	});\n");
}
?>
refreshAttach();
$(window).load(function() {
	$(".textblock").each(function() {
		var text=$(this);
		text.find("img").each(function() {
			var img=$(this);
			var width=parseInt(img.css("width"));
			width=(width>700)?700:width;
			img.css("width",width);
		});
	});
});
function deletepid(pid){
	if(confirm("您确定要删除此楼层么？")){
		//window.open("../delete/?bid="+bid+"&tid="+tid+"&pid="+pid+"&p="+page, "_self");
		$.post("../delete/",{
			ask:"delpid",
			bid:bid,
			tid:tid,
			pid:pid
			},function(data) {
				var x=parseInt(data);
				if (x==0) {window.location=window.location.href;}
				else {alert("错误："+data);}
			}
		);
	}
}
function deletelzlreply(fid,id){
	if(!confirm("您确定要删除这一回复？")) return;
	$.post("../deletelzl/",{fid:fid,id:id},function(text){
		var result=JSON.parse(text);
		if(result.code==0){
			window.location.reload();
		}else{
			alert(result.msg);
		}
	});
}
function insertlzlreply(id,author){
	//var wb=document.getElementById("textarea"+id);
	var wb=$('#textarea'+id);
	//document.getElementById("writeboard"+id).style.display="block";
	$('#writeboard'+id).show();
	wb.focus();
	//wb.value="回复 @"+author+": ";
	wb.val("回复 @"+author+": ");
}
function dolzlreply(id,fid,sender){
	//var text=document.getElementById("textarea"+id).value;
	var text=$('#textarea'+id).val();
	sender.disabled=true;
	sender.innerHTML="正在发布...";
	//ajaxWithCallback("../postlzl/","fid="+fid+"&text="+encodeURI(text),function(text){
	$.post("../postlzl/",{fid:fid,text:text},function(text) {
		sender.disabled=false;
		sender.innerHTML="发表";
		var result=JSON.parse(text);
		if(result['code']==0){
			window.location.reload();
		}else{
			alert(result.msg);
		}		
	});
}
function togglereply(id){
	/*
	if(document.getElementById("lzl"+id).style.display=="block"){
		document.getElementById("lzl"+id).style.display="none";
	}else{
		document.getElementById("lzl"+id).style.display="block";
	}
	*/
	$('#lzl'+id).toggle();
}
function toggleslide(id){
	/*
	if(document.getElementById("writeboard"+id).style.display=="block"){
		document.getElementById("writeboard"+id).style.display="none";
	}else{
		document.getElementById("writeboard"+id).style.display="block";
	}
	*/
	$('#writeboard'+id).toggle();
}
function showreply(id){
	//document.getElementById("lzl"+id).style.display="block";
	//document.getElementById("writeboard"+id).style.display="block";
	$('#lzl'+id+',#writeboard'+id).show();
}
function hidereply(id){
	//document.getElementById("lzl"+id).style.display="none";
	//document.getElementById("writeboard"+id).style.display="none";
	$('#lzl'+id+',#writeboard'+id).hide();
}

function gotobbs(tbid){
	//window.open("../main?bid="+tbid, "_self");
	window.location="../main?bid="+tbid;
}
function showmenu(){
	//document.getElementById("popover").style.visibility="visible";
	$('#popover').show();
}
function hidemenu(){
	//document.getElementById("popover").style.visibility="hidden";
	$('#popover').hide();
}
function goback(){
	gotobbs(bid);
}
function seelz() {
	window.location="./?bid="+bid+"&tid="+tid<?php if (@$_GET['see_lz']=="") echo '+"&see_lz=1"';?>;
}
function jump(page){
	window.location="./?bid="+bid+"&tid="+tid+"&p="+page<?php if (@$_GET['see_lz']!="") echo '+"&see_lz=1"'; ?>;
}
function refreshAttach(){
	if(attachs.length==0){
		//document.getElementById("attachtip").style.display="none";
		//document.getElementById("attachs").style.display="none";
		$('#attachtip,#attachs').hide();
	}else{
		//document.getElementById("attachtip").style.display="block";
		//document.getElementById("attachs").style.display="block";
		$('#attachtip,#attachs').show();
	}
	if(unusedattachs.length==0){
		//document.getElementById("unusedattachtip").style.display="none";
		//document.getElementById("unusedattachs").style.display="none";
		$('#unusedattachtip,#unusedattachs').hide();
	}else{
		//document.getElementById("unusedattachtip").style.display="block";
		//document.getElementById("unusedattachs").style.display="block";
		$('#unusedattachtip,#unusedattachs').show();
	}
	var s="";
	for(var i=0;i<attachs.length;i++){
		var a=attachs[i];
		s+=generateattach(a['name'],a['size'],a['price'],a['id'],false);
	}
	document.getElementById("attachs").innerHTML=s;
	var s2="";
	for(var i=0;i<unusedattachs.length;i++){
		var a=unusedattachs[i];
		s2+=generateattach(a['name'],a['size'],a['price'],a['id'],true);
	}
	//document.getElementById("unusedattachs").innerHTML=s2;
	$('#unusedattachs').html(s2);
}
function attach(){
	//document.getElementById("file").click();
	$('#file').click();
}
function fileselected(){
	//if(document.getElementById("file").value){
	if ($('#file').val()!="") {
		showoverlay();
	}
}
function appendattach(id){
	for(var i=0;i<unusedattachs.length;i++){
		if(unusedattachs[i]['id']==id){
			attachs.push(unusedattachs[i]);
			unusedattachs.splice(i,1);
			break;
		}
	}
	refreshAttach();
}
function removeattach(id){
	for(var i=0;i<attachs.length;i++){
		if(attachs[i]['id']==id){
			unusedattachs.push(attachs[i]);
			attachs.splice(i,1);
			break;
		}
	}
	refreshAttach();	
}
function delattach(id){
	if(confirm("您确定要彻底删除此附件么？")){
		//document.getElementById("waitinggif").style.visibility="visible";
		$('#waitinggif').show();
		//var r=new XMLHttpRequest();
		//r.open("GET", "../delattach/?id="+id , true);
		//r.send();
		//r.onreadystatechange=function(){
		//	if(r.readyState==4&&r.status==200){
		$.post("../delattach/",{id:id},function(r) {	
			//var result=JSON.parse(r.responseText);
			var result=JSON.parse(r);
			if(result.code==0){
				for(var i=0;i<unusedattachs.length;i++){
					if(unusedattachs[i]['id']==id){
						unusedattachs.splice(i,1);
						break;
					}
				}
				document.getElementById("waitinggif").style.visibility="hidden";
				refreshAttach();
			}else{
				alert(result.msg);
			}
		});	
	}
}
function generateattach(filename,size,price,aid,useforappend){
	var extension=filename.slice(filename.lastIndexOf(".")+1);
	var supportedExt="bmp csv gif html jpg jpeg key mov mp3 mp4 numbers pages pdf png rtf tiff txt zip ipa ipsw doc docx ppt pptx xls avi wmv mkv mts".split(" ");
	var imgsrc="file";
	if(supportedExt.indexOf(extension)!=-1){
		imgsrc=extension;
	}
	imgsrc="../assets/fileicons/"+imgsrc+".png";
	var s='<div class="attach">';
	s+='<img src="'+imgsrc+'" class="fileicon">';
	s+='<div class="fileinfo"><span class="filename">'+filename+'<br></span>';
	s+='<span class="sub">'+packSize(size)+'<br>';
	//s+='售价：'+price+"积分</span>";
	if(useforappend){
		s+='<a href="javascript:appendattach('+aid+');">引用</a>&nbsp;&nbsp;';
		s+='<a href="javascript:delattach('+aid+');">彻底删除</a>';
	}else{
		s+='<a href="javascript:removeattach('+aid+');">删除</a>';
	}
	s+='</div></div>';
	return s;
}
function packSize(size){
	if(size<1024) return size+"字节";
	if(size<1024*1024) return (size/1024).toFixed(1)+"KB";
	if(size<1024*1024*1024) return (size/1024/1024).toFixed(1)+"MB";
	return (size/1024/1024/1024).toFixed(1)+"GB";
}
function priceok(){
	var price=parseInt(document.getElementById("price").value);
	var auth=parseInt(document.getElementById("auth").value);
	if(price<0||price>200){
		alert("请填写一个有效的售价（0-200）");
		return;
	}
	if(auth<0){
		alert("请填写一个有效的阅读权限（>0）");
		return;
	}
	document.getElementById("overlay").style.visibility="hidden";
	var fileObj=document.getElementById("file").files[0];
	var FileController = "../attach/";
	var form = new FormData();
	var price=document.getElementById("price").value;
	var auth=document.getElementById("auth").value;
    form.append("auth", auth);
    form.append("price", price);
    form.append("file", fileObj);
    var xhr = new XMLHttpRequest();
	xhr.open("post", FileController, true);
	xhr.onload = function () {
		var prob=document.getElementById("progress");
		if(prob.style.visibility!="hidden") prob.style.visibility="hidden";
		//alert("response:"+xhr.responseText+" code:"+xhr.status);
		try{
			var result=JSON.parse(xhr.responseText);
			if(result.code==0){
				attachs.push({name:fileObj.name,size:fileObj.size,price:price,id:result.msg});
				refreshAttach();
			}else{
				alert("附件上传失败："+result.msg+" code:"+result.code);
			}
		}catch(e){
			alert("出bug了");
		}
	};
	function onprogress(evt){
		var prob=document.getElementById("progress");
		if(prob.style.visibility!="visible") prob.style.visibility="visible";
		prob.value=evt.loaded;
		prob.max=evt.total;
		prob.label=(evt.loaded/evt.total*100).toFixed(1)+"%";
	}
	xhr.upload.addEventListener("progress", onprogress, false);
	xhr.send(form);
}
function attachdl(name,price,auth,id,free){
	if(score==-1){
		alert("请先登录或注册后下载附件！");
		return;
	}
	if(free){
		reallyattachdl(id);
		return;
	}
	if(score<auth){
		alert("您无权下载此附件，此附件要求积分不少于"+auth+"，而您拥有"+score+"个积分。加油攒积分吧！");
		return;
	}
	if(price!=0){
		if(!confirm("您确定要以"+price+"积分（您拥有"+score+"个积分）的价格购买 "+name+" 么？购买后您将可以永久免费下载此附件。")){
			return;
		}
	}
	reallyattachdl(id);
}
function reallyattachdl(id){
	window.open("../download/?id="+id,"_blank");
}
/*
function insertattach(id){
	for(var i=0;i<attachs.length;i++){
		if(attachs[i].id==id){
			insertHTML(generateattach(attachs[i]['name'],attachs[i]['size'],attachs[i]['price'],attachs[i]['id'],true));
			break;
		}
	}
}
*/
function showoverlay(){
	//document.getElementById("overlay").style.visibility="visible";
	$('#overlay').show();
}
function doreply(){
	var token=getcookie("token");
	if(!token){
		alert("尚未登录！请登陆后发帖！");
		return;
	}
	//var content=document.getElementById("edi_content").innerHTML;
	var content=$('#edi_content').html();
	content=content.replace(/&/g, "&amp;");
	if(content==""||content=="<br>"){
		alert("请填写回复内容！");
		return;
	}
	//document.getElementById("fm_title").value="Re: <?php echo $tdata['title']; ?>";
	//document.getElementById("fm_text").value=content;
	//document.getElementById("fm_token").value=token;
	//$('#fm_title').val("Re: <?php echo $tdata['title']; ?>");
	//$('#fm_text').val(content);
	//$('#fm_token').val(token);
	var bts=document.getElementsByName("sign");
	var sig;
	for(var i=0;i<bts.length;i++){
		if(bts[i].checked){
			sig=bts[i].value;
		}
	}
	//document.getElementById("fm_sig").value=sig;
	//$('#fm_sig').val(sig);
	var s="";
	for(var i=0;i<attachs.length;i++){
		s+=attachs[i]['id']+" ";
	}
	if(s) s=s.slice(0,s.length-1);
	//document.getElementById("fm_attachs").value=s;
	//document.getElementById("fm").submit();

	$.post("../post/",{
		bid:$('#fm_bid').val(),
		tid:$('#fm_tid').val(),
		token:token,
		title:"Re: <?php echo $tdata['title']; ?>",
		text:content,
		sig:sig,
		attachs:s
		},function(data) {
			var x=parseInt(data);
			if (x==0) {window.location.reload();}
			else alert("错误："+data);
		}
	);


}
function quote(who,num){
	var data=$('#floor'+num).html();

	// remove all the quote area
	$('#floor'+num).find('.quotel').each(function() {
		$(this).remove();
	});
	var what=$('#floor'+num).html();
	$('#floor'+num).html(data);

	if (what.length>=133)
		what=what.substr(0,130)+"...";
	
	var temp=document.createElement("div");
	temp.innerHTML=what;
	var divs=temp.getElementsByTagName("div");
	for(var i=0;i<divs.length;i++){
		if(divs[i].className=="quotel"){
			divs[i].parentNode.removeChild(divs[i]);
		}
	}
	what=temp.innerHTML;
	
	insertHTML("[quote="+who+"]"+what+"[/quote]");

}
var temptarget;
function sendMessageTo(target){
	$('#msg_overlay').show();
	$('#msg_ta').focus();
	$('#msg_to').html(target);
	temptarget=target;
}
function msg_send(){
	$('#msg_sendbt,#msg_cancelbt').prop("disabled",true);
	$('#msg_sendbt').html("正在发送...");
	$.post("../message/",{target:temptarget,text:$('#msg_ta').val()},
		function (text) {
		var result=JSON.parse(text);
		if(result.code==0){
			alert("发送成功！");
			$('#msg_ta').val("");
			$("#msg_overlay").hide();
		}else{
			alert(result.msg);
		}
		$("#msg_sendbt,#msg_cancelbt").prop("disabled",false);
		$('#msg_sendbt').html("发送");
	});
}
function msg_cancel(){
	var text=$('#msg_ta').val();
	if(!text|| confirm("您确定放弃编辑消息？")){
		//document.getElementById("msg_ta").value="";
		$('#msg_overlay').hide();
		$('#msg_ta').val("");
	}
}

function URLdecode(str) {
        var ret = "";
        for(var i=0;i<str.length;i++) {
                var chr = str.charAt(i);
                if(chr == "+") {
                        ret += " ";
                }else if(chr=="%") {
                        var asc = str.substring(i+1,i+3);
                        if(parseInt("0x"+asc)>0x7f) {
                                ret += decodeURI("%"+ str.substring(i+1,i+9));
                                i += 8;
                        }else {
                                ret += String.fromCharCode(parseInt("0x"+asc));
                                i += 2;
                        }
                }else {
                        ret += chr;
                }
        }
        return ret;
}

function insertHTML(html){ 
	var dthis=document.getElementById("edi_content");
/*
	dthis.focus();
	document.execCommand('insertHTML', false, html);
	return;
*/
	
	var sel, range;
	if (window.getSelection){ 
		// IE9 and non-IE 
		dthis.focus();
		sel = window.getSelection(); 
		if (sel.getRangeAt && sel.rangeCount) { 
			range = sel.getRangeAt(0); 
			range.deleteContents(); 
			var el = document.createElement('div'); 
			el.innerHTML = html; 
			var frag = document.createDocumentFragment(), node, lastNode; 
			while ( (node = el.firstChild) ){ 
				lastNode = frag.appendChild(node); 
			}
			range.insertNode(frag); 
			if (lastNode) { 
				range = range.cloneRange(); 
				range.setStartAfter(lastNode); 
				range.collapse(true); 
				sel.removeAllRanges(); 
				sel.addRange(range); 
			} 
		} 
	}else if (document.selection && document.selection.type !='Control') { 
		dthis.focus(); //在非标准浏览器中 要先让你需要插入html的div 获得焦点 
		ierange= document.selection.createRange();//获取光标位置 
		ierange.pasteHTML(html); //在光标位置插入html 如果只是插入text 则就是fus.text="..." 
		dthis.focus(); 
	} 
} 
function starttimer() {
}
function stoptimer() {
}
</script>
</body>
</html>
