<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="/assets/css/move.css" rel="stylesheet">
<link href="/assets/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<?php
	require_once '../lib.php';
	$con = dbconnect_mysqli();
	$statement="select number from capubbs.borrow where type=1 && state=0";
	$results=mysqli_query($con, $statement);
	$ans=mysqli_num_rows($results);
	
	if ($ans>0) {
		echo '<div class="alert alert-danger text-center" style="margin-top:53px">'.
		'<a href="lend.php" style="color:red"><h4><strong>当前有 '.$ans.' 名会员正在求车，赶快去帮助他们吧！</strong></h4></a>'.
		'</div>';
	}

?>

<ul class="list" style="margin-top:<?php if ($ans==0) echo 90;else echo 10;?>px">
    <li>
        <span class="icon">S</span>
        <div class="text">
            <a href="borrow-read.php"><h2>借车必读</h2></a>
            <h3>请...新会员用力点我</h3>
        </div>
    </li>

    <li>
        <span class="icon">Z</span>
        <div class="text">
            <a href="borrow.php"><h2>我要求车</h2></a>
            <h3>没车没关系，有梦就能骑</h3>
        </div>
    </li>
    <li>
        <span class="icon">N</span>
        <div class="text">
            <a href="lend.php"><h2>我能出借</h2></a>
            <h3>有闲置的车？这里是归宿</h3>
        </div>
    </li>

    <li>
        <span class="icon">B</span>
        <div class="text">
            <a href="manage.php"><h2>车辆管理</h2></a>
            <h3>管理自己的借车求车信息</h3>
        </div>
    </li>

<script src="/assets/js/jquery.min.js"></script>
<script src="/assets/js/bootstrap.min.js"></script>}
</body>    

</html>
