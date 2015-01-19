<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<?php 
	require '../assets/api/checkuser.php';
	$res=checkuser();
	$username=$res[0];$rights=$res[1]; 

	if ($username=="") {
		echo '<script>';
		echo 'alert("请先注册或者登录！");';
		echo 'window.parent.showlogin();';
		echo '</script></head></html>';
		exit;
	}

?>


<link href="../assets/css/bootstrap.min.css" rel="stylesheet">
<link href="../assets/css/style.css" rel="stylesheet">
</head>
<body>
<div class="mycontainer" style="padding-bottom:20px">


  <p> <h3>请完整填写报名信息</h3></p>
  <hr/>
  <br/>  
<form id="joinform" class="form-horizontal" role="form" class="margin-bottom:20px">

<div class="form-group" style="margin-bottom:50px">
    <label for="inputType" class="col-md-2 control-label">报名类型</label>
    <div class="col-md-4">
      <div class="radio-inline">
          <input type="radio" checked name="optionsRadios2" value="join" id="type1" onclick="changetype('join')">
          入会报名
      </div>
      <div class="radio-inline">
          <input type="radio" name="optionsRadios2" value="summer" id="type2" onclick="changetype('summer')">
          暑期报名
      </div>    
    </div>
  </div>

  <div class="form-group">
    <label for="inputName2" class="col-md-2 control-label">论坛ID</label>
    <div class="col-md-4 ">
      <input type="text" class="form-control" id="id" <?php echo "value='$username'" ?> Readonly>
    </div>
  </div>

  <div class="form-group">
    <label for="inputName2" class="col-md-2 control-label">姓名</label>
    <div class="col-md-4 ">
      <input type="text" class="form-control" id="name">
    </div>
    <label class="control-label" style="color:#CBCBCB">请填写真实姓名</label>
  </div>

  <div class="alert alert-danger" id="alert_name" style="display:none">
    <strong>姓名不能为空</strong>
  </div>

  <div class="form-group">
    <label for="inputSex" class="col-md-2 control-label">性别</label>
    <div class="col-md-4">
      <div class="radio-inline">
          <input type="radio" name="optionsRadios" value="female" id="sex1" checked>
          女
      </div>
      <div class="radio-inline">
          <input type="radio" name="optionsRadios" value="male" id="sex2">
          男
      </div>    
    </div>
  </div>


  <div class="form-group">
    <label for="inputContact" class="col-md-2 control-label">联系电话</label>
    <div class="col-md-4 help-inline">
      <input type="tel" name="phone" class="form-control" id="contact">
    </div>
    <label class="control-label" style="color:#CBCBCB">请填写正确的手机号码，报名完成后系统将短信通知</label>
  </div>

<div class="alert alert-danger" id="alert_phone" style="display:none">
    <strong>请填写正确的11位手机号码(1xxxxxxxxxx)</strong>
</div>


  <div class="form-group">
    <label for="inputSex" class="col-md-2 control-label">入学年份</label>
    <div class="col-md-4">
      <select class="form-control" id="year">
        <option value="010">10本</option>
        <option value="011">11本</option>
        <option value="012">12本</option>
        <option value="013">13本</option>
        <option value="014" selected>14本</option>
        <option value="112">12研</option>
        <option value="113">13研</option>
        <option value="114">14研</option>
        <option value="200">其他</option>
      </select>
    </div>
  </div>
</script>

  <div class="form-group" style="display:none">
    <label for="inputName2" class="col-md-2 control-label">序列号 <span class="label label-danger" id="number_info" title="北京大学自行车协会入会费是10元。入会后将得到车协会员资格并可获取年刊等资料。<br>你可以现在就在我们的淘宝网店付款10元得到一个序列号，凭此序列号认可你的车协会员身份。<br>你也可以现在不付款，到时候线下再进行付款。">?</span><span class="label label-danger" id="number_info_2" title="北京大学自行车协会暑期报名费为20元。报名后即有资格参加暑期远征队员的选拔。<br>你可以现在就在我们的淘宝网店付款20元得到一个序列号，凭此序列号认可你已经报名暑期并缴费。<br>你也可以现在不付款，到时候线下再进行付款。" style="display:none">?</span></label>
    <div class="col-md-4 ">
      <input type="text" class="form-control" id="number">
    </div>
    <label class="control-label"><a href="#">立即获得序列号！</a></label>
  </div>

<div class="alert alert-danger" id="alert_number" style="display:none">
    <strong>无效的序列号</strong>
</div>

  <div class="form-group">
    <label for="inputContact" class="col-sm-2 control-label">备注</label>
    <div class="col-xs-4 ">
      <textarea class="form-control" rows="3" placeholder="备注信息（不超过20字）" id="other" maxlength="25"></textarea>
    </div>
  </div>

  <div class="form-group">
    <label for="inputName2" class="col-md-2 control-label">验证码</label>
    <div class="col-md-10" style="padding-left:0">
    <div class="col-md-2">
        <input type="text" id="captcha" class="form-control"/>
    </div>
    <div class="col-md-10">
	<img id="img_captcha" src="../assets/api/securimage/securimage_show.php"/>
    <button class="btn btn-link control-label" onclick="changecaptcha()">看不清？换一个！</button></div>
    <div class="col-md-12"><p class="form-control-static" style="color:#AAAAAA">请输入图片中算式的计算结果</p></div>
  </div></div>

<div class="alert alert-danger" id="alert_captcha" style="display:none">验证码无效，请重新输入</div>

  <div class="form-group" style="margin-bottom:50px">
    <label class="col-sm-2 control-label"></label>
    <div class="col-xs-4">
    	<input type="button" id="confirm_button"  class="btn btn-primary" onclick="clicked()" value="提交">
    </div>
  </div>
</form>
</div>

<div class="modal fade" tab-index="-1"  id="confirm_dialog" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">报名成功！</h4>
      </div>
      <div class="modal-body">
       <span class="join_modal"> <p>恭喜！您已经成为了北京大学自行车协会的一员！<br>您的入会信息已经通过短信发送到了您的手机上。<br>请凭该短信于<span style="color:red">周五下午</span>在<span style="color:red">三角地出摊地（农园西北角）</span><span id="dd">交10元钱入会费</span>并领取会员证与年刊。</p></span>
	<p>由于网络及运营商等问题，短信会有几分钟到几十分钟不等的延迟。<br><a href="javascript:window.parent.setActive('#contact')">长时间未收到短信？请联系我们！</a></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="window.location.reload();">确认</button>
      </div>
    </div>
  </div>
</div>

<script src="../assets/js/jquery.min.js"></script>
<script src="../assets/js/bootstrap.min.js"></script>
<script src="../assets/js/minitip.js"></script>
<script src="../assets/js/join.js"></script>
</body>
</html>
