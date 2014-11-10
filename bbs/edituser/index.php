<html>
<head>
<title>CAPUBBS - 修改资料</title>
<meta charset="utf-8">
<?php
	include("../lib/mainfunc.php");
	$userinfo=mainfunc(array("ask"=>"currentUserInfo"));
	if(count($userinfo)==0) die("尚未登录</head></html>");
	$userinfo=$userinfo[0];
	function trans($a){
		if(!$a) return "";
		else return $a;
	}
?>

<link rel="stylesheet" href="../lib/general.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<style>
body{
	background-image: url("/assets/images/bg.jpg");
	background-position: center top;
	background-repeat: no-repeat;
	background-color: #ABC9B6;
}
div.main{
	width: 1000px;
	height: 1200px;
	overflow: hidden;
	margin-left: auto;
	margin-right: auto;
/* 	background-color: #CBD0E3; */
}
div.head{
	height: 200px;
}
img.icon{
	width: 50px;
	height: 50px;
	margin: 1px;
	border-radius: 5px;
	float: left;
	cursor: pointer;
	border: 2px solid white;
}
img.icon:hover{
	box-shadow: 0px 0px 11px rgba(0,0,0,0.6);
}
div.iconselector{
	position: absolute;
	top: 50px;
	left: -168px;
	width: 396px;
	padding: 10px;
	background-color: #F0F0F0;
	background-image: -webkit-linear-gradient(#ffffff 0%, #d3d3d3 100%);
	box-shadow:0px 0px 19px rgba(0,0,0,0.38);
	display: none;
}
div.iconbt{
	width: 50px;
	height: 50px;
	cursor: pointer;
}
div.iconpr{
	position: relative;
}
div.icon{
	width: 50px;
	height: 50px;
	margin: 1px;
	border-radius: 5px;
	background-color: white;
	float: left;
	color: #888888;
	line-height: 25px;
	font-size: 12px;
	background-image: url("upload.jpg");
	background-repeat: no-repeat;
	background-size: 100%,100%;
	cursor: pointer;
	border: 2px solid white;
	-webkit-transition: -webkit-transform,0.4s;
	-webkit-transform: rotate(0deg);
}
div.icon:hover{
	-webkit-transform: rotate(360deg);
}

table.content{
	width: 600px;
	margin-left: auto;
	margin-right: auto;
}
div.main table input{
	width: 200px;
	height: 23px;
	border-radius: 10px;
	outline: none;
	padding-left: 10px;
	background-color: #faffd7;
}
div.main table tr{
	height: 35px;
}
td.left{
	text-align: right;
	width: 100px;
}
td.right{
	text-align: left;
	width: 150px;
}
div.tag{
	text-align: center;
	color: #777777;
	font-size: 22px;
	letter-spacing: 5px;
}
hr{
	width: 60%;
}
div.switch div{
	width: 60px;
	height: 18px;
	line-height: 18px;
	border-left: 1px solid #555555;
	border-top: 1px solid #555555;
	border-bottom: 1px solid #555555;
	float: left;
	text-align: center;
	cursor: pointer;
	font-size: 12px;
}
div.switch_left{
	border-top-left-radius: 10px;
	border-bottom-left-radius: 10px;
}
div.switch_right{
	border-top-right-radius: 10px;
	border-bottom-right-radius: 10px;	
	border-right: 1px solid #555555;
}
.selected{
	background-color: #faffd7;
	color: #555555;
}
textarea{
	width: 150%;
	height: 100px;
	border-radius: 10px;
	outline: none;
	padding-left: 10px;
	padding-top: 10px;
	background-color: #faffd7;
	resize: none;
	border: 1px groove #888888;
}

</style>
</head>
<body>
<div class="main">
<div class="head">
</div>
<div class="content">
<div class="tag">编辑个人信息</div>
<hr>

<form action="action.php" method="post" onsubmit="return check();">

<table class="content">

<tr><td class="left"><span>用户名：</span></td><td class="right">&nbsp;<?php echo trans($userinfo['username']); ?></td></tr>

<tr><td class="left"><span>性别：</span></td><td class="right">
<div class="switch">
<div class="switch_left" onclick="select(0);" id="select0">请选择</div>
<div class="switch_middle" onclick="select(1);" id="select1">男</div>
<div class="switch_right" onclick="select(2);" id="select2">女</div>
<input name="sex" type="hidden" id="sex">
</div></td>
</tr>
<tr><td class="left"><span>选择一个头像：</span></td><td class="right"><input type="hidden" name="icon" id="icon"><div class="iconpr">
<div class="iconbt" id="iconbt"><img id="iconpreview" class="icon">
<div class="iconselector" id="iconselector">

<tr><td class="left"><span>QQ：</span></td><td class="right"><input placeholder="" type="text" name="qq" id="qq" value="<?php echo(trans($userinfo['qq'])); ?>"></td></tr>

<tr><td class="left"><span>Email：</span></td><td class="right"><input type="text" name="email" id="email" value="<?php echo(trans($userinfo['mail'])); ?>"></td></tr>
<tr><td class="left"><span>来自于：</span></td><td class="right"><input placeholder="哪个城市" type="text" name="place" id="place" value="<?php echo(trans($userinfo['place'])); ?>"></td></tr>

<tr><td class="left"><span>爱好：</span></td><td class="right"><input placeholder="用逗号分隔" type="text" id="hobby" name="hobby" value="<?php echo(trans($userinfo['hobby'])); ?>"></td></tr>

<tr><td class="left"><span>签名档1：</span></td><td><textarea placeholder="每个签名档不超过300字节；支持如[img]或[color]之类的转义" name="sig1" maxlength=250><?php echo(trans($userinfo['sig1'])); ?></textarea></td></tr>

<tr><td class="left"><span>签名档2：</span></td><td><textarea placeholder="每个签名档不超过300字节；支持如[img]或[color]之类的转义" name="sig2" maxlength=250><?php echo(trans($userinfo['sig2'])); ?></textarea></td></tr>

<tr><td class="left"><span>签名档3：</span></td><td><textarea placeholder="每个签名档不超过300字节；支持如[img]或[color]之类的转义" name="sig3" maxlength=250><?php echo(trans($userinfo['sig3'])); ?></textarea></td></tr>

<tr><td class="left">个人简介：</td><td><textarea name="intro" placeholder="向大家更好的介绍自己吧！不超过300字节" maxlength="250"><?php echo(trans($userinfo['intro']));?></textarea></td><td class="right"></td></tr>
<tr><td colspan="2">&nbsp;</td></tr>

<tr><td></td><td><input type="submit" style="width:70px;"></td><td></td></tr>

</div>
</div>
<input type="file" style="display:none" id="iconfile" onchange="reallyuploadicon();">
</td></tr>
</table>
</form>
</div>

	<script type="text/javascript">
	var imgs;
	<?php
		$handler=opendir("../../bbsimg/icons");
		$limit=50;
		$count=0;
		echo("imgs=[");
		while(($filename=readdir($handler))!==false&&$count++<$limit){
			$filename=strtolower($filename);
			if($filename!="."&&$filename!=".."&& (strrchr($filename, ".jpg")==".jpg"||strrchr($filename, ".jpeg")==".jpeg"||strrchr($filename, ".png")==".png"||strrchr($filename, ".gif")==".gif")){
				echo("'$filename',");
				#echo("<img src='../../bbsimg/icons/".$filename."' class='icon'>");
			}
		}
		closedir($handler);
		echo("'end'];\n");
	?>
	imgs.pop();
	function refreshicons(){
		var s="";
		for(var i=0;i<imgs.length;i++){
			s+="<img src='/bbsimg/icons/"+imgs[i]+"' class='icon' onclick='selecticon("+i+")'>";
		}
		s+='<div class="icon" onclick="uploadicon();"></div><div class="tip">← 点此上传您的头像</div>';
		document.getElementById("iconselector").innerHTML=s;		
	}
	refreshicons();
	var iconpath="<?php echo($userinfo['icon']); ?>";
	var iconname=iconpath.slice(iconpath.lastIndexOf("/")+1);
	var selectedimg=imgs.indexOf(iconname);
	if(selectedimg==-1){
		imgs.push(iconpath.slice(iconpath.indexOf("/bbsimg/icons/")+"/bbsimg/icons/".length));
		selectedimg=imgs.length-1;
	}
	selecticon(selectedimg);
	document.body.onclick=function(e){
		if(e.target==document.body){
			document.getElementById("iconselector").style.display="none";
		}
	}
	function selecticon(n){
		document.getElementById("iconpreview").src="/bbsimg/icons/"+imgs[n];
		document.getElementById("icon").value="/bbsimg/icons/"+imgs[n];
		document.getElementById("iconselector").style.display="none";
	}
	function uploadicon(){
		document.getElementById("iconfile").click();
	}
	function reallyuploadicon(){
		var fileObj=document.getElementById("iconfile").files[0];
		var FileController = "../utils/icon_upload.php";
		var form = new FormData();
		form.append("file", fileObj);
		var xhr = new XMLHttpRequest();
		xhr.open("post", FileController, true);
		xhr.onload = function () {
			try{
				var result=JSON.parse(xhr.responseText);
				if(result.code==0){
					imgs.push(result.url);
					refreshicons();
				}else{
					alert("头像上传失败："+result.msg+" code:"+result.code);
				}
			}catch(e){
				alert("出bug了");
			}
		};
		xhr.send(form);
	}
	document.getElementById("iconbt").onclick=function(evt){
		if(evt.target!=document.getElementById("iconpreview")) return;
		if(document.getElementById("iconselector").style.display!="block"){
			document.getElementById("iconselector").style.display="block";
		}else{
			document.getElementById("iconselector").style.display="none";
		}
	}
	<?php
		$sex=trans($userinfo['sex']);
		if ($sex=="男") echo 'select(1);';
		else if ($sex=="女") echo 'select(2);';
		else echo 'select(0);';
	?>
	function select(n){
		var sexes=["请选择","男","女"];
		for(var i=0;i<3;i++){
			if(i==n){
				addClass(document.getElementById("select"+i),"selected");
				document.getElementById("sex").value=sexes[i];
			}else{
				removeClass(document.getElementById("select"+i),"selected");
			}
		}
	}
	function hasClass(ele,cls) {
		return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	}
 
	function addClass(ele,cls) {
		if (!this.hasClass(ele,cls)) ele.className += " "+cls;
	}
 
	function removeClass(ele,cls) {
		if (hasClass(ele,cls)) {
	    	var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
			ele.className=ele.className.replace(reg,' ');
		}
	}
	
	function check(){
		if(document.getElementById("username").value==""){
			alert("请填写用户名！");
			return false;
		}
		if(document.getElementById("error_username").innerHTML!=""){
			alert(document.getElementById("error_username").innerHTML);
			return false;
		}
		if(document.getElementById("psd").value==""){
			alert("请填写密码！");
			return false;
		}
		if(document.getElementById("psd").value!=document.getElementById("psd2").value){
			alert("两次密码不一致！");
			return false;
		}
		if(psdStrength(document.getElementById("psd").value)<0.25){
			alert("密码强度过低！请增加密码位数，或使用多种大小写字母。");
			return false;
		}
		if(document.getElementById("sex").value=="请选择"){
			alert("请选择性别！");
			return false;
		}
		if(document.getElementById("email").value==""){
			alert("请填写email！");
			return false;
		}
		
		document.getElementById("psd1").value=hex_md5(document.getElementById("psd").value);
		document.getElementById("psd").value="";
		document.getElementById("psd2").value="";
		return true;
	}
	</script>
</body>
</html>
