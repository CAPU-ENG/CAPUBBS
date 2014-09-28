<!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link href="/assets/css/bootstrap.min.css" rel="stylesheet">
<link href="/assets/css/style.css" rel="stylesheet">
<script src="/assets/js/jquery.min.js"></script>
<script src="/assets/js/bootstrap.min.js"></script>
<script src="/assets/js/self-borrow.js"></script>
<?php
	require '../assets/api/checkuser.php';
	$res=checkuser();
	$username=$res[0];$rights=$res[1];
	date_default_timezone_set('Asia/Shanghai');
?>
</head>
<body>
<div class="mycontainer"> 
  <p> <h3>当前求借车信息</h3></p><span style="display:none" id="username"><?php echo $username; ?></span>
  <hr/>
  <br/>  
  
  <div>
    <table class="table table-hover">
      <tr>
        <th width="50px"></th>
        <th>ID</th>
        <th>性别</th>
        <th>车架尺寸</th>
        <th>身高</th>
        <th width="30%">备注</th>
	<th>更新时间</th>
	<th>状态</th>
      </tr>

<?php
	$con=mysql_connect("localhost","root","19951025");
	mysql_query('SET NAMES UTF8');
	$statement="select * from capubbs.borrow where type=1 && state!=2 order by state";
	$results=mysql_query($statement,$con);

	$i=0;
	while ($res=mysql_fetch_row($results)) {
		$state=intval($res[11]);
		echo '<tr>'."\n";
		echo '<td width="50px">';
		if ($state==0)
			echo '<input type="radio" name="radio" value="'.$i.'">';
		echo '</td>'."\n";
		echo '<td id="id_'.$i.'">'.$res[2].'</td>'."\n";
		echo '<td>'.$res[3].'</td>'."\n";
		echo '<td>'.$res[8].'</td>'."\n";
		echo '<td>'.$res[5].'cm</td>'."\n";
		echo '<td>'.$res[9].'</td>'."\n";
		echo '<td>'.date("Y-m-d H:i:s",$res[10]).'</td>'."\n";
		echo '<td>';
		if ($state==0) echo '求借中';
		else echo '已借到';
		echo '</td>'."\n";
		echo '<td style="display:none" id="number_'.$i.'">'.$res[0].'</td>'."\n";
		echo '</tr>';
		$i++;
	}
?>
    </table>

    <br/>
    <div class="form-group" style="margin-left:50px">
        <button type="submit" class="btn btn-primary" onclick="lendto()">我可以借车</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
 
        <a href="javascript:newlend()" class="btn btn-warning" id="borrow">录入我的车的信息</a>

    </div>


<div class="modal fade  bs-example-modal-sm" tab-index="-1"  id="borrow_dialog" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
            <h4 class="modal-title" id="myModalLabel">请填写车辆信息，若有会员希望借车会通过短信联系您</h4>
          </div>
          <div class="modal-body">
            

            <form class="form-horizontal" role="form">
  <div class="form-group">
    <label for="id" class="col-sm-2 control-label">论坛ID</label>
    <div class="col-xs-4 ">
      <input type="text" class="form-control" id="id" <?php echo 'value="'.$username.'"'; ?> Readonly>
    </div>
  </div>

  <div class="form-group">
    <label for="inputSex" class="col-sm-2 control-label">性别</label>
    <div class="col-xs-4">
      <div class="radio-inline">
          <input type="radio" name="optionsRadios" id="sex1" value="option1" checked>
          女
      </div>
      <div class="radio-inline">
          <input type="radio" name="optionsRadios" id="sex2" value="option2">
          男
      </div>    
    </div>
  </div>


  <div class="form-group">
    <label for="contact" class="col-sm-2 control-label">联系电话</label>
    <div class="col-xs-4 help-inline">
      <input type="tel" class="form-control" id="contact">
    </div>
    <label class="control-label" style="color:#CBCBCB">请填有效号码</label>
  </div>


<div class="alert alert-danger" id="alert_phone" style="display:none">
    <strong>请填写正确的11位手机号码(1xxxxxxxxxx)</strong>
