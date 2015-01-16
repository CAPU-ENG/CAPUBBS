$(window).load(function() {
	setActive(window.location.hash);
	$('#username').keypress(function(e) {
		if (e.keyCode==13)
			$('#password').focus();
	});
	$('#password').keypress(function(e) {
		if (e.keyCode==13)
			login();
	});
});

function closemodal() {
	$('#login_dialog').modal("hide");
	$('#username,#password').val("");
	$('#alert').hide();
}

function forget() {
	var x="如果忘记了密码，请私信管理员或发送邮件到 <a href='mailto:capubbs@qq.com'>capubbs@qq.com</a> ，或者线下联系管理员等，以求重置自己的密码。";
	$('#alert').html(x);
	$('#alert').show();
}

function login() {
	$('#alert').hide();
	$('#alert').html("验证码无效，请重新输入");
	var username=$('#username').val();
	var password=$('#password').val();
	if (username==""||password=="") {
		$('#alert').html("用户名和密码不能为空！");
		$('#alert').show();
		if (username=="") $('#username').focus();
		else $('#password').focus();
		return;
	}
	var user=username;
	var pass=hex_md5(password);
	$.post("assets/api/main.php",{
		ask:"login",
		username: user,
		password: pass
	},function(data){
		var x=parseInt(data);
		if (x==1) {
			$('#alert').html("用户不存在！");
			$('#username').focus();
			$('#alert').show();
			return;
		}
		if (x==2) {
			$('#alert').html("密码错误！");
			$('#password').focus();
			$('#alert').show();
			return;
		}
		window.location.hash="#main";
		window.location.reload();
	});

}
function logout(){
	window.open("bbs/logout/?from=/","_self");
}
function setActive(tag) {	
        $("#navbar-home,#navbar-borrow,#navbar-activity,#navbar-join,#navbar-download,#navbar-timeline,#navbar-about").removeClass("active");
	var cache=getCookie("token");
	if (cache=="") $('#login_li').html('<li><a href="javascript:showlogin()" id="login">登录</a></li><li id="navbar-register"><a href="bbs/register/" target="_blank">注册</a></li>');
	if (tag.indexOf("#borrow")==0)
	{
		$("#navbar-borrow").addClass("active");
                if (tag=="#borrow-in")
			$("#mainframe").attr("src","index/borrow.php");
		else if (tag=="#borrow-out")
			$("#mainframe").attr("src","index/lend.php");
		else if (tag=="#borrow-read")
			$("#mainframe").attr("src","index/borrow-read.php");
		else if (tag=="#borrow-manage")
			$("#mainframe").attr("src","index/manage.php");
		else $("#mainframe").attr("src","index/transaction.php");
		tag="#borrow";
	}
/*
	else if (tag=="#join" || tag=="#join-summer")
        {       
                $("#navbar-join").addClass("active");
		var url="index/join.php";
		if (tag=="#join-summer") url=url+"#summer";
		$("#mainframe").attr("src",url);
		tag="#join";
        }
*/
        else if (tag=="#download")
        {
                $("#navbar-download").addClass("active");
		$("#mainframe").attr("src","index/download.php");
        }
	else if (tag=="#timeline") {
		$('#navbar-timeline').addClass("active");
		$('#mainframe').attr("src","index/timeline.php");
	}
        else if (tag.indexOf("#about")==0)
	{
		$("#navbar-about").addClass("active");
		$('#mainframe').attr("src","index/about.php#"+tag.substr(7));
		tag="#about";
	}
	else 
	{
		tag="#main";
		$("#navbar-home").addClass("active");
		$("#mainframe").attr("src","index/main.php");
	}
	window.location.hash=tag;
	$(document).scrollTop(0);
}


function showlogin() {
	$('#login_dialog').modal();
}

$("#mainframe").load(function(){
	setSize(-1);
});

function setSize(hei) {
	var std=700;
	var mainheight=hei;
	if (hei==-1)
		mainheight=$("#mainframe").contents().find("html").height()+40;
	$("#mainframe").height(Math.max(mainheight,std));
}

function getCookie(name){
	var strcookie=document.cookie;
	var arrcookie=strcookie.split("; ");
	for(var i=0;i<arrcookie.length;i++){
		var arr=arrcookie[i].split("=");
		if(arr[0]==name)return arr[1];
	}
	return "";
}
