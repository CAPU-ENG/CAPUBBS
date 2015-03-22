<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link href="/assets/css/bootstrap.min.css" rel="stylesheet">
<link href="/assets/css/style.css" rel="stylesheet">
<?php
	require_once '../assets/api/dbconnector.php';
	require_once '../assets/api/checkuser.php';
	$res=checkuser();
	$username=$res[0];$rights=intval($res[1]); 
?>
</head>

<div class="mycontainer">
<p><h3>协会常用资料下载</h3></p><hr><br>
  <ul>
    
<?php
	dbconnect;
	mysql_query("SET NAMES 'UTF8'");
	$statement="select * from capubbs.downloads where name!='' order by id desc limit 0,10";
	$results=mysql_query($statement);
	$id=0;
	$num=mysql_num_rows($results);
	$ids=array();
	$names=array();
	$urls=array();
	while (($res=mysql_fetch_row($results))!=null) {
		array_push($names,$res[1]);
		array_push($urls,$res[2]);
		array_push($ids,$res[0]);
		echo '<li class="list-group-item" id="d_'.$id.'">
			<span class="badge">'.$res[3].'</span>
			<a href="/index/download_file.php?d='.$res[0].
			'" target="_blank">'.$res[1].'</a>
			<span style="display:none" id="id">'.$res[0].'</span>
			<span style="display:none" id="url">'.$res[2].'</span>
			</li>'."\n";
		$id++;
	}
?>
  </ul>
    <p class="text-right"><a href="http://pan.baidu.com/s/1pJoIo5P" target="_blank"><span class="label label-success">more</span></a></p>
<?php
if ($rights!=0)
echo '
 <br/>
    <div class="form-group" style="margin-left:50px">
        <button class="btn btn-primary" onclick="edit_download()">编辑下载资料</button>

    </div>';
?>
</div>

<div class="modal fade" aria-labelledby="myModalLabel" tab-index="-1" id="edit_dialog"  role="dialog"  aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">编辑下载项</h4>
      </div>
      <div class="modal-body">
      	<p>请选择第<select id="edit_id" onchange="select_item();"><option value="">&nbsp;</option>
<?php
	for ($i=0;$i<$num;$i++) 
		echo '<option value="'.$i.'">'.($i+1).'</option>';
?>	
</select>个下载项，若为空则代表添加新项目</p>
	<hr>
	<form class="form-horizontal" role="form">
          <div class="form-group">
            <label class="col-md-2 control-label">标题</label>
            <div class="col-md-8">
              <input type="text" id="edit_title" class="form-control"></input>
	    </div>
          </div>
          <div class="form-group">
            <label class="col-md-2 control-label">链接</label>
            <div class="col-md-8">
              <input type="text" id="edit_url" class="form-control"></input>
            </div>
          </div>
	  <div class="form-group" style="display:none">
            <label class="col-md-2 control-label">编号</label>
            <div class="col-md-4">
              <p class="form-control-static" id="edit_d"></p>
            </div>
          </div>
        </form>
<div class="alert alert-danger" id="error" style="display:none"></div>
      </div><div class="modal-footer">
        
<span id="add_button">
<button type="button" class="btn btn-primary" onclick="confirm_add()">确认添加新项目</button>
</span>
<span id="edit_button" style="display:none">
<button type="button" class="btn btn-primary" onclick="confirm_edit()">保存编辑</button>
<button type="button" class="btn btn-primary" onclick="confirm_del()">删除此项</button>
</span>
        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
      </div>
    </div>
  </div>
</div>


<script src="/assets/js/jquery.min.js"></script>
<script src="/assets/js/bootstrap.min.js"></script>
<script>
function edit_download() {
	$('#edit_dialog').modal();
}
function select_item() {
	$('#error').hide();
	var id=$('#edit_id').val();
	if (id=="") {
		$('#edit_button').hide();
		$('#add_button').show();
		$('#edit_title,#edit_url,#edit_d').val("");
	}
	else {
		$('#add_button').hide();
		$('#edit_button').show();
		var item=$('#d_'+id).children();
		var title=item.eq(1).text();
		var d=item.eq(2).text();
		var url=item.eq(3).text();
		$('#edit_title').val(title);
		$('#edit_url').val(url);
		$('#edit_d').val(d);
	}
}
function check_valid() {
	var error=$('#error');
	error.hide();
	var title=$('#edit_title').val();
	var url=$('#edit_url').val();
	function _check(a,b,c) {
		if (a=="") {
			error.html("<strong>"+b+"不能为空/strong>");
			error.show();
			$('#edit_'+c).focus();
			return false;
		}
		return true;
	}
	if (!_check(title,"标题","title")) return false;
	if (!_check(url,"链接","url")) return false;
	return true;
}
function callback(data) {
	var x=parseInt(data);
	if (x==-18) {alert("超时或权限不足，请重新登录。");window.parent.showlogin();return;}
	else if (x!=0) {alert("未知错误，错误代码 "+x+" 。请重试或与我们联系寻求解决方案。");return;}
	else {alert("修改成功！");window.location.reload();}
}
function confirm_add() {
	if (!check_valid()) return;
	var title=$('#edit_title').val();
	var url=$('#edit_url').val();
	$.post("/assets/api/main.php",{
		ask:"add_download",
		title:title,
		url:url
		},callback);
}
function confirm_edit() {
	if (!check_valid()) return;
	var title=$('#edit_title').val();
	var url=$('#edit_url').val();
	var id=$('#edit_d').val();
	if (id=="") return;
	$.post("/assets/api/main.php",{
		ask:"edit_download",
		title:title,
		url:url,
		id:id
		},callback);	
}
function confirm_del() {
	var id=$('#edit_d').val();
	if (id=="") return;
	$.post("/assets/api/main.php",{
		ask:"del_download",
		id:id
		},callback);
}
</script>
</html>
