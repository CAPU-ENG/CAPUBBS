<?php
	include("../lib/mainfunc.php");
	include "../../config.php";
	date_default_timezone_set('Asia/Shanghai');
	$users=getuser();
	$username=$users['username'];
	$bid=@$_GET['bid'];
	if(!$bid) $bid=1;
	$page=intval(@$_GET['p']);
	$extr=@$_GET['extr'];
	if($page<1) $page=1;
	$boardinfo=mainfunc(array(
	"ask"=>"bbsinfo",
	"bid"=>$bid));
	if (@$boardinfo[0]) $boardinfo=$boardinfo[0];
	else $boardinfo=array();
	$xx="";if ($extr) $xx="（精品区）";
?>
<html>
<head>
<meta charset="utf-8">
<meta name="apple-itunes-app" content="app-id=826386033">
<title><?php echo $boardinfo['bbstitle'];?></title>
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
<?php
echo("<h2>".$boardinfo['bbstitle'].$xx."</h2>");
echo("<span>版主：".userhref($boardinfo['m1']).userhref($boardinfo['m2']).userhref($boardinfo['m3']).userhref($boardinfo['m4'])."</span><br>");
echo("<span>主题数：".$boardinfo['newpost']."/".$boardinfo['topics']." 新回复：".$boardinfo['newreply']."</span>");

$totalnumber=intval($boardinfo['topics']);
if ($extr) $totalnumber=intval($boardinfo['extr']);
$need=intval($boardinfo['need']);
$infos=mainfunc(array(
"bid"=>$bid,
"p"=>$page,"extr"=>$extr));
$bbsdata=mainfunc(array("ask"=>"bbsinfo"));

echo("<script type='text/javascript'>");
echo("var bid=$bid;");
echo("</script>");

echo("<script type='text/javascript'>var page=$page;</script>");
?>

<div class="user">
<?php
	$right=intval($users['rights']);$star=-1;
	$rights=mainfunc(array("ask"=>"rights","bid"=>$bid));
	$rights=$rights[0]['code'];
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
	$nowurl=$_SERVER["PHP_SELF"]. "?".$_SERVER["QUERY_STRING"];
	$nowurl=urlencode($nowurl);
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
<form method="post" id="fm" action="../post/">
	<input type="hidden" name="bid" id="fm_bid" value="<?php echo($boardinfo['bid']); ?>">
	<input type="hidden" name="tid" id="fm_tid" value="-1">
	<input type="hidden" name="icon" value="1" id="fm_icon">
	<input type="hidden" name="token" id="fm_token">
	<input type="hidden" name="title" id="fm_title">
	<input type="hidden" name="text" id="fm_text">
	<input type="hidden" name="sig" id="fm_sig">
	<input type="hidden" name="attachs" id="fm_attachs">
</form>

</div>
		<div class="navigation">
		<div class="back" onclick="goback();"><span style="margin-left:32px;"><b>返回</b></span></div>
		<span style="float:left;margin-left:20px;position:relative;"> 
		<?php
		echo("<a href='../index/' onmouseover='showmenu();'>CAPUBBS</a>&nbsp;&gt;&nbsp;");
		echo("<a href='./?bid=$bid&p=1'>".$boardinfo['bbstitle'].$xx."</a>&nbsp;&gt;&nbsp;");
		echo("<span>第".$page."页</span>&nbsp;");
		if ($extr) echo "<a href='./?bid=$bid&p=1' style='margin-left:50px'>查看全部</a>";
		else echo "<a href='./?bid=$bid&p=1&extr=1' style='margin-left:50px'>查看精品区</a>";

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
		</span>
		</div>
<?php
if($rights>=1){
	echo('<div style="width:80%;margin-left:10%"><a href="javascript:manage();">管理本版</a></div>');
}
?>

