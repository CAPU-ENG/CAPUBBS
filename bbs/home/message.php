<?php
	include("../lib/mainfunc.php");
	$users=getuser();
	$username=$users['username'];
?>

<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../lib/general.css">
<style type="text/css">
div.button{
	background-image: -webkit-linear-gradient(#76caff 0%, #1d9eff 100%);
	background-color: #1d9eff;
	background-size: 100%,100%;
	background-repeat: no-repeat;
	width: 100px;
	height: 24px;
	color: white;
	border-radius: 10px;
	font-size: 15px;
	text-align: center;
	line-height: 20px;
	padding-top: 5px;
	float: left;
	cursor: pointer;
	-webkit-transition: background-image 0.2s,background-color 0.2s;
}
div.button:hover{
	background-image: -webkit-linear-gradient(#98ecff 0%, #3fafff 100%);
	background-color: #3fafff;
}
table#mainTable{
	width: 700px;
/* 	border: none; */
	border-collapse: collapse;
/* 	background-color:#f8f8f8; */
/* 	border:1px solid #cacaca; */
}
table#mainTable tr{
	border-bottom: 1px dashed grey;
	line-height: 30px;
	font-size: 14px;
	height: 50px;
}
a{
	text-decoration: none;
	color: #2fa9ff;
}
td.lzltd{
	padding:20px;
/* 	border:1px solid #dcdcdc; */
}
div.lzlicon{
	float:left;
}
img.lzlicon{
	width: 50px;
	height: 50px;
}
div.lzlcontent{
	float:left;margin-left:10px;width:590px;word-break:break-all;
}
span.lzltime{
	float:right;color:grey;margin-right:8px;
}
a.lzlreplybt{
	color: #6d90ee;text-decoration:none;
}
</style>
<script src="../lib/jquery.min.js"></script>
<script type="text/javascript">
var datas=[];
function refreshTable(seeall){
	var s="";
	var haslist=false;
	var hasreadmsg=false;
	for(var i=0;i<datas.length;i++){
		if(seeall||datas[i].hasread==0){
			s+="<tr>";
			s+='<td class="lzltd">';
			s+='<div class="lzlicon"><img src="'+datas[i].icon+'" class="lzlicon"></div>';
			s+='<div class="lzlcontent">';
			s+=datas[i].msg;
			s+="<br>";
			s+='<span class="lzltime">'+datas[i].time;
			s+='&nbsp;<a href="javascript:replyTo('+i+')" class="lzlreplybt" id="reply_'+i+'">回复</a>';
			s+='</td>';
			s+="</tr>";
			haslist=true;
		}else{
			hasreadmsg=true;
		}
	}
	if(!haslist){
		s+="<tr><td align='center'>您没有未读消息</td></tr>";
	}
	if(hasreadmsg){
		s+="<tr><td align='center'><a href='javascript:refreshTable(true);'>查看历史消息</a></td></tr>";
	}
	document.getElementById("mainTable").innerHTML=s;
}
window.onload=function(){
	window.parent.ifrmLoaded();
}

</script>
</head>
<body>
<?php
if($username==""){
	echo("</body></html>");exit;
}
	$userinfo=mainfunc(array("view"=>$username));
	$userinfo=$userinfo[0];
	$msg=intval($userinfo['newmsg']);
?>

<div class="content">
<table id="mainTable">
</table>
<div style="margin-top:40px;text-align:center">
			<span>发送新消息给：&nbsp;<input id='msg_to' placeholder="收件人id" style="width:100px"></input></span><br><br>
			<textarea id="msg_ta" style="width:400px;height:200px;font-size:13px;padding:5px;"></textarea><br><br>
			<button onclick="msg_send();" id="msg_sendbt">发送</button>
		</div>

</div>
<?php
	$msgs=mainfunc(array("ask"=>"msg"));
	if(@$msgs[0]['code']){
		#echo($msgs[0]['msg']);
	}else{
		echo('<script type="text/javascript">');
		for($i=0;$i<count($msgs);$i++){
			$from=$msgs[$i]['sender'];
			$text=$msgs[$i]['text'];
			$bid=intval($msgs[$i]['rbid']);
			if($from=="system" && $bid!=0){
				$bid=$msgs[$i]['rbid'];
				$tid=$msgs[$i]['rtid'];
				$pid=$msgs[$i]['rpid'];
				$page=ceil($pid/12);
				$title=$msgs[$i]['rmsg'];
				if($text=="reply"){
					$link="../content/?bid=$bid&tid=$tid&p=$page#pid$pid";
					$msg=userhref($msgs[$i]['ruser'])." 回复了您的帖子: "."<a href='$link' target='_top'>$title</a>";
				}else if($text=="replylzl"){
					$link="../content/?bid=$bid&tid=$tid&p=$page#pid$pid";
					$msg=userhref($msgs[$i]['ruser'])." 评论了您在帖子 "."<a href='$link' target='_top'>$title</a> 中的回复";
				}else if($text=="at"){
					$link="../content/?bid=$bid&tid=$tid&p=$page#pid$pid";
					$msg=userhref($msgs[$i]['ruser'])." 在帖子 "."<a href='$link' target='_top'>$title</a> 中at了你";
				}
				
				$authorinfo=mainfunc(array("view"=>$msgs[$i]['ruser']));
				$authorinfo=$authorinfo[0];
				echo('datas.push({msg:"'.$msg.'",hasread:'.$msgs[$i]['hasread'].',link:"'.$link.'",icon:"'.translateicon($authorinfo['icon']).'",time:"'.formatstamp($msgs[$i]['time']).'"});');				
			}else{
				$authorinfo=mainfunc(array("view"=>$msgs[$i]['sender']));
				$authorinfo=$authorinfo[0];
				echo('datas.push({msg:"'.userhref($from).' : '.$text.'",username:"'.$from.'",hasread:'.$msgs[$i]['hasread'].',link:"",icon:"'.translateicon($authorinfo['icon']).'",time:"'.formatstamp($msgs[$i]['time']).'"});');				
			}
		}
		echo("</script>");
	}
	
echo('<script type="text/javascript">');
echo('refreshTable(false);');
echo("</script>");
?>
<script>
function msg_send() {
	var to=$('#msg_to').val();
	var message=$('#msg_ta').val();
	if (to=="") {alert("收件人不能为空");return;}
	if (message=="") {alert("信息不能为空");return;}
	$.post("../message/",{target:to,text:message},
		function (text) {
		var result=JSON.parse(text);
		if(result.code==0){
			alert("发送成功！");
			$('#msg_ta,#msg_to').val("");
		}else{
			alert(result.msg);
		}
	});
}
function replyTo(id) {
	if (datas[id].link!="") {
		window.open(datas[id].link);
		return;
	}	
	else {
		$('#msg_to').val(datas[id].username);
		$('#msg_ta').val("");
		$('#msg_ta').focus();
	}
}
</script>
</body>
</html>
