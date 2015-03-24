<!DOCTYPE html>
<html>
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
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link href="/assets/css/bootstrap.min.css" rel="stylesheet">
<link href="/assets/css/nivo-slider.css" rel="stylesheet">
<link href="/assets/css/dark.css" rel="stylesheet">
<link href="/assets/css/eventCalendar.css" rel="stylesheet">
<link href="/assets/css/eventCalendar_theme_responsive.css" rel="stylesheet">
<link href="/assets/css/lightbox.css" rel="stylesheet">
<link href="/assets/css/style.css" rel="stylesheet">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
</head>
<body>
<?php
	require_once '../assets/api/dbconnector.php';
	require_once '../assets/api/checkuser.php';
	$res=checkuser();
	$username=$res[0];
	$rights=intval($res[1]); 


	date_default_timezone_set("Asia/Shanghai");
	dbconnect();
	$statement="select * from capubbs.mainpage where id=0";
	$results=mysql_query($statement);
	$imgs=array();
	$imgthumbs=array();
	$imgtxts=array();
	while ($res=mysql_fetch_array($results)) {
		array_push($imgs,$res[2]);
		array_push($imgthumbs,$res[3]);
		array_push($imgtxts,$res[4]);
	}
	$imgnum=count($imgs);

	$statement="select * from capubbs.mainpage where id=1 order by field3 desc limit 0,10";
	$results=mysql_query($statement);
	$informs=array();
	$informurls=array();
	$informtimes=array();
	while ($res=mysql_fetch_array($results)) {
                array_push($informs,$res[2]);
                array_push($informurls,$res[3]);
		array_push($informtimes,intval($res[4]));
        }
        $informnum=count($informs);

	$statement="select * from capubbs.mainpage where id=2";
	$results=mysql_query($statement);
	$video=array();
	$video_title=array();
	$video_word=array();
	$video_poster=array();
	$video_link=array();
	while ($res=mysql_fetch_array($results)) {
		array_push($video,$res[2]);
		array_push($video_title,$res[3]);
		array_push($video_word,$res[4]);
		array_push($video_poster,$res[5]);
		array_push($video_link,$res[6]);
	}

	$statement="select * from capubbs.borrow where type=0 && state=0";
	$results=mysql_query($statement);
	$lend=mysql_num_rows($results);

	$statement="select * from capubbs.borrow where type=1 && state=0";
	$results=mysql_query($statement);
	$borrow=mysql_num_rows($results);

?>
<div class="container" style="margin-top:90px">
<div class="row">
<div class="col-md-9">
<div class="col-md-5">
<div class="row">
<div class="slider-wrapper theme-dark">

<div id="slider" class="nivoSlider">
<?php
		for ($i=0;$i<$imgnum;$i++)
			echo "<a href='$imgs[$i]' data-lightbox='img-0' data-title='$imgtxts[$i]'><img src='$imgthumbs[$i]' class='img-responsive' title='#title$i'></a>\n";
?>
    </div>

<?php
		for ($i=0;$i<$imgnum;$i++)
			echo "<div class='nivo-html-caption' id='title$i'>$imgtxts[$i]</div>\n";
?>

</div>

</div>
<p>
<div class="row">

<h4 style="padding-left:20px"><b><a href="javascript:window.parent.setActive('#borrow')" style="color:#000000">借车信息</a></b></h4>
<hr style="border-top:1px solid #aaaaaa"/>

  <p class="text-center">当前有 <a href="javascript:window.parent.setActive('#borrow-out')" style="color:#df0000"><?php echo $borrow;?></a> 名会员正在求车</p>
  <p class="text-center">当前有 <a href="javascript:window.parent.setActive('#borrow-in')" style="color:#df0000"><?php echo $lend;?></a> 辆空车可以出借</p>