<table class="searchArea">
<tr>
<td align='left' style="text-align:left;line-height:30px">
<div class="searchLogo"></div>
<form action="../search/" method="post" target='_blank'>
<input type="text" name="keyword" class="search" placeholder="本版内搜索" style="margin-right: 4px;"><select name="type" style="margin-right: 4px;">
<option selected value="thread">搜索帖子标题</option>
<option value="post">搜索帖子正文</option>
</select><script>
function search_time_change() {
	let now = new Date();
	let last = parseInt($("#search_range").val());
	let currentYear = now.getFullYear();
	let currentMonth = now.getMonth()+1;
	let currentDay = now.getDate();
	let starttime = new Date(currentYear-last, currentMonth-1, currentDay);
	let endtime = new Date(currentYear, currentMonth-1, currentDay);
	$("#starttime").val(starttime.getFullYear()+"-"+(starttime.getMonth()+1)+"-"+starttime.getDate());
	$("#endtime").val(endtime.getFullYear()+"-"+(endtime.getMonth()+1)+"-"+endtime.getDate());
}
</script><select id="search_range" name="time" onchange="search_time_change();" style="margin-right: 4px;">
<option selected value="1">近一年</option>
<option value="2">近两年</option>
<option value="2000">不限</option>
</select><input type="hidden" name="bid" value="<?php echo $bid; ?>"><input type="hidden" name="show" value="" id='search_show'><input type="submit" value="搜索" style="margin-right: 4px;"><input type="button" onclick="$('#search_more').show();$('#search_show').val('1');$(this).hide();" value="更多搜索选项">
<br>
<span style='display:none;margin-top:5px' id='search_more'>
起始时间：<input id="starttime" type="text" name="starttime" class="search" style="padding-left:5px;width:90px" value="<?php $currentDate = date('Y-m-d'); echo date('Y-m-d', strtotime('-1 year', strtotime($currentDate)));?>">
&nbsp;&nbsp;终止时间：<input id="endtime" type="text" name="endtime" class="search" style="padding-left:5px;width:90px" value="<?php echo date('Y-m-d',time());?>">
&nbsp;&nbsp;作者：<input type="text" name="author" class="search" style="padding-left:5px;width:130px" placeholder="不限制则不填" value="">
</span>
</form>
</td>
<?php
	$getnums=mainfunc(array("ask"=>"getnum"));
	$getnums=$getnums[0];
?>
<td style='text-align:right;line-height:22px'>
<?php
	if ($extr)
		echo '本版面精品数：<span style="color:red">'.$totalnumber.'</span>';
	else
		echo '本版面主题数：<span style="color:red">'.$totalnumber.'</span>';
?> 今日新主题：<span style="color:red"><?php echo $boardinfo['newpost'];?></span> 今日新帖：<span style="color:red"><?php echo $boardinfo['newreply'];?></span><br>
<a href="../sign/?view=<?php echo date("Y-m-d",time());?>" target="_blank">今日签到</a>： <span style="color:red"><?php echo $getnums['sign'];?></span> &nbsp;<a href="../online/?bid=<?php echo $bid;?>" target='_blank'>当前在线</a>： <span style="color:red"><?php echo $getnums['online'];?></span>&nbsp;（最高 <span style="color:red"><?php echo $getnums['maxnum'];?></span> 人于 <?php echo $getnums['time'];?>）
</td>
</tr>
</table>
<?php
		if (intval($bid)==1&& $username=="") {
			echo '<table></div>
				<div class="editip" id="editip">
				<span class="editip">您需要&nbsp;<a href="../login?from='.$nowurl.'">登录</a>&nbsp;后才能查看本版面；没有账号？&nbsp;<a href="../register">现在注册</a>&nbsp;</span>
				</div> ';
			echo '</body></html>';
			exit;
		}


?>

