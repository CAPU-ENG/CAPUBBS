<!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link href="/assets/css/bootstrap.min.css" rel="stylesheet">
<link href="/assets/css/style.css" rel="stylesheet">
<script src="/assets/js/jquery.min.js"></script>
<script src="/assets/js/bootstrap.min.js"></script>
<script src="/assets/js/self-borrow.js"></script>
<?php
	require_once '../lib.php';
	$res=checkuser_mysqli();
	$username=$res[0];$rights=$res[1]; 
	date_default_timezone_set('Asia/Shanghai');
?>
</head>
<body>

<div class="mycontainer"> 
  <p> <h3>当前可借车辆</h3><span style="display:none" id="username"><?php echo $username; ?></span></p>
  <hr/>
  <br/>  
  
  <div>
    <table class="table table-hover">
      <tr>
        <th width="5%"></th>
        <th width="12%">ID</th>
        <th width="13%">车型</th>
        <th width="6%">尺寸</th>
        <th width="24%">车况</th>
	<th width="13%">更新时间</th>
        <th width="26%">备注</th>
      </tr>
<?php
	dbconnect();
	$statement="select * from capubbs.borrow where type=0 && state=0";
	$results=mysql_query($statement);
	$i=0;
	while (($res=mysql_fetch_row($results))!=null) {
		echo '<tr><td style="display:none" id="number_'.$i.'">'.$res[0].'</td>'."\n".
		'<td width="50px"><input type="radio" name="radio" value="'.$i.'"</td>'."\n".
		'<td id="id_'.$i.'">'.$res[2].'</td>'."\n".
		'<td>'.$res[6].'</td>'."\n".
		'<td>'.$res[8].'</td>'."\n".
		'<td>'.$res[7].'</td>'."\n".
		'<td>'.date("Y-m-d H:i:s",$res[10]).'</td>'."\n".
		'<td style="width:200px;word-break:all">'.$res[9].'</td>'."\n</tr>\n";
		$i++;
	}
?>
    </table>

    <br/>
    <div class="form-group" style="margin-left:50px">
        <button type="submit" class="btn btn-primary" onclick="borrowfrom()">我想借车</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
 
        <a href="#" class="btn btn-warning" id="borrow" onclick="newborrow()">没有合适的车</a>

    </div>

<div class="modal fade" tab-index="-1" id="borrowfrom_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title" id="borrowfrom_title"></h4>
      </div>
      <div class="modal-body">
	<form class="form-horizontal" role="form">
	  <div class="form-group">
    	    <label class="col-md-2 control-label">ID</label>
    	    <div class="col-md-4 ">
      	      <input type="text" class="form-control" id="borrowfrom_title" max-length="20" <?php echo 'value="'.$username.'"';?> Readonly>
    	    </div>
  	  </div>
	  <div class="form-group">
            <label class="col-md-2 control-label">手机号</label>
            <div class="col-md-4 help-inline">
              <input type="text" class="form-control" id="borrowfrom_phone">
            </div>
          </div>
	  <div class="form-group">
	    <label class="col-md-2 control-label"></label>
	    <div class="col-md-10">
		<p class="form-control-static">系统会将您的手机号通过短信发送给对方，请静待线下联系。</p></div></div>
	<div class="alert alert-danger" id="alert_borrowfrom_phone" style="display:none">
    <strong>请填写正确的11位手机号码(1xxxxxxxxxx)</strong>
</div>

<div class="form-group">
    <label for="inputName2" class="col-md-2 control-label">验证码</label>
    <div class="col-md-10" style="padding-left:0">
    <div class="col-md-2">
        <input type="text" id="captcha_1" class="form-control"/>
    </div>
    <div class="col-md-10">
	<img id="img_captcha_1" src="/assets/api/securimage/securimage_show.php?3444"/>
    <button class="btn btn-link control-label" onclick="changecaptcha('1')">看不清？换一个！</button></div>
    <div class="col-md-12"><p class="form-control-static" style="color:#AAAAAA">请输入图片中算式的计算结果</p></div>
  </div></div>

<div class="alert alert-danger" id="alert_captcha_1" style="display:none">验证码无效，请重新输入</div>


	</form>
	<span style="display:none" id="borrowfrom_id"></span>
      </div>
      <div class="modal-footer">
	<button type="button" class="btn btn-primary" onclick="confirmborrowfrom()">确定</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
      </div>
    </div>
  </div>