</div>
<hr style="border-top:1px solid #aaaaaa"/><p>
<div class="row">
    <div class="col-md-4">
	<div class="thumbnail">
	<button class="btn btn-info img-responsive"  id="qrcode_wechat" title="<h5>微信公共号 capu北大车协</h5><br><img width='200px' src='/assets/images/qrcode_wechat.jpg'>"><img src="/assets/images/wechat.png" class="img-responsive img-rounded"/></button>    
	    <div class="caption">
	        <p><center><b>微信</b></center></p>
	    </div>
	</div>
    </div>
    <div class="col-md-4">
        <div class="thumbnail">
         <button class="btn btn-info img-responsive" id="qrcode_android" title="<h5>CAPUBBS for Android</h5><br><img width='200px' src='/assets/images/qrcode_android.png'>"><img src="/assets/images/android.png" class="img-responsive img-rounded"/></button>
	    <div class="caption">
                <p><center><b>Android</b></center></p>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="thumbnail">
         <button class="btn btn-info img-responsive" id="qrcode_ios" title="<h5>CAPUUBBS for iOS</h5></br><img width='200px' src='/assets/images/qrcode_ios.gif'>"><img src="/assets/images/apple.png" class="img-responsive img-rounded" /></button>
	    <div class="caption">
                <p><center><b>iOS</b></center></p>
            </div>
        </div>
    </div>
</div>

</div>

<div class="col-md-7">

<div class="panel panel-success">
<div class="panel-heading"><h4><b>最新通知·公告</b></h4></div>
<ul class="list-group">
  <?php
	$nowtime=time();
	for ($i=0;$i<$informnum;$i++)
	{
		echo '<li class="list-group-item">';
		echo "\n<span class='badge' id='time_$i'>".date("Y/m/d",$informtimes[$i])."</span>\n";
		if ($nowtime-$informtimes[$i]<=259200)
			echo '<span class="label label-danger">new</span>&nbsp;&nbsp;';
		echo "<a href='$informurls[$i]' id='inform_$i' target='_blank'>$informs[$i]</a>";
		echo "<span style='display:none' id='timestamp_$i'>$informtimes[$i]</span>";
		echo "\n</li>\n";
	}
  ?>
</ul>
</div><br>
<h4 style="padding-left:20px"><b>协会视频</b></h4>
<hr style="border-top:1px solid #aaaaaa"/><p>
      <button type="button" class="btn btn-primary" style="margin-left:25px" data-toggle="modal" data-target="#huige_dialog">协会会歌</button>
      <button type="button" class="btn btn-primary"  data-toggle="modal" data-target="#chenai_dialog" style="margin-left:10px">尘埃</button>
<?php
	for ($i=0;$i<=2;$i++) {
		echo '<button type="button" class="btn btn-primary" style="margin-left:10px" data-toggle="modal" data-target="#video_dialog_'.$i.'">'.$video_word[$i].'</button>'."\n";
	}
?>

<p class="text-right"><a href="http://www.soku.com/search_video/q_%E5%8C%97%E5%A4%A7%E8%BD%A6%E5%8D%8F" target="_blank"><span class="label label-success">more</span></a></p>
</div>
</div>
<div class="col-md-3">
		<div id="calendar"></div>

<?php 
if ($rights!=0)
echo '
<div class="row">
	<div class="col-md-6" style="padding:0;text-align:center">
		<button type="button" class="btn btn-primary"  data-toggle="modal" data-target="#image_dialog">设置图片</button>
	</div>
	<div class="col-md-6" style="padding:0;text-align:center">
		<button type="button" class="btn btn-primary" onclick="opencalendar()">设置日历</button>
	</div>
</div>
<p>
<div class="row">
	<div class="col-md-6" style="padding:0;text-align:center">
		<button type="button" class="btn btn-primary"  data-toggle="modal" data-target="#inform_add_dialog">添加公告</button>
	</div>
	<div class="col-md-6" style="padding:0;text-align:center">
		<button type="button" class="btn btn-primary"  data-toggle="modal" data-target="#inform_del_dialog">删除公告</button>
	</div>
