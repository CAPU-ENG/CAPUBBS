<?php
	echo '<capu><info><code>';
	if ($_FILES['file']['error']!=UPLOAD_ERR_OK) {
		echo '6</code><msg>上传失败。错误代码: '.$_FILES['image']['error'].'</msg></info></capu>';
	}
	$filename=urlencode($_FILES['file']['name']);
	if (!move_uploaded_file($_FILES['image']['tmp_name'],"../assets/images/posters/$filename")) {
	echo '6</code><msg>保存文件失败。</msg></info></capu>';
			exit;
	}
	echo '-1</code><url>http://www.chexie.net/assets/images/posters/'.$filename.'</url></info></capu>';
	exit;
?>
