<?php
include("../lib/mainfunc.php");
date_default_timezone_set("Asia/Shanghai");
$keyword=@$_POST['keyword'];
$type=@$_POST['type'];
$bid=@$_REQUEST['bid'];
$starttime=@$_POST['starttime'];
$endtime=@$_POST['endtime'];
$author=@$_POST['author'];
$showall=@$_POST['show'];
$result="";
if ($type!="")
$result=mainfunc(array(
"ask"=>"search",
"keyword"=>$keyword,
"bid"=>$bid,
"type"=>$type,
"starttime"=>$starttime,
"endtime"=>$endtime,
"author"=>$author
));

?>
<html>
<head>
<title>CAPUBBS - 搜索</title>
<meta charset="utf-8">
<link rel="stylesheet" href="../lib/general.css">
<link rel="shortcut icon" href="/assets/images/capu.jpg">
<style>
body{
	background-image: url("../lib/bg.jpg");
	background-position: center top;
	background-repeat: no-repeat;
	background-color: #ABC9B6;
}
div.main{
	width: 1000px;
	/*height: 1200px;*/
	overflow: hidden;
	margin-left: auto;
	margin-right: auto;
/* 	background-color: #CBD0E3; */
}
div.head{
	height: 200px;
}
div.content{
	width: 700px;
	margin-left: auto;
	margin-right: auto;
	line-height: 30px;
}
div.content a{
	text-decoration: none;
	color: #484848;
	font-size: 14px;
}
div.content a:hover{
	text-decoration: underline;
}
div.searchArea{
	width: 100%;
	margin-left: 20px;
	position: relative;
}
div.searchArea input.search{
	background-color: #E9EBF2;
	border-radius: 10px;
	outline: none;
	padding-left: 20px;
	height: 20px;
}
div.searchLogo{
	width: 15px;
	height: 15px;
	position: absolute;
	left: 7px;
	top: 8px;
	background-image:url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpldj0iaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzIj4KPGc%2BCgk8cG9seWdvbiBmaWxsPSIjNjY2IiBwb2ludHM9IjkuMjA3LDYuMTI2IDcuNzkzLDcuNTQxIDExLjc5MywxMS41NDEgMTMuMjA3LDEwLjEyNiIgLz4KCTxwYXRoIGZpbGw9IiM2NjYiIGQ9Ik01LjkxNywyYzEuNjA4LDAsMi45MTcsMS4zMDgsMi45MTcsMi45MTdTNy41MjUsNy44MzMsNS45MTcsNy44MzNTMyw2LjUyNSwzLDQuOTE3UzQuMzA4LDIsNS45MTcsMgoJCSBNNS45MTcsMEMzLjIwMSwwLDEsMi4yMDEsMSw0LjkxN3MyLjIwMSw0LjkxNyw0LjkxNyw0LjkxN3M0LjkxNy0yLjIwMSw0LjkxNy00LjkxN0MxMC44MzMsMi4yMDEsOC42MzIsMCw1LjkxNywwTDUuOTE3LDB6IiAvPgo8L2c%2BCjwvc3ZnPgo%3D');
}
</style>
</head>
<body>
<div class="main">
<div class="head">
</div>
<div class="content">

<div class="searchArea">
<div class="searchLogo"></div>
<form method="post">
<input type="text" name="keyword" class="search" placeholder="搜索论坛" value="<?php echo($keyword); ?>">
<select name="type">
<option value="thread" <?php echo($type=="thread"?"selected":""); ?>>搜索帖子标题</option>
<option value="post" <?php echo($type=="post"?"selected'":""); ?>>搜索帖子正文</option>
</select>
<select name="bid">
<?php
	$list=array("1"=>"车协工作区","2"=>"行者足音","3"=>"车友宝典","4"=>"纯净水","5"=>"考察与社会","6"=>"五湖四海","7"=>"一技之长","9"=>"竞赛竞技","28"=>"网站维护");
	foreach ( $list as $key => $value ) {
		echo '<option value="'.$key.'"';
		if (intval($bid)==intval($key)) echo ' selected';
		echo '>'.$value.'</option>'."\n";
	}
?>
</select>
<input type="hidden" name="show" value="<?php echo $showall ?>" id="show">
<input type="submit" value="搜索">
<input type="button" onclick="document.getElementById('more').style.display='';document.getElementById('show').value='1';this.style.display='none';" value="更多搜索选项" <?php if ($showall!="") echo 'style="display:none"'?>>
<span <?php if ($showall=="") echo 'style="display:none"';?> id="more">
<br>
起始时间：<input type="text" name="starttime" value="<?php if($starttime!="") echo $starttime; else echo '2001-01-01';?>" class="search" style="padding-left:5px;width:90px">
&nbsp;&nbsp;终止时间：<input type="text" name="endtime" class="search" style="padding-left:5px;width:90px" value="<?php if($endtime!="") echo $endtime; else echo date("Y-m-d",time());?>">
&nbsp;&nbsp;作者：<input type="text" name="author" class="search" style="padding-left:5px;width:130px" placeholder="不限制则不填" value="<?php if($author!="") echo $author;?>">
</span>
</form>
</div>
<h2 align="center";>搜索结果（只显示前100条）</h2>
<ul>
<?php
if($result==null || count(@$result)==0){
	echo("<b>未找到相关结果</b>");
}
else if($type=="post"){
	foreach($result as $value){
		if(!@$value['title']) continue;
		$bid=$value['bid'];
		$tid=$value['tid'];
		$pid=$value['pid'];
		$title=$value['title'];
		$author=$value['author'];
		$time=formatstamp($value['updatetime']);
		$translated=$value['text'];
		$translated=str_replace("<", "&lt;",$translated);
		$translated=str_replace(">", "&gt;",$translated);

		#$translated=translate($value['text'],$value['ishtml']=="YES");
		if (mb_strlen($translated,'utf-8')>=200) $translated=mb_substr($translated,0,200,'utf-8')."....";
		echo("<li>");
		echo($title."&nbsp;&nbsp;&nbsp;<a href='../content/?bid=$bid&tid=$tid#$pid' style='color:#5c7084'>查看原帖</a><br>");
		echo("<p style='text-indet:2em'>".$translated."<br><font color='#989898'>&nbsp;--- $author 发表于 $time</font></p>");
	}
} else{
	foreach($result as $value){
		if(!@$value['title']) continue;
		$bid=$value['bid'];
		$tid=$value['tid'];
		$title=$value['title'];
		$author=$value['author'];
		//$time=formatstamp($value['timestamp']);
		$time=formatstamp($value['updatetime']);
		echo("<li><a href='../content/?bid=$bid&tid=$tid'>".$value['title']."</a><font color='#989898'>&nbsp;---$author 发表于 $time</font>");
	}
}
?>
</ul>
</div>
</div>
</body>
</html>
