<html>
<head>
<meta charset="utf-8">
<title>北大车协论坛欢迎你</title>
<script type="text/javascript" src="general.js"></script>
<style type="text/css">
body{
	background-image: url("http://www.chexie.net/bbsimg/bg1.gif");
	margin: 0;
}
a{
	text-decoration: none;
	color: white;
	font-size: 13;
}
.bnamel{
	width:150;
	position:relative;
	top:40;left:40;
	font-size: 23;
	float: left;
}
.bnamer{
	width:150;
	position:relative;
	top:40;right:40;
	font-size: 23;
	float: right;
}
#blocks{
	width: 80%;
	margin-left: 10%;
}
.bblock{
	background-color:#99AAFF;
	border-radius: 10px;
	width:24%;
	height:120px;
	float: left;
	margin-left:1%;
	margin-top:10;
	color: white;
	-webkit-transition: background-color 0.4s,color 0.4s;
	cursor: pointer;
}
.bblock:hover{
	background-color: #FFAA99;
	color: yellow;
}
</style>
</head>
<body>
<table cellspacing="0" width="100%" class="top">
		<tbody><tr>
			<td width="200" rowspan="2"><img src="http://www.chexie.net/bbsimg/bbslogo.gif" alt="logo">
			</td><td style="color:yellow" height="23" bgcolor="#A091DE">&nbsp;&nbsp;[<a href="usr.pl" target="_blank">修 改</a>] [<a href="usrlist.pl" target="_blank">用户列表</a>] [<a href="stat.pl" target="_blank">排行榜</a>] [<a href="bbs.pl?see=aztj&amp;b=4" target="_blank">帮 助</a>] [<a href="extr.pl" target="_blank">精 华</a>] [<a href="search.pl" target="_blank">搜 索</a>] [<a href="bbs.pl?exit=1">登 出</a>]&nbsp;&nbsp;
			</td><td align="right" bgcolor="#A091DE"><a href="/" style="color:white"><img src="http://www.chexie.net/bbsimg/home.gif" alt="chexie.net" align="middle">www.chexie.net </a></td>
		</tr>
		<tr>
			<td height="15" colspan="2">
		</td></tr>
	</tbody></table>
	
<h2 align="center">全部板块</h2>
<div id="blocks">
</div>
<hr width="90%"/>
<p align="center" style="font-size:13">本论坛作为北京大学自行车协会内部以及自行车爱好者之间交流平台，不欢迎任何商业广告和无关话题。发言者对自己发表的任何言论、信息负责。各版版主可制定相应版面规则。</p>
</body>
<script type="text/javascript">
ajaxWithCallback("/api/?ask=bbsinfo",function(xml){
	var blocks=getInfo(xml);
	var temp="";
	for(var i=0;i<blocks.length;i++){
		temp+="<div class='bblock' onclick='window.open(\"main.php?bid="+getUC(blocks[i],"bid")+"&name="+getUC(blocks[i],"bbstitle")+"\",\"_self\");'><dic class='"+(i%2==0?"bnamel":"bnamel")+"'>"+getUC(blocks[i],"bbstitle")+"</div></div>";
	}
	document.getElementById("blocks").innerHTML=temp;
},false);
</script>
</html>