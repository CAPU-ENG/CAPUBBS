<?php

function dbconnect() {
	$con = @mysql_connect('localhost','root','19921025') 
		or die("Cannot connect to database !!!");
}

function mainfunc($posts,$debug=false){
	$ip=$_SERVER["REMOTE_ADDR"];
	@$token=$_COOKIE['token'];
	$url="http://127.0.0.1/api/jiekouapi.php?ip=$ip&token=$token";
	if($debug) $url=$url."&debug=yes";
	$rawstr= http($url,"POST",$posts);
	if($debug) return $rawstr;
	@$xml=simplexml_load_string($rawstr, null, LIBXML_NOCDATA);
	return json_decode(json_encode($xml->xpath("info")),true);
}
function getuser() {
	$res=mainfunc(array("ask"=>"getuser"));
	$res=$res[0];
	$username="";
	$username=$res['username'];
	if ($username==null) $username="";
	if ($username=="" && @$_COOKIE['token']) {
		date_default_timezone_set("Asia/Shanghai");
		$time=time()-999999;
		$date=date("D, d M Y H:i:s",$time)." GMT";
		header('Set-cookie: token=invalid; expires='.$date.'; path=/'."\n",false);
	}
	return array("username"=>$username,"rights"=>$res['rights']);
}
function encode($str){
	$str=str_replace("&", "&amp;", $str);
	$str=str_replace("=", "&#61;", $str);
}
function userhref($username){
	if($username)
	return "<a class='author' href='../user?name=$username' target='_blank'>$username</a>";
}
function userhrefbig($username){
	if($username)
	return "<a class='authorbig' href='../user?name=$username' target='_blank'>$username</a>";
}
function athref($username){
	if($username)
	return "<a class='author' href='../user?name=$username' target='_blank'>@$username</a>";
	return "";
}
function href($link,$name){
	return "<a href='$link' class='link' target='_blank'>$name</a>";
}
function formatstamp($stamp){
	$target=intval($stamp);
	$now=time();
	$s=$now-$target;
	#if($s<60) return "不到1分钟前";
	#if($s<3600) return intval($s/60)."分钟前";
	#if($s<3600*24) return intval($s/3600)."小时前";
	#if($s<3600*24*7) return intval($s/3600/24)."天前";
	date_default_timezone_set('Asia/Shanghai');
	return date("Y-m-d H:i:s",$stamp);
}
function formattime($time){
	date_default_timezone_set('Asia/Shanghai');
	return formatstamp(strtotime($time));
}
function http($url, $method, $postfields) {  
    $ci = curl_init();  
    curl_setopt($ci, CURLOPT_URL, $url);  
    curl_setopt($ci, CURLOPT_CONNECTTIMEOUT, 30); // 连接超时  
    curl_setopt($ci, CURLOPT_TIMEOUT, 30); // 执行超时  
    curl_setopt($ci, CURLOPT_RETURNTRANSFER, true); // 文件流的形式返回，而不是直接输出  
    curl_setopt($ci, CURLOPT_ENCODING, "gzip");  
    curl_setopt($ci, CURLOPT_HEADER, FALSE);
    curl_setopt($ci, CURLOPT_POST, true); // post  
    curl_setopt($ci, CURLOPT_POSTFIELDS, $postfields); // post数据 可为数组、连接字串  
    $response = curl_exec($ci);  
    curl_close($ci);  
    return $response;  
}
function translateicon($icon){
	//if(strstr($icon,".")!="") return $icon;
	//return "/bbsimg/i/$icon.gif";
	if (is_numeric($icon) || is_numeric(substr($icon,1))) return "/bbsimg/i/$icon.gif";
	return $icon;
}
function heal($i){
	$str=strval($i);
	if(strlen($str)==1){
		return '0'.$str;
	}
	return $str;
}
function transfloornum($floornum){
	switch($floornum){
		case 1: return "楼主";
		default: return $floornum."楼";
	}
}
function translateforquote($raw,$ishtml){
	#$html=htmlspecialchars_decode($raw);
	$html=$raw;
	if(!$ishtml) $html=htmlspecialchars_decode($html);
	$html=str_replace(chr(10)."<br>", "<br>",$html);
	$html=str_replace(chr(10), "<br>",$html);
	$html=str_replace(chr(13), "<br>",$html);
	if(!$ishtml) $html=str_replace(" ", "&nbsp;",$html);
	$html=preg_replace("#(\\[img])(.+?)(\\[/img])#", "<img src='$2'>", $html);
	$quoteend="";
	$html=preg_replace("#(\\[quote=)(.+?)(])([\\s\\S]+?)(\\[/quote])#", $quoteend,$html);
	$html=preg_replace("#(\\[size=)(.+?)(])([\\s\\S]+?)(\\[/size])#", "<font size='$2'>$4</font>", $html);
	$html=preg_replace("#(\\[font=)(.+?)(])([\\s\\S]+?)(\\[/font])#", "<font face='$2'>$4</font>", $html);
	$html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)(\\[/color])#", "<font color='$2'>$4</font>", $html);
	#$html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)#", "<font color='$2'>$4</font>", $html);
	$html=preg_replace("#(\\[at])(.+?)(\\[/at])#", athref("$2"), $html);
	$html=preg_replace("#(\\[url])(.+?)(\\[/url])#", href("$2","$2"), $html);
	$html=preg_replace("#(\\[url=)(.+?)(])([\\s\\S]+?)(\\[/url])#", href("$2","$4"), $html);
	$html=preg_replace("#(\\[b])(.+?)(\\[/b])#", "<b>$2</b>", $html);
	$html=preg_replace("#(\\[i])(.+?)(\\[/i])#", "<i>$2</i>", $html);
	return $html;
}
function translate($raw,$ishtml,$space=true){
	$html=$raw;
	if(!$ishtml){
		$html=htmlspecialchars_decode($html);
	}
	$html=str_replace(chr(10)."<br>", "<br>",$html);
	$html=str_replace(chr(10), "<br>",$html);
	$html=str_replace(chr(13), "<br>",$html);
	if(!$space) $html=str_replace(" ", "&nbsp;",$html);
	$html=preg_replace("#(\\[img])(.+?)(\\[/img])#", "<img src='$2'>", $html);
	$quoteend="<div class='quotel'><div class='quoter'>引用自 ".userhref("$2")." ：<br>$4<br></div><br></div>";
	$html=preg_replace("#(\\[quote=)(.+?)(])([\\s\\S]+?)(\\[/quote])#", $quoteend,$html);
	$html=preg_replace("#(\\[size=)(.+?)(])([\\s\\S]+?)(\\[/size])#", "<font size='$2'>$4</font>", $html);
	$html=preg_replace("#(\\[font=)(.+?)(])([\\s\\S]+?)(\\[/font])#", "<font face='$2'>$4</font>", $html);
	$html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)(\\[/color])#", "<font color='$2'>$4</font>", $html);
	$html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)#", "<font color='$2'>$4</font>", $html);
	$html=preg_replace("#(\\[at])(.+?)(\\[/at])#", athref("$2"), $html);
	$html=preg_replace("#(\\[url])(.+?)(\\[/url])#", href("$2","$2"), $html);
	$html=preg_replace("#(\\[url=)(.+?)(])([\\s\\S]+?)(\\[/url])#", href("$2","$4"), $html);
	$html=preg_replace("#(\\[b])(.+?)(\\[/b])#", "<b>$2</b>", $html);
	$html=preg_replace("#(\\[i])(.+?)(\\[/i])#", "<i>$2</i>", $html);
	return $html;
}
?>