</div> ';
else if ($username!="")
echo '
<div class="row">
	<div style="padding:0;text-align:center">
		<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#postimg_dialog">图片投稿</button>
	</div>
</div>';
?>
</div>

</div>
</div>

<div class="modal fade" aria-labelledby="myModalLabel" tab-index="-1" id="calendar_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">修改日历</h4>
      </div>
      <div class="modal-body">
        <p><select id="year" onchange="loadcalendar()">
		<?php
			$today=intval(date("Y",time()));
			for ($i=2014;$i<=$today+1;$i++)
			{
				$x="";if ($i==$today) $x=" selected";
				echo "<option value='$i'$x>$i</option>";
			}
		?>
	   </select>&nbsp;&nbsp;
	   <select id="month" onchange="loadcalendar();">
		<?php
			$today=intval(date("m",time()));
			for ($i=1;$i<=12;$i++)
			{
				$j=$i;
				if ($j<10) $j="0".$j;
				$x="";if ($i==$today) $x=" selected";
				echo "<option value='$j'$x>$j</option>";
			}
		?>
	   </select>&nbsp;&nbsp;<select id="day" onchange="loadcalendar();">
		<?php
			$today=intval(date("d",time()));
			for ($i=1;$i<32;$i++)
			{
				$j=$i;
				if ($j<10) $j="0".$j;
				$x="";if ($i==$today) $x=" selected";
				echo "<option value='$j'$x>$j</option>";
			}
		?>
	   </select></p>
		<div id="calendar_list"></div>
	<div class="alert alert-danger" id="alert_error" style="display:none">
    		<strong>输入有误！</strong>标题不能为空，且标题与描述不得含有如下七个字符：&nbsp;&nbsp;&nbsp;' " [ ] { } ,
	</div>
	<div class="alert alert-success" id="alert_success" style="display:none">
		日历修改成功！请手动刷新页面。
	</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="savecalendar()">保存</button>
         <button type="button" class="btn btn-primary" onclick="window.location.reload();">刷新</button>
	<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" aria-labelledby="myModalLabel" tab-index="-1" id="image_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog" style="width:900px">
    <div class="modal-content">
      <div class="modal-header">
	<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">修改图片</h4>
      </div>
      <div class="modal-body">
	<table class='table table-hover'>
	  <tr><th>编号</th><th>图片地址</th><th>缩略图地址</th><th>标题</th><th>操作</th></tr>
	<?php
	  for ($i=0;$i<$imgnum;$i++) {
		echo '<tr class="imgs" id="img'.($i+1).'">';
		echo '<td>#'.($i+1).'</td>';
		echo '<td style="display:none">'.$imgs[$i].'</td>';
		$x1=$imgs[$i];if (strlen($x1)>25) $x1=substr($x1,0,25)."....";
		echo '<td>'.$x1.'</td>';
		echo '<td style="display:none">'.$imgthumbs[$i].'</td>';
		$x1=$imgthumbs[$i];if (strlen($x1)>25) $x1=substr($x1,0,25)."....";
                echo '<td>'.$x1.'</td>';
		echo '<td>'.$imgtxts[$i].'</td>';
		echo '<td><a href="javascript:moveup('.($i+1).')"><span class="glyphicon glyphicon-circle-arrow-up"></span></a>&nbsp;&nbsp;<a href="javascript:movedown('.($i+1).')"><span class="glyphicon glyphicon-circle-arrow-down"></span></a>&nbsp;&nbsp;<a href="javascript:delimg('.($i+1).')"><span class="glyphicon glyphicon-minus-sign"></span></a></td>';
		echo '</tr>'."\n";
	  }
	  ?>
	  <tr><td></td><td><input type="text" id="inputimg"></td><td><input type="text" id="inputimgthumb"></td><td><input type="text" id="inputimgtxt"></td><td><a href="javascript:check_valid()"><span class="glyphicon glyphicon-plus-sign"></span></a></td></tr></table>
	  <div class="alert alert-danger" id="img_error" style="display:none"></div>
	</div>
    	<div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="saveimg()">提交</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" aria-labelledby="myModalLabel" tab-index="-1" id="huige_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog" style="width:670px">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" onclick="closevideo('huige')"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">北京大学自行车协会会歌 - 跋涉梦想</h4>
      </div>
      <div class="modal-body" style="background:black">
      	<video id="huige_video" preload="none" src="/assets/downloads/anthem.mp4" controls="controls" width="640" height="360" poster="/assets/images/huige.jpg" aria-describedby="full-descript">
	  <p class="text-center"><b>很遗憾，你的浏览器不支持视频播放:（<br>请换用 IE9+/chrome/safari 观看视频，或者直接<a href="/assets/downloads/CAPU_anthem.rmvb" target="_blank">下载观看</a>。</b></p>
	</video>
      </div>
      <div class="modal-footer">
        <a href="/assets/downloads/CAPU_anthem.rmvb" target="_blank" type="button" class="btn btn-primary">下载高清版观看</a>
	<a href="/assets/downloads/CAPU_anthem.mp3" target="_blank" type="button" class="btn btn-primary">MP3格式</a>
	<a href="/assets/downloads/CAPU_anthem_lyrics.gif" target="_blank" type="button" class="btn btn-primary">歌曲简谱</a>
        <button type="button" class="btn btn-default" onclick="closevideo('huige')">关闭</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" aria-labelledby="myModalLabel" tab-index="-1" id="chenai_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog" style="width:670px">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" onclick="closevideo('chenai')"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">北大车协经典歌曲 - 尘埃</h4>
      </div>
      <div class="modal-body" style="background:black">
    	<video controls="controls" preload="none" src="/assets/downloads/dust.mp4" width="640" height="360" poster="/assets/images/chenai.jpg" aria-describedby="full-descript" id="chenai_video">
	  <p class="text-center"><b>很遗憾，你的浏览器不支持视频播放:（<br>请换