<div class="mainandbts">
<table class="main" id="table">
<?php
	if(count($infos)==0){
		echo("<tr><td>本版面当前还没有主题</td></tr>");
	}else{
		echo("<tr class='head'><th>文章标题</th><th>作者</th><th>回复数/查看数</th><th>最后回复</th></tr>");
		$counter=0;
		foreach($infos as $info){
			$counter++;
			$tid=@$info['tid'];
			if(!$tid) continue;
			$decorator=array();
			if($info['top']=="1"){
				array_push($decorator, "top.png");
			}
			if($info['extr']=="1"){
				array_push($decorator, "extr.png");
			}
			if($info['locked']=="1"){
				array_push($decorator, "lock.png");
			}
			$decoratorstr="";
			foreach($decorator as $item){
				$decoratorstr=$decoratorstr."<img src='$item' class='decorator'>&nbsp;";
			}
			$title=$info['title'];
			$author=$info['author'];
			$postdate=$info['postdate'];
			$reply=$info['reply'];
			$click=$info['click'];
			$replyer=$info['replyer'];
			$prestr="&nbsp;<img src='icon.png' class='decorator'>";
			echo("<tr class='content ".($counter%2==0?"even":"odd")."'>\n");
			echo("<td style='text-align:left;'>&nbsp;$prestr&nbsp;<a href='../content/?bid=$bid&tid=$tid&p=1'>$title</a>&nbsp;$decoratorstr</td>\n");
			echo("<td>".userhref($author)."<br><span class='date'>$postdate</span></td>\n");
			echo("<td>$reply / $click</td>\n");
			echo("<td>".userhref($replyer?$replyer:$author)."<br><span class='date'>".formatstamp($info['timestamp'])."</span></td>\n</tr>\n");
		}
	}	
?>
</table>

<table class="bts" id="tablebts">
<tr class="head"><th>操作帖子</th></tr>
<?php
foreach($infos as $info){
	$tid=@$info['tid'];
	if(!$tid) continue;
	echo("<tr class='content'><td>");
	if($info['extr']=="1"){
		echo("<a href='javascript:settid(\"extr\",$tid);'>取消加精</a>");
	}else{
		echo("<a href='javascript:settid(\"extr\",$tid);'>加精</a>");
	}
	echo("&nbsp;");
	if($info['top']=="1"){
		echo("<a href='javascript:settid(\"top\",$tid);'>取消置顶</a>");
	}else{
		echo("<a href='javascript:settid(\"top\",$tid);'>置顶</a>");
	}
	echo("&nbsp;");
	if($info['global_top']=="1"){
		echo("<a href='javascript:settid(\"global_top_action\",$tid);'>取消首页置顶</a>");
	}else{
		echo("<a href='javascript:settid(\"global_top_action\",$tid);'>首页置顶</a>");
	}
	echo("&nbsp;");
	if($info['locked']=="1"){
		echo("<a href='javascript:settid(\"lock\",$tid);'>解锁</a>");
	}else{
		echo("<a href='javascript:settid(\"lock\",$tid);'>锁定</a>");
	}
	echo("&nbsp;");
	echo("<a href='javascript:deltid($tid);'>删除</a>");
	if($rights>=2) {
		echo "&nbsp;";
		echo "<a href='javascript:move($tid);'>移动</a>";
	}
	echo("</td></tr>");
	
}
?>
</table>
</div>
<br>
<div class="pagecontrol">