</div>


  <div class="form-group">
    <label for="inputSex" class="col-sm-2 control-label">车型</label>
    <div class="col-xs-4">
      <select class="form-control" id="bike">
        <option value="UCC-阿帕奇">UCC-阿帕奇</option>
        <option value="UCC-德曼特">UCC-德曼特</option>
        <option value="MERIDA-勇士">MERIDA-勇士</option>
        <option value="MERIDA-公爵">MERIDA-公爵</option>
        <option value="MERIDA-挑战者">MERIDA-挑战者</option>
        <option value="GIANT-660">GIANT-660</option>
        <option value="GIANT-770">GIANT-770</option>
        <option value="GIANT-777">GIANT-777</option>
        <option value="GIANT-890">GIANT-890</option>
        <option value="其他">其他，请在备注说明</option>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="inputSex" class="col-sm-2 control-label">车架尺寸</label>
    <div class="col-xs-4">
      <select class="form-control" id="length">
        <option value="15寸">15寸</option>
        <option value="16寸">16寸</option>
        <option value="17寸" selected>17寸</option>
        <option value="18寸">18寸</option>
        <option value="19寸">19寸</option>
        <option value="其他">其他，请在备注说明</option>

      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="inputInfo" class="col-sm-2 control-label">车况</label>
    <div class="col-xs-7">
      <select class="form-control" id="condition">
        <option value="棒棒哒，跟新的一样">棒棒哒，跟新的一样</option>
        <option value="还不错，虽然历经风雨但是保养得不错">还不错，虽然历经风雨但是保养得不错</option>
        <option value="一般般，不过去趟普通拉练妥妥的">一般般，不过去趟普通拉练妥妥的</option>
        <option value="不太好，有段时间没保养了">不太好，有段时间没保养了</option>
      </select>
    </div>
  </div>

  <div class="form-group">
    <label for="inputContact" class="col-sm-2 control-label">备注</label>
    <div class="col-xs-7">
      <textarea class="form-control" id="hint" rows="3" placeholder="可填想对借车人说的话，不超过50字" maxlength="55"></textarea>
    </div>
  </div>

<div class="alert alert-danger" id="alert_hint" style="display:none">
    <strong>备注中不能含有英文单引号和双引号 ' "</strong>
</div>

<div class="form-group">
    <label for="inputName2" class="col-md-2 control-label">验证码</label>
    <div class="col-md-10" style="padding-left:0">
    <div class="col-md-2">
        <input type="text" id="captcha_3" class="form-control"/>
    </div>
    <div class="col-md-10">
	<img id="img_captcha_3" src="/assets/api/securimage/securimage_show.php?3444"/>
    <button class="btn btn-link control-label" onclick="changecaptcha('3')">看不清？换一个！</button></div>
    <div class="col-md-12"><p class="form-control-static" style="color:#AAAAAA">请输入图片中算式的计算结果</p></div>
  </div></div>

<div class="alert alert-danger" id="alert_captcha_3" style="display:none">验证码无效，请重新输入</div>


</form>

</div>
          <div class="modal-footer">
            <button id="confirm_button" onclick="makenewlend()"  class="btn btn-primary">提交</button>
            <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
          </div>
        </div>
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
        <p id="confirm_modal_text">若有会员希望向您借车，系统会向您提供的手机号发送短信！</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal">确认</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" tab-index="-1" id="lendto_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title" id="lendto_title"></h4>
      </div>
      <div class="modal-body">
	<form class="form-horizontal" role="form">
	  <div class="form-group">
    	    <label class="col-md-2 control-label">ID</label>
    	    <div class="col-md-4 ">
      	      <input type="text" class="form-control" id="inform_title" max-length="20" <?php echo 'value="'.$username.'" ' ?> Readonly>
    	    </div>
  	  </div>
	  <div class="form-group">
            <label class="col-md-2 control-label">手机号</label>
            <div class="col-md-4 help-inline">
              <input type="text" class="form-control" id="lendto_phone">
            </div>
          </div>
	  <div class="form-group">
	    <label class="col-md-2 control-label"></label>
	    <div class="col-md-10">
		<p class="form-control-static">系统会将您的手机号通过短信发送给对方，请静待线下联系。</p></div></div>
	<div class="alert alert-danger" id="alert_lendto_phone" style="display:none">
    <strong>请填写正确的11位手机号码(1xxxxxxxxxx)</strong>
</div>

  <div class="form-group">
    <label for="inputName2" class="col-md-2 control-label">验证码</label>
    <div class="col-md-10" style="padding-left:0">
    <div class="col-md-2">
        <input type="text" id="captcha_4" class="form-control"/>
    </div>
    <div class="col-md-10">
	<img id="img_captcha_4" src="/assets/api/securimage/securimage_show.php?2333"/>
    <button class="btn btn-link control-label" onclick="changecaptcha('4')">看不清？换一个！</button></div>
    <div class="col-md-12"><p class="form-control-static" style="color:#AAAAAA">请输入图片中算式的计算结果</p></div>
  </div></div>

<div class="alert alert-danger" id="alert_captcha_4" style="display:none">验证码无效，请重新输入</div>
	</form>
	<span style="display:none" id="lendto_id"></span>
      </div>
      <div class="modal-footer">
	<button type="button" class="btn btn-primary" onclick="confirmlendto()">确定</button>
        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
      </div>
    </div>
  </div>
</div>

</form>
</div>
</body>
</html>


