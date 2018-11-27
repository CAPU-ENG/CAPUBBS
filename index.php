<?php

	if (@$_SERVER['HTTP_HOST']=="bbs.chexie.net") {
		echo '<script>window.location="http://www.chexie.net/bbs/index/";</script></head></html>';
		exit;
	}


	require 'lib.php';
	$res=checkuser();
	$username=$res[0];$rights=$res[1];
	if ($username=="" && @$_COOKIE['token']) {
		date_default_timezone_set("Asia/Shanghai");
		$time=time()-999999;
		$date=date("D, d M Y H:i:s",$time)." GMT";
		header('Set-cookie: token=invalid; expires='.$date.'; path=/'."\n");
	}

?>
<!DOCTYPE html>
<html>
<head>
<!--

                                                                                                            
                                                                                                            
                                                                                    .....                   
                                                                                    i@@@@@@@9:              
                                                                                      X@@@@@@@@X            
                                                                                       .@@@@@@@@@;          
                                                                                        ;@@@@@@@@@3         
                                                                                         @@###@@@@@S        
                                                                                         @@#####@@@@        
             ..                                                                          @@######@@@2       
         .:;;;;;;:  XGX2339999999999999999999X2222222222222222222222222223&AAXs:        9@@#######@@#       
        :;;;::::;;; ;@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@Gr,         5@@########@@@       
       ,;:::::::::::  @@                     ;@@@@@@@@@@@@@@@@@@@@@@@@@2.            :@@@@########@@@       
       ;::::::::::::   @@    G2Siiiiiiiiiii,  ,@@@@###############@@M:            ,2@@@@@##########@H       
       ,;:::::::::::    @@:  H@@@@@@@@@@@@@@;   @@################@;         ;3#@@@@@@@############@;       
        :::::::::::,     @@:  s@@@@@@@@@@@@@@r   @@##############B       .X@@@@@@@@@@#############@@        
         ,::::::::.       @@,  ;@@@#######@@@@s   A@############H      :@@@@@@@@@@@##############@@,        
            ...            @@,   @@########@@@@9:,r@@@##########      #@@@@@@@##################@@;         
                            @@A; .#########@@@@@#AX5h#@@@@####@,    ,@@@@@###################@@@#           
                             @@@@&H#######@X.          ,&@@@##M    ,@@@@###########@@@@@@@@@@@A,            
                    .:;;;;;, ,@@@@######@2      .,.       A@@@s    @@@##########@@@@@@###H3s.               
                  ,;;;;;:,,.. ,@@@#####@:    X@@@@@@@@s    r@@,   s@@##########@@2,                         
                 ;;;;,          @@@####:   S@@@@@@@@@@@@:   5@,   @@@########@@r                            
                ;;:,             @@@##A   5@@@@@@@@@@@@@@:   @i   @@@########@.                             
               ,;::               @@#@;   @@@#########@@@@   H#   @@########@r                              
               ;::                 @@@:   @@###########@@@   X@   H@########@                               
               ;::                 .@@5   @@@###########@#   @X   A@#######@A                               
               ::;.                 .@@    @@@#########@@    @    @@#######@s                               
               .;;;               :.  @@    H@@@@####@@h    @5   ;@@######@@                                
                :;;;.           .;:,   @@     iH@@@#Ar    ,@9    @@@#####@@.                                
                 ,;;;:.       ,;;;:.    @@s             .H@;    @@@####@@@                                  
                   :;;r;;;;;;r;;:,       @@@&:       ,2#@s    ;@@@###@@@s                                   
                     .::;;;;;:,           @@@@@@@@@@@@2     .#@@@@@@@#r                                     
                                           @@@@@@@@@;    .S@@@@@@@Hr                                        
                                            @@@@@@@    ,9@@@Gs:                                             
                                             #@@#@                                                          
                                              #@@B                                                          
                                               #@2                                                          
                                                @B                                                          
                                                 H                                                          

-->


<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link href="/assets/css/bootstrap.min.css" rel="stylesheet">
<link href="/assets/css/style.css" rel="stylesheet">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<title>北京大学自行车协会</title>
</head>

<body>
<header class="navbar navbar-fixed-top navbar-inverse" id="top" role="banner" style="margin-bottom:0">
  <div class="container">
   <nav class="collapse navbar-collapse bs-navbar-collapse" role="navigation">
    <div class="navbar-header">
      <button class="navbar-toggle collapsed" type="button" data-toggle="collapse" data-target=".bs-navbar-collapse">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a href="javascript:void(0)" class="navbar-brand"><span class="glyphicon glyphicon-home"></span> CAPU</a>
    </div>
   <!-- <nav class="collapse navbar-collapse bs-navbar-collapse" role="navigation"> --><div>
      <ul class="nav navbar-nav">
        <li id="navbar-home"><a href="javascript:setActive('#main')">首页</a></li>
	<li class="devider"></li>
        <li><a href="/bbs/index" target="_blank">进入论坛</a></li>
        <li class="devider"></li>
	<li><a href="http://race.chexie.net">交流赛官网</a></li>
	<li class="devider"></li>
        <!--<li class="dropdown" id="navbar-borrow">
	  <a href="javascript:setActive('#borrow')">自助借车系统</a>
	  <ul class="dropdown-menu" role="menu">
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#borrow-read')">借车须知</a></li>
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#borrow-in')">我要求车</a></li>
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#borrow-out')">我能出借</a></li>
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#borrow-manage')">车辆管理</a></li>
	  </ul>
        </li>-->