<?php
$pages= ceil($totalnumber/25);
if($page>1){
	echo(packjump($bid,1,"首页",$extr));
	echo packjump($bid,$page-1,"上一页",$extr);
}
$start=$page-4;
if($start<1) $start=1;
$end=$start+9;
if($end>$pages) $end=$pages;
for($i=$start;$i<=$end;$i++){
	echo(packjump($bid,$i,$i==$page?"plain":$i,$extr));
}
if($page<$pages){
	echo(packjump($bid,$page+1,"下一页",$extr));
	echo(packjump($bid,$pages,"尾页",$extr));
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
function packjump($bid,$p,$text,$extr){
	if($text=="plain") return "<span class='page'>$p</span>";
	$str="<a class='page' href='./?p=$p&bid=$bid";
	if ($extr) $str=$str."&extr=1";
	$str=$str."'>$text</a>";
	return $str;
}
?>
<?php
if ($username!="") {

if ($right<=1 && $star<$need) echo '
		<div class="editip" id="editip">
		<span class="editip">在本版发帖或回复至少需要 '.$need.' 星</span>
		</div>
';
else {

echo '
		<div class="editor" id="editor">
			<input type="text" class="title" placeholder="帖子标题" id="raw_title">
			<div id="edi_bar"></div>
			<div id="edi_content" onfocus="editorFocus();" onblur="editorBlur();"></div>
			<br>
			<progress max="100" value="20" id="progress"></progress>
';
if ($star>=0 || $right>=0) echo '
			<div id="edi_attach" onclick="attach();">添加附件</div>
			<input type="file" id="file" style="display:none;" onchange="fileselected();">
';
echo '			选择签名档：
			<input type="radio" name="sign" value="0">不使用
			<input type="radio" name="sign" value="1" checked>1
			<input type="radio" name="sign" value="2">2
			<input type="radio" name="sign" value="3">3

			<div id="edi_submit" onclick="doreply();">发表帖子</div>
			<br><br><br>
			<span id="attachtip" style="display:none;">本帖包含的附件：</span>
			<div class="attachs" id="attachs">
			
			</div>
			<span id="unusedattachtip" style="display:none;">您曾上传但未使用的附件：（可直接链接到本贴）<img src="waiting.gif" width="15px" id="waitinggif" style="visibility:hidden;"></span>
			<div class="attachs" id="unusedattachs">
			
			</div>
		</div>
';}}
else echo '
		<div class="editip" id="editip">
		<span class="editip">您需要&nbsp;<a href="../login?from='.$nowurl.'">登录</a>&nbsp;后才能发表主题；没有账号？&nbsp;<a href="../register">现在注册</a>&nbsp;</span>
		</div>
';
?>
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
</div>

	<div id="boardselector">
		<p align="center" style="color:white;font-size:24px;margin-top:40px;">移动帖子到：</p>
		<?php
		$counter=0;
		foreach($bbsdata as $board){
			if($board['hide']==1) continue;
			echo('<div class="aboard" id="board'.++$counter.'" onclick="javascript:reallymove('.$board['bid'].');">');
			echo('<span>'.$board['bbstitle'].'</span>');
			echo('</div>');
		}
		echo("<script type='text/javascript'>var boardnum=$counter;</script>");
		?>
		<p align="center" style="color:white;font-size:24px;margin-top:500px;"><button onclick="movecancel();">取消</button></p>
	 </div>

<div class="footer">
</div>

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
var ismanaging=<?php if(@$_GET['edit']=='yes') echo "true"; else echo "false"; ?>;
var temptid;
function settid(what,tid){
	//window.open("../settid/?action="+what+"&tid="+tid+"&bid="+bid+"&p="+page, "_self");
	window.location="../settid/?action="+what+"&tid="+tid+"&bid="+bid+"&p="+page;
}

function reallymove(tobid){
	//window.open("../move/?tid="+temptid+"&from="+bid+"&to="+tobid+"&p="+page, "_self");
	window.location="../move/?tid="+temptid+"&from="+bid+"&to="+tobid+"&p="+page;
}

function movecancel(){
	for(var i=1;i<=boardnum;i++){
		//styleOf("board"+i).opacity=0;
		$('#board'+i).css("opacity","0");
	}
	//styleOf("boardselector").opacity=0;
	//styleOf("boardselector").visibility="hidden";
	$('#boardselector').hide();
	$('#boardselector').css("opacity","0");
}
function move(tid){
	temptid=tid;
	//styleOf("boardselector").visibility="visible";
	$('#boardselector').show();
	Tweener.addTween(styleOf("boardselector"),{opacity:0.9,time:1});
	var w=document.body.clientWidth;
	var h=document.body.clientHeight;
	var sw=200;
	var sh=150;
	var xx=(w-sw*4)/2;
	var yy=(h-sh*Math.floor(boardnum/4))/2;
	for(var i=1;i<=boardnum;i++){
		var num=i-1;
		Tweener.addTween(styleOf("board"+i),{left:xx+(num%4)*200,top:yy+Math.floor(num/4)*150,opacity:1,time:0.5,delay:0.7+i/7,transition:"easeOutBack"});
	}
}
function styleOf(a){
	return document.getElementById(a).style;
}
function manage(){
	if(ismanaging){
		ismanaging=false;
		//document.getElementById("table").style.width="80%";
		//document.getElementById("tablebts").style.left="100%";
		$('#table').css("width","80%");
		$('#tablebts').css("left","100%");
	}else{
		ismanaging=true;
		//document.getElementById("table").style.width="70%";
		//document.getElementById("tablebts").style.left="81%";
		$('#table').css("width","70%");
		$('#tablebts').css("left","81%");
	
	}
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
	//document.getElementById("attachs").innerHTML=s;
	$('#attachs').html(s);
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
	if ($('#file').val()) {
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
			var result=JSON.parse(r);
			if(result.code==0){
				for(var i=0;i<unusedattachs.length;i++){
					if(unusedattachs[i]['id']==id){
						unusedattachs.splice(i,1);
						break;
					}
				}
			//document.getElementById("waitinggif").style.visibility="hidden";
			$('#waitinggif').hide();
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
	//var price=parseInt(document.getElementById("price").value);
	//var auth=parseInt(document.getElementById("auth").value);
	var price=0;
	var auth=0;
	if(price<0||price>200){
		alert("请填写一个有效的售价（0-200）");
		return;
	}
	if(auth<0){
		alert("请填写一个有效的阅读权限（>0）");
		return;
	}
	//document.getElementById("overlay").style.visibility="hidden";
	$('#overlay').hide();
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
		alert("response:"+xhr.responseText+" code:"+xhr.status);
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
function showoverlay(){
	//document.getElementById("overlay").style.visibility="visible";
	//$('#overlay').show();
	priceok();
}
function jump(page){
	window.location="./?bid="+bid+"&p="+page<?php if ($extr) echo '+"&extr=1"'?>;

}

function gotobbs(tbid){
	//window.open("../main/?bid="+tbid, "_self");
	window.location="../main/?bid="+tbid;
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
	//window.open("../bbs", "_self");
	window.location="../index/";
}

function doreply(){
	if(document.getElementById("raw_title").value.length==0){
		alert("请填写帖子标题！");
		return;
	}
	//var content=document.getElementById("edi_content").innerHTML;
	var content=$('#edi_content').html();
	if(content=="<br>" || content=="<div></div>" || content == editorPlaceholder){
		alert("请填写帖子内容！");
		return;
	}
	var token=getcookie("token");
	if(!token){
		alert("尚未登录！");
		return;
	}
	if (content.length > 100000) {
		alert("内容字符数为"+content.length+"（超过10万字符），请检查是否粘贴了图片。");
		return;
	}
	content=content.replace(/&/g, "&amp;");
	//document.getElementById("fm_title").value=document.getElementById("raw_title").value;
	//document.getElementById("fm_text").value=content;
	//document.getElementById("fm_token").value=token;
	var bts=document.getElementsByName("sign");
	var sig;
	for(var i=0;i<bts.length;i++){
		if(bts[i].checked){
			sig=bts[i].value;
		}
	}
	//document.getElementById("fm_sig").value=sig;

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
		title:$('#raw_title').val(),
		text:content,
		sig:sig,
		attachs:s
		},function(data) {
			var x=parseInt(data);
			if (x==0) {window.location=window.location.href;}
			else alert("错误："+data);
		}
	);

}


function insertHTML(html){ 
	var dthis=document.getElementById("edi_content");
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


function deltid(tid) {
	if (confirm("你确定要删除这个主题嘛？")) {
		//window.location="../delete/?ask=deltid&bid="+bid+"&tid="+tid+"&p="+page;
		$.post("../delete/",{
			ask:"deltid",
			bid:bid,
			tid:tid
			},function(data){
				var x=parseInt(data);
				if (x==0) {window.location=window.location.href;}
				else {alert("错误："+data);}
		});
	}
}

const editorPlaceholder = '<div style="color: rgb(118, 118, 118);">如需上传图片请使用右上角的“上传图片”功能，不要将图片直接粘贴在文本框中</div>';
myNicEditor.instanceById('edi_content').setContent(editorPlaceholder);
function editorFocus() {
	if (myNicEditor.instanceById('edi_content').getContent() == editorPlaceholder) {
		myNicEditor.instanceById('edi_content').setContent('<br>');
	}
}

function editorBlur() {
	let newText = myNicEditor.instanceById('edi_content').getContent();
	if (newText == '' || newText == '<br>') {
		myNicEditor.instanceById('edi_content').setContent(editorPlaceholder);
	}
}


</script>
</body>

</html>