</div>


    <div class="modal fade" tab-index="-1"  id="borrow_dialog" role="dialog" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
            <h4 class="modal-title" id="myModalLabel">请填写个人信息，若有合适的车会通过短信联系您</h4>
          </div>
          <div class="modal-body">
            <form class="form-horizontal" role="form">
  		<div class="form-group">
   		 <label for="id" class="col-sm-2 control-label">论坛ID</label>
   		 <div class="col-xs-4 ">
   		   <input type="text" class="form-control" id="id" <?php echo 'value="'.$username.'"';?> Readonly>
   	 	  </div>
  		</div>
 	 <div class="form-group">
 	   <label class="col-sm-2 control-label">性别</label>
    		<div class="col-xs-4">
    		  <div class="radio-inline">
    		      <input type="radio" name="optionsRadios" id="sex0" value="option1" checked>女
     		 </div>
      		<div class="radio-inline">
          		<input type="radio" name="optionsRadios" id="sex1" value="option2">男</div>    
    		</div>
 	 </div>

	  <div class="form-group">
	    <label class="col-sm-2 control-label">联系电话</label>
		    <div class="col-xs-4 help-inline">
		      <input type="tel" class="form-control" id="contact">
		    </div>
   		 <label class="control-label" style="color:#CBCBCB">请填有效号码</label>
  	</div>


<div class="alert alert-danger" id="alert_phone" style="display:none">
    <strong>请填写正确的11位手机号码(1xxxxxxxxxx)</strong>
</div>

  <div class="form-group">
    <label for="inputHeight" class="col-sm-2 control-label">身高(cm)</label>
    <div class="col-xs-4 help-inline">
      <input type="number" class="form-control" id="height">
    </div>
  </div>

<div class="alert alert-danger" id="alert_height" style="display:none">
    <strong>请输入有效身高，单位是cm</strong>
</div>

  <div class="form-group">
    <label for="inputSex" class="col-sm-2 control-label">车架尺寸</label>
    <div class="col-xs-4">
      <select class="form-control" id="length">
        <option value="15寸">15寸</option>
        <option value="16寸">16寸</option>
        <option value="17寸">17寸</option>
        <option value="18寸">18寸</option>
        <option value="19寸">19寸</option>
        <option value="">我不知道</option>
      </select>
    </div>
  </div>


  <div class="form-group">
    <label for="inputContact" class="col-sm-2 control-label">备注</label>
    <div class="col-xs-7">
      <textarea class="form-control" rows="3" id="hint" placeholder="不超过50字" maxlength="55"></textarea>
    </div>
  </div>

<div class="alert alert-danger" id="alert_hint" style="display:none">
    <strong>备注中不能含有英文单引号和双引号 ' "</strong>
</div>

<div class="form-group">
    <label for="inputName2" class="col-md-2 control-label">验证码</label>
    <div class="col-md-10" style="padding-left:0">
    <div class="col-md-2">
        <input type="text" id="captcha_2" class="form-control"/>
    </div>
    <div class="col-md-10">
	<img id="img_captcha_2" src="/assets/api/securimage/securimage_show.php?3444"/>
    <button class="btn btn-link control-label" onclick="changecaptcha('2')">看不清？换一个！</button></div>
    <div class="col-md-12"><p class="form-control-static" style="color:#AAAAAA">请输入图片中算式的计算结果</p></div>
  </div></div>

<div class="alert alert-danger" id="alert_captcha_2" style="display:none">验证码无效，请重新输入</div>


</form>
        </div>
          <div class="modal-footer">
            <a id="confirm_button"  class="btn btn-primary" onclick="makenewborrow()">提交</a>
            <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
          </div>
    </div>
  </div>
</div>


<div class="modal fade" tab-index="-1"  id="confirm_dialog" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="margin-top:80px">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">录入成功！</h4>
      </div>
      <div class="modal-body">
        <p id="confirm_modal_text">若有车主愿意借车给您，系统会向您提供的手机号发送短信！</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal">确认</button>
      </div>
    </div>
  </div>
</div>
</body>
</html>