<?php
/*
	<li class="devider"></li>
	<li class="dropdown" id="navbar-join">
		<a href="javascript:setActive('#join')">线上报名</a>
		<ul class="dropdown-menu" role="menu">
			<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#join')">入会报名</a></li>
			<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#join-summer')">暑期报名</a></li>
		</ul>
	</li>
*/
?>
	<li class="devider"></li>
	<li class="dropdown" id="navbar-about">
	  <a href="javascript:setActive('#about')">关于协会</a>
	  <ul class="dropdown-menu" role="menu">
<?php
//		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#about-timeline')">新会员的一年</a></li>
?>
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#about')">协会介绍</a></li>
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#about-summer')">暑期介绍</a></li>
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#about-department')">部门介绍</a></li>
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#about-race')">车队介绍</a></li>
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#about-activities')">日常活动</a></li>
		<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:setActive('#about-contact')">联系我们</a></li>
	  </ul>
	</li>
        <li class="devider"></li>
	<li id="navbar-timeline"><a href="javascript:setActive('#timeline')">时间轴</a></li>
        <li class="devider"></li>
	<li id="navbar-download"><a href="javascript:setActive('#download')">下载中心</a></li>
      </ul>
      <ul class="nav navbar-nav navbar-right" id="login_li">
     <?php

  	if ($username=="") {
	 echo '<li><a href="javascript:showlogin()" id="login">登录</a></li>';	
        echo '<li id="navbar-register"><a href="/bbs/register/">注册</a></li>';}
	else {
		echo '<li><a href="javascript:void(0)" style="color:#8db6cd">欢迎您，'.$username.'</a></li><li><a href="javascript:logout()">注销</a>';
	}
	?>
      </ul>	
    </div>
   </nav>
  </div>
</header>

<div class="modal fade" tab-index="-1"  id="login_dialog" role="dialog" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" onclick="closemodal()">
          <span aria-hidden="true">&times;</span>
          <span class="sr-only">Close</span>
        </button>
        <h4 class="modal-title">用户登录</h4>
      </div>
      <div class="modal-body">
        <fieldset>
          <div class="input-group">
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-user"></span>
            </span>
            <input type="text" id="username" class="form-control" placeholder="用户名">
          </div>
          <br>
          <div class="input-group">
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-lock"></span>
            </span>
            <input type="password" id="password" class="form-control" placeholder="密码">
          </div>
          <br> 

	<button type="button" class="btn btn-warning" onclick="forget()">忘记密码？</button>&nbsp;&nbsp;
	  <a href="/bbs/register" type="button" class="btn btn-link">没有账号，立即注册！</a>
        </fieldset>
        <p>
        <div class="alert alert-danger" id="alert" style="display:none">xxx</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="login()">登录</button>
        <button type="button" class="btn btn-default" onclick="closemodal()">关闭</button>
      </div>
    </div>
  </div>
</div>

<iframe id="mainframe" scrolling="no" width="100%" height="700px" frameborder=0></iframe>

<footer class="footer">
    <p>
      <a href="http://www.qiche8.net/" target="_blank"><img src="/assets/images/static/qiche8.jpg" class="img-responsive img-rounded img-thumbnail" alt="远人部落" title="远人部落" width="70" height="70"></a>
      <a href="https://www.specialized.com/cn/zh" target="_blank"><img src="/assets/images/static/specialized.png" class="img-responsive img-rounded img-thumbnail" alt="闪电" title="闪电" width="70" height="70"></a>
      <a href="https://cps.qixin18.com/llb1000885" target="_blank"><img src="/assets/images/static/insurance.png" class="img-responsive img-rounded img-thumbnail" alt="保险" title="保险" width="70" height="70"></a>
    </p>
	<p>地址：北京市海淀区北京大学新太阳活动中心247室（100871）</p>
	<p><a href="javascript:setActive('#about')">关于协会</a> | <a href="http://baike.baidu.com/view/1317218.htm" target="_blank">百度百科</a> | <a href="http://weibo.com/beidachexie" target="_blank">新浪微博</a> | <a href="javascript:setActive('#about-contact')">联系我们</a></p>
	<p><a href="http://www.pku.edu.cn/" target="_blank">北京大学</a> | <a href="http://capu.bdwm.net/" target="_blank">北大未名BBS</a> | <a href="/old/index/" target="_blank">原车协主页</a> | <a href="/old/bbs/main.pl" target="_blank">原车协论坛</a>
	<p>浏览器要求： IE9+/chrome/firefox/safari | 最佳屏幕分辨率 1366*768</p>
	<p>Powered by：CAPU ver 3.0 | Copyright&reg;&nbsp; 2001 - <?php date_default_timezone_set("Asia/Shanghai");echo date("Y",time());?></p>
	<p>京ICP备14031425号</p>
</footer>

<script src="/assets/js/jquery.min.js"></script>
<script src="/assets/js/bootstrap.min.js"></script>
<script src="/bbs/lib/md5.js"></script>
<script src="/assets/js/index.js"></script>
</body>
</html>
