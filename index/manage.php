<!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<?php
	require_once '../lib.php';
	$res=checkuser_mysqli();
	$username=$res[0];$rights=$res[1]; 
	if ($username=="") {
		echo '<script>alert("请先注册或登录！");'.
		'window.parent.showlogin();</script></head></html>';
		exit;
	}
	date_default_timezone_set('Asia/Shanghai');
	$con = dbconnect_mysqli();
?>
<link href="/assets/css/bootstrap.min.css" rel="stylesheet">
<link href="/assets/css/style.css" rel="stylesheet">
<script src="/assets/js/jquery.min.js"></script>
<script src="/assets/js/bootstrap.min.js"></script>
<script src="/assets/js/self-borrow.js"></script>
</head>
<body>

<div class="mycontainer">

<p><h3><?php echo $username;?>的车辆管理</h3><span style="display:none" id="username"><?php echo $username;?></span></p>
<hr><br>

<div style="margin-left:30px;margin-right:30px;margin-top:10px">
  <ul class="nav nav-tabs" role="tablist">
    <li class="active"><a id="nav-lend" href="#lend" role="tab" data-toggle="tab"><h5>我的出车信息</h5></a></li>
    <li class="devider"></li>
    <li><a id="nav-borrow" href="#borrow" role="tab" data-toggle="tab"><h5>我的求车信息</h5></a></li>
  </ul>
  <p>

  <div class="tab-content">
    <div class="tab-pane fade in active" id="lend">
	<div>
    	  <table class="table table-hover">
		<tr>
        		<th>编号</th>
        		<th>车型</th>
        		<th>车架尺寸</th>
			<th>手机号</th>
			<th>更新时间</th>
			<th>状态</th>
			<th>操作</th>
     		 </tr>
		<?php
			$statement="select * from capubbs.borrow where type=0 && id='$username' && state!=2 order by state";
			$results=mysqli_query($con, $statement);
			while (($res=mysqli_fetch_row($results))!=null) {
				$id=$res[0];
				$state=intval($res[11]);
				$time=$res[10];
				echo '<tr class="lend_tr" id="lend_'.$id.'">'."\n".
				'<td>#'.$id.'</td>'."\n".'<td>'.$res[6].'</td>'."\n".
				'<td>'.$res[8].'</td>'."\n".'<td>'.$res[4].'</td>'."\n".
				'<td>'.date("Y-m-d H:i:s",$time).'</td>'."\n".
				'<td>';
				echo '<select>'.
				'<option value="0"';
				if ($state==0) echo ' selected';
				echo '>空闲中</option>'."\n";
				echo '<option value="1"';
				if ($state==1) echo ' selected';
				echo '>已出借</option></select></td>'.
				'<td style="display:none">'.$state.'</td>'.
				'<td><a href="javascript:del('."'$id','lend'".')"><span class="glyphicon glyphicon-minus-sign"></span></a></td>'.
				'<td style="display:none" id="lendshow_'.$id.'">1</td>'.
				'</tr>'."\n";
			}
		?>
		</table>
		<p class="text-right">
			<a href="lend.php" type="button" class="btn btn-success">添加新车</a>&nbsp;&nbsp;&nbsp;
			<button type="button" class="btn btn-primary" onclick="savechange('lend')">保存修改</button>&nbsp;&nbsp;&nbsp;
			<button type="button" class="btn btn-default" onclick="resetchange('lend')">重置设置</button>
		</p>
	</div>
	


    </div>
    <div class="tab-pane fade" id="borrow">
	<div>
    	  <table class="table table-hover">
		<tr>
        		<th>编号</th>
        		<th>性别</th>
        		<th>身高</th>
			<th>电话</th>
			<th>更新时间</th>
			<th>状态</th>
			<th>操作</th>
     		 </tr>
		<?php
                        $statement="select * from capubbs.borrow where type=1 && id='$username' && state!=2 order by state";
                        $results=mysqli_query($con, $statement);
                        while (($res=mysqli_fetch_row($results))!=null) {
                                $id=$res[0];
                                $state=intval($res[11]);
                                $time=$res[10];
				echo '<tr class="borrow_tr" id="borrow_'.$id.'">'."\n".
                                '<td>#'.$id.'</td>'."\n".'<td>'.$res[3].'</td>'."\n".
                                '<td>'.$res[5].'cm</td>'."\n".'<td>'.$res[4].'</td>'."\n".
                                '<td>'.date("Y-m-d H:i:s",$time).'</td>'."\n".
                                '<td>';
                                echo '<select>'.
                                '<option value="0"';
                                if ($state==0) echo ' selected';
                                echo '>求借中</option>'."\n";
                                echo '<option value="1"';
                                if ($state==1) echo ' selected';
                                echo '>已借到</option></select></td>'.
                                '<td style="display:none">'.$state.'</td>'.
                                '<td><a href="javascript:del('."'$id','borrow'".')"><span class="glyphicon glyphicon-minus-sign"></span></a></td>'.
                                '<td style="display:none" id="borrowshow_'.$id.'">1</td>'.
                                '</tr>'."\n";
                        }
		?>
		</table>
                <p class="text-right">
                        <a href="borrow.php" type="button" class="btn btn-success">添加新信息</a>&nbsp;&nbsp;&nbsp;
                        <button type="button" class="btn btn-primary" onclick="savechange('borrow')">保存修改</button>&nbsp;&nbsp;&nbsp;
                        <button type="button" class="btn btn-default" onclick="resetchange('borrow')">重置设置</button>
                </p>
        </div>
    </div> 
  </div>
</div>
</body>
</html>