用 IE9+/chrome/safari 观看视频，或者直接<a href="/assets/downloads/CAPU_dust.rmvb" target="_blank">下载观看</a>。</b></p>
        </video> 
      </div>
      <div class="modal-footer">
        <a href="/assets/downloads/CAPU_dust.rmvb" target="_blank" type="button" class="btn btn-primary">下载高清版观看</a>
	<a href="/assets/downloads/CAPU_dust.mp3" target="_blank" type="button" class="btn btn-primary">MP3格式</a>
        <button type="button" class="btn btn-default" onclick="closevideo('chenai')">关闭
</button>
      </div>
    </div>
  </div>
</div>
<?php
	for ($i=0;$i<=2;$i++) {
echo '<div class="modal fade" aria-labelledby="myModalLabel" tab-index="-1" id="video_dialog_'.$i.'"  role="dialog"  aria-hidden="true">';
echo '<div class="modal-dialog" style="width:670px">';
echo '<div class="modal-content">';
echo '<div class="modal-header">';
echo '    <button type="button" class="close" onclick="closevideo('."'$i'".')"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>';
echo '        <h4 class="modal-title">'.$video_title[$i].'</h4>';
echo '      </div>';
echo '      <div class="modal-body" style="background:black">';
echo '    	<video id="video_'.$i.'" src="'.$video[$i].'" poster="'.$video_poster[$i].'" controls="controls" preload="none" width="640" height="360" aria-describedby="full-descript">';
echo '	  <p class="text-center"><b>很遗憾，你的浏览器不支持视频播放:（<br>请换用 IE9+/chrome/safari 观看视频，或者直接下载高清版观看。</b></p></video></div>';echo '    <div class="modal-footer">';
echo '        <a id="video_src_'.$i.'" href="'.$video_link[$i].'" target="_blank" type="button" class="btn btn-primary">下载高清版观看</a>';
echo '        <button type="button" class="btn btn-default" onclick="closevideo('."'$i'".')">关闭</button></div> </div></div></div>';
echo "\n";
}
?>
<div class="modal fade" aria-labelledby="myModalLabel" tab-index="-1" id="inform_add_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">添加公告</h4>
      </div>
      <div class="modal-body">
	<form class="form-horizontal" role="form">
	  <div class="form-group">
    	    <label class="col-md-2 control-label">标题</label>
    	    <div class="col-md-9">
      	      <input type="text" class="form-control" id="inform_title" max-length="20">
    	    </div>
  	  </div>
	  <div class="form-group">
            <label class="col-md-2 control-label">链接</label>
            <div class="col-md-6">
              <input type="text" class="form-control" id="inform_url">
            </div>
	    <label class="control-label" style="color:#8B8B8B">&nbsp;&nbsp;无链接&nbsp;</label><input type="checkbox" id="add_inform_checkbox" onclick="inform_checkbox()">
          </div>
	</form>
      </div>
      <div class="modal-footer">
	<button type="button" class="btn btn-primary" onclick="add_inform();">发表</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" tab-index="-1" id="postimg_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog" style="width:777px">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">首页图片投稿</h4>
      </div>
      <div class="modal-body">
	<form class="form-horizontal" role="form">
	  <div class="form-group">
    	    <label class="col-md-2 control-label">图片地址</label>
    	    <div class="col-md-9">
      	      <input type="text" class="form-control" id="postimg_url" placeholder="请输入有效的高清图片地址">
    	    </div>
  	  </div>
	  <div class="form-group">
            <label class="col-md-2 control-label">缩略图地址</label>
            <div class="col-md-9">
              <input type="text" class="form-control" id="postimg_thumburl" placeholder="缩略图宽高比应接近于4:3，宽度不小于300px，且图片大小不超过100kb">
            </div>
          </div>
	  <div class="form-group">
	    <label class="col-md-2 control-label">简要描述</label>
	    <div class="col-md-9">
	      <input type="text" class="form-control" id="postimg_title" placeholder="不能多于20字" maxlength="20">
	    </div>
	  </div>
	<div class="alert alert-danger" id="postimg_error" style="display:none"></div>
	</form>
      </div>
      <div class="modal-footer">
	<button type="button" class="btn btn-primary" onclick="check_valid2()">投稿</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" aria-labelledby="myModalLabel" tab-index="-1" id="inform_del_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">删除公告</h4>
      </div>
      <div class="modal-body">
      	<p>删除第<select id="inform_id" onchange="select_inform();"><option value="">&nbsp;</option>
	<?php
	  for ($i=0;$i<$informnum;$i++)
		echo '<option value="'.$i.'">'.($i+1).'</option>';
	?>
	</select>条公告</p>
	<hr>
	<form class="form-horizontal" role="form">
          <div class="form-group">
            <label class="col-md-2 control-label">标题</label>
            <div class="col-md-8">
              <p class="form-control-static" id="inform_select_title"></p>
	    </div>
          </div>
          <div class="form-group">
            <label class="col-md-2 control-label">链接</label>
            <div class="col-md-8">
              <p class="form-control-static" id="inform_select_url"></p>
            </div>
          </div>
	  <div class="form-group">
            <label class="col-md-2 control-label">发表时间</label>
            <div class="col-md-8">
              <p class="form-control-static" id="inform_select_time"></p>
            </div>
          </div>
	  <div class="form-group" style="display:none">
            <label class="col-md-2 control-label">时间戳</label>
            <div class="col-md-4 ">
              <p class="form-control-static" id="inform_select_timestamp"></p>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" onclick="del_inform()">删除</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
      </div>
    </div>
  </div>
</div>


<script src="/assets/js/jquery.min.js"></script>
<script src="/assets/js/bootstrap.min.js"></script>
<script src="/assets/js/jquery.nivo.slider.pack.js"></script>
<script src="/assets/js/jquery.eventCalendar.min.js"></script>
<script src="/assets/js/lightbox.min.js"></script>
<script src="/assets/js/minitip.js"></script>
<script src="/assets/js/main.js"></script>
</script>
</body>
</html>
