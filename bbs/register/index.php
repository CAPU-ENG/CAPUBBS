<html>
<head>
<title>CAPUBBS - 注册</title>
<meta charset="utf-8">
<link rel="stylesheet" href="../lib/general.css">
<script type="text/javascript" src="../lib/md5.js"></script>
<script src="../lib/jquery.min.js"></script>
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<style type="text/css">
body{
	background-image: url("/assets/images/bg.jpg");
	background-position: center top;
	background-color: #AACAB4;
	background-repeat: no-repeat;
}
div.main{
	width: 500px;
	margin-left: auto;
	margin-right: auto;
	margin-top: 250px;
	border: 4px dashed white;
	border-radius: 20px;
	padding-top: 70px;
	padding-left: 100px;
	padding-right: 100px;
	margin-bottom: 70px;
	position: relative;
}
div.main table{
	color: white;
	line-height: 30px;
}
div.main table th{
	color: #f3ff97;
}
div.main table input{
	width: 200px;
	height: 23px;
	border-radius: 10px;
	outline: none;
	padding-left: 10px;
	background-color: #faffd7;
}
td.left{
	text-align: right;
	width: 100px;
}
td.right{
	text-align: left;
	width: 150px;
}
div.switch div{
	width: 60px;
	height: 18px;
	line-height: 18px;
	border-left: 1px solid white;
	border-top: 1px solid white;
	border-bottom: 1px solid white;
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
	border-right: 1px solid white;
}
.selected{
	background-color: #faffd7;
	color: #AAC9B5;
}
span.tip{
	color: #ffffff;
	font-size: 12px;
	float: left;
}
span.error{
	color: #990000;
	font-size: 12px;
	float: left;
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
div.blank{
	height: 100px;
}
div#strength{
	width: 150px;
	height: 13px;
	border-radius: 10px;
	background-color: white;
/* 	overflow: hidden; */
	display: none;
	float: left;
}
div#strength span{
	text-align: center;
	width: 100%;
	height: 13px;
	line-height: 13px;
	color: #777777;
}
div#strength div#content{
	width: 0%;
	border-radius: 10px;
	height: 100%;
	background-color: red;
	box-shadow: 0px 0px 7px 0px #FF0000;
	-webkit-transition: width 0.2s, background-color 0.2s;
}
img.confirm{
	width: 20px;
	height: 20px;
	display: none;
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
div.tag{
	width: 300px;
	height: 24px;
	background-color: white;
	position: absolute;
	top: -15px;
	left: 200px;
	border-radius: 20px;
	background-image: -webkit-linear-gradient(#ffffff 0%, #e1e1e1 100%);
	border: 1px white solid;
	text-align: center;
	line-height: 24px;
	color: #777777;
	font-size: 14px;
}
div.tip{
	color: #777777;
	line-height: 50px;
}
div.icon:hover{
	-webkit-transform: rotate(360deg);
}
</style>
</head>
<body>
<div class="main">
<div class="tag">注册CAPUBBS</div>
<form>
<table border="0">
<tr><td class="left">ID*：</td><td width="230px"><input type="text" name="username" placeholder="请填写用户名" oninput="checkUsernameValid();" onBlur="checkUsernameUsed();" id="username"></td><td class="right"><img id="confirm_username" src="ok.png" class="confirm"><img id="waiting_username" src="waiting.gif" class="confirm"><span class="error" id="error_username"></span></td></tr>
<tr><td class="left">&nbsp;</td><td><a href="../content/?bid=2&tid=6205" target='_blank'>如何才能起一个好的ID？</a></td><td class="right">&nbsp;</td></tr>
<tr><td class="left">密码*：</td><td><input type="password" name="password" placeholder="至少6位密码" id="psd" maxlength="18" oninput ="checkPsdStrength();"><input type="hidden" name="password1" id="psd1"></td><td class="right"><div id="strength"><span id="psdstr" class="tip"></span><div id="content"></div></div></td></tr>
<tr><td class="left">确认密码*：</td><td><input type="password" name="password2" placeholder="请重复输入密码" id="psd2" oninput ="checkPsd2();"></td><td class="right"><img id="confirm_psd" src="ok.png" class="confirm"></td></tr>
<tr><td class="left">注册码*：</td><td><input type="text" name="code" placeholder="请输入会员证上的注册码" id="code"></td><td class="right"></td></tr>
<tr><td class="left">&nbsp;</td><td colspan="2" style="color:red">若遗失或有疑问，请邮件联系<a href="mailto:capubbs@qq.com">capubbs@qq.com</a></td></tr>
<tr><td colspan="3">&nbsp;</td></tr>
<tr><td class="left">性别*：</td><td>
<div class="switch">
<div class="switch_left" onclick="select(0);" id="select0">请选择</div>
<div class="switch_middle" onclick="select(1);" id="select1">男</div>
<div class="switch_right" onclick="select(2);" id="select2">女</div>
<input name="sex" type="hidden" id="sex">
</div>
</td><td class="right"><img id="confirm_sex" src="ok.png" class="confirm"></td></tr>
<tr><td class="left">E-mail*：</td><td><input type="email" name="email" placeholder="请输入您的常用邮箱"  id="email" oninput ="checkEmail();" id="email"></td><td class="right"><img id="confirm_email" src="ok.png" class="confirm"></td></tr>
<tr><td colspan="3">&nbsp;</td></tr>

<tr><td class="left">选择一个头像*：</td><td colspan="2"><input type="hidden" name="icon" id="icon"><div class="iconpr"><div class="iconbt" onclick="toggleSelector();"><img id="iconpreview" class="icon"><div class="iconselector" id="iconselector">
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
	selecticon(Math.floor(imgs.length*Math.random()));
	document.body.onclick=function(e){
		if(e.target==document.body){
			document.getElementById("iconselector").style.display="none";
		}
	}
	function selecticon(n){
		document.getElementById("iconpreview").src="/bbsimg/icons/"+imgs[n];
		document.getElementById("icon").value="/bbsimg/icons/"+imgs[n];
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
	</script>
	<input type="file" style="display:none" id="iconfile" onchange="reallyuploadicon();">
</div></div></td></tr>

<tr><td colspan="3">&nbsp;</td></tr>
<tr><td class="left">qq：</td><td><input type="text" name="qq" id="qq"></td><td class="right"><img id="confirm_qq"></td></tr>
<tr><td class="left">来自于：</td><td><input type="text" placeholder="来自哪个城市" name="place" id="place"></td><td class="right"></td></tr>
<tr><td class="left">爱好：</td><td><input type="text" placeholder="使用逗号分隔" name="hobby" id="hobby"></td><td class="right"></td></tr>
<tr><td class="left">签名档1：</td><td><textarea name="sig1" placeholder="每个签名档不超过300字节；支持如[img]或[color]之类的转义" id="sig1" maxlength="250" rows="3"></textarea></td><td class="right"></td></tr>
<tr><td class="left">签名档2：</td><td><textarea name="sig2" maxlength="250" rows="3" id="sig2"></textarea></td><td class="right"></td></tr>
<tr><td class="left">签名档3：</td><td><textarea name="sig3" maxlength="250" rows="3" id="sig3"></textarea></td><td class="right"></td></tr>
<tr><td class="left">个人简介：</td><td><textarea name="intro" placeholder="向大家更好的介绍自己吧！" rows="3" id="intro"></textarea></td><td class="right"></td></tr>
<td class="left">验证码*：</td><td><input type="text" placeholder="输入结果；点击图片更换验证码" name="captcha" id="captcha">&nbsp;</td><td class="right"><img id="img_captcha" src="/assets/api/securimage/securimage_show.php?<?php echo rand();?>" onclick="changecaptcha()" style="cursor:pointer"></td></tr>
<tr><td colspan="1">&nbsp;</td></tr>
<tr><td></td><td><input type="button" style="width:70px;" onclick="register()" value="注册"></td><td></td></tr>
</table>
</form>
<div class="blank">
</div>
</div>
<script type="text/javascript">
function changecaptcha() {
	$('#captcha').val();
	$('#img_captcha').attr("src","/assets/api/securimage/securimage_show.php?"+Math.random());
}

$(function(){
	$('#captcha').keypress(function(e) {
		if (e.keyCode==13)
			register();
	});
});

function register() {
	var password=$('#psd').val();
	var psd2=$('#psd2').val();
	if (password=="" || password!=psd2) {alert("密码为空或两次密码不一致！");return;}
	password=hex_md5(password);

	$.post("action.php",{
		username:$('#username').val(),
		password1:password,
		code:$('#code').val(),
		sex:$('#sex').val(),
		email:$('#email').val(),
		icon:$('#icon').val(),
		qq:$('#qq').val(),
		place:$('#place').val(),
		hobby:$('#hobby').val(),
		sig1:$('#sig1').val(),
		sig2:$('#sig2').val(),
		sig3:$('#sig3').val(),
		intro:$('#intro').val(),
		captcha:$('#captcha').val()
		},function (data) {
			var x=parseInt(data);
			if (x==-44) {
				alert("验证码错误。");
				changecaptcha();
				return;
			}
			if (x==0) {
				window.location="/bbs/index/";
				return;
			}
			alert(data);
			changecaptcha();
	});
}

function toggleSelector(){
	if(document.getElementById("iconselector").style.display!="block"){
		document.getElementById("iconselector").style.display="block";
	}else{
		document.getElementById("iconselector").style.display="none";
	}
}
function checkUsernameValid(){
	document.getElementById("confirm_username").style.display="none";
	document.getElementById("waiting_username").style.display="none";
	var username=document.getElementById("username").value;
	if(username.indexOf("'")!=-1){
		document.getElementById("error_username").innerHTML="用户名含有非法字符";
		return false;
	}else if(username.length==0){
		document.getElementById("error_username").innerHTML="用户名不能为空";
		return false;
	}else{
		document.getElementById("error_username").innerHTML="";
		return true;
	}
}
function checkUsernameUsed(){
	if(!checkUsernameValid()){
		return;
	}
	document.getElementById("confirm_username").style.display="none";
	document.getElementById("waiting_username").style.display="block";
	var r=new XMLHttpRequest();
	r.open("GET","userexists.php?user="+document.getElementById("username").value,true);
	r.send();
	r.onreadystatechange=function(){
		if(r.readyState==4&&r.status==200){
			if(r.responseText=="0"){
				document.getElementById("confirm_username").style.display="block";
				document.getElementById("waiting_username").style.display="none";
				document.getElementById("error_username").innerHTML="";
			}else if(r.responseText=="1"){
				document.getElementById("confirm_username").style.display="none";
				document.getElementById("waiting_username").style.display="none";
				document.getElementById("error_username").innerHTML="用户名已被注册";
			}else{
				document.getElementById("confirm_username").style.display="none";
				document.getElementById("waiting_username").style.display="none";
				document.getElementById("error_username").innerHTML="用户名含有非法字符";
			}
		}
	}

}
function checkEmail(){
	var email=document.getElementById("email").value;
	if(/[0-9a-zA-Z_.]+@[0-9a-zA-Z_.]+/.test(email)){
		document.getElementById("confirm_email").style.display="block";
	}else{
		document.getElementById("confirm_email").style.display="none";
	}
}
function checkPsd2(){
	var psd2=document.getElementById("psd2").value;
	var psd=document.getElementById("psd").value;
	if(psd2==psd&&psd!=""){
		document.getElementById("confirm_psd").style.display="block";
	}else{
		document.getElementById("confirm_psd").style.display="none";
	}
}
function checkPsdStrength(){
	checkPsd2();
	var s=psdStrength(document.getElementById("psd").value);
	if(document.getElementById("psd").value.length!=0){
		document.getElementById("strength").style.display="block";
		var text=(s*100).toFixed(0)+"%";
		document.getElementById("content").style.width=text;
		var c="#"+heal(getColor(s).toString(16));
		document.getElementById("content").style.backgroundColor=c;
		document.getElementById("content").style.boxShadow ="0px 0px 7px 0px "+c;
		var str="";
		if(s<0.25) str="不够";
		else if(s<0.5) str="还行";
		else if(s<0.75) str="好";
		else str="棒极了";
		document.getElementById("psdstr").innerHTML="密码强度："+str;	
	}else{
		document.getElementById("strength").style.display="none";
	}
}
function heal(s){
	while(s.length<6) s="0"+s;
	return s;
}
function getColor(n){
	var ans=0;
	if(n<0.5){
		ans+=0xff0000;
		ans+=(0xff00*n/0.5)&0xff00;
	}else{
		ans+=(0xff0000*(1-n)/0.5)&0xff0000;
		ans+=0xff00;
	}
	ans+=0x77;
	return ans;
}
function psdStrength(psd){
	var types=0;
	if(/\d/.test(psd)) types+=0.5;
	if(/[a-z]/.test(psd)) types++;
	if(/[A-Z]/.test(psd)) types++;
	if(/[_=+.,!@#$%&*]/.test(psd)) types+0.8;
	var ans=types*psd.length/30;
	if(ans>1) ans=1;
	return ans;
}
</script>
<script type="text/javascript">
select(0);
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
	if(n!=0) document.getElementById("confirm_sex").style.display="block";
	else document.getElementById("confirm_sex").style.display="none";
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
</script>
</body>
</html>
