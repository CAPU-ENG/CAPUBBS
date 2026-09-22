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
    var username=$('#username').val();
    var password=$('#password').val();
    if (username==""||password=="") {
        $('#alert').html("用户名和密码不能为空！");
        $('#alert').show();
        if (username=="") $('#username').focus();
        else $('#password').focus();
        return;
    }
    window.CapuHomeSession.login(username, hex_md5(password)).then(function () {
        window.location.reload();
    }).catch(function (error) {
        $('#alert').text(error.message || '登录失败，请重试。').show();
    });
}
function setActive(tag) {    
        $("#navbar-home,#navbar-timeline,#navbar-about").removeClass("active");
    if (tag=="#timeline") {
        $('#navbar-timeline').addClass("active");
        $('#mainframe').attr("src","/index/timeline.php");
    }
        else if (tag.indexOf("#about")==0)
    {
        $("#navbar-about").addClass("active");
        $('#mainframe').attr("src","/index/about.php#"+tag.substr(7));
        tag="#about";
    }
    else 
    {
        tag="#main";
        $("#navbar-home").addClass("active");
        $("#mainframe").attr("src","/index/main.php");
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
