<?php
include("../lib/mainfunc.php");
$id=@$_REQUEST['id'];
$result=mainfunc(array(
"ask"=>"attachdl",
"id"=>$id));
$result=$result[0];
#echo($result);exit;
$aroot="../attachment/";
if($result['code']=="0"){
	$sourceFile=$aroot.$result['path'];
	$outFile=$result['name'];
}else{
	echo("Error when downloading, ".$result['msg']);
	exit;
}
if (!is_file($sourceFile)) { 
die("<b>404 File not found!</b>"); 
} 
$len = filesize($sourceFile); //获取文件大小 
$filename = basename($sourceFile); //获取文件名字 
$outFile_extension = strtolower(substr(strrchr($outFile, "."), 1)); //获取文件扩展名 
//根据扩展名 指出输出浏览器格式 
switch ($outFile_extension) { 
case "exe" : 
$ctype = "application/octet-stream"; 
break; 
case "zip" : 
$ctype = "application/zip"; 
break; 
case "mp3" : 
$ctype = "audio/mpeg"; 
break; 
case "mpg" : 
$ctype = "video/mpeg"; 
break; 
case "avi" : 
$ctype = "video/x-msvideo"; 
break; 
default : 
$ctype = "application/force-download"; 
} 
//Begin writing headers 
header("Cache-Control:"); 
header("Cache-Control: public"); 
//设置输出浏览器格式 
header("Content-Type: $ctype"); 
header("Content-Disposition: attachment; filename=" . $outFile); 
header("Accept-Ranges: bytes"); 
$size = filesize($sourceFile); 
header("Content-Length: " . $size); //输出总长 
//打开文件 
$fp = fopen("$sourceFile", "rb"); 
//设置指针位置 
//虚幻输出 
while (!feof($fp)) { 
//设置文件最长执行时间 
set_time_limit(0); 
print (fread($fp, 1024 * 8)); //输出文件 
flush(); //输出缓冲 
ob_flush(); 
} 
fclose($fp); 
exit (); 
?>