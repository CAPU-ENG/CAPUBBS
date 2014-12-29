<?php
	include("../lib/mainfunc.php");
	date_default_timezone_set('Asia/Shanghai');
	$bid=intval(@$_GET['bid']);
	if ($bid=="") $bid=-1;
	$users=getuser();
	$username=$users['username'];
	$cansee=false;
	$rights=intval($users['rights']);
	if ($rights>=1) $cansee=true;
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>当前在线</title>
<style>
*{font-size:14px}
body{margin:3}
big{color:red}
img,table{border:0}
a:link,a:visited{color:#0129A6;text-decoration:none}
a:hover,a:active{color:red;text-decoration:underline}
TH{filter:alpha(opacity=100,finishopacity=10,style=1,startx=1,starty=1,finishy=200,finishx=1);color:white;background:#A091DE;font-size:10pt;height:25}
#top{color:white}
a:hover#top{font-weight:bold}
#c1{background:#F1EFF8}
#c2{background:#EFF0F8}
#c3{background:#F8F4EF}
.list TD{border-style:solid;border-width:0 1 1 0;border-color:#AAA9A7}
</style>
</head>
<body>
<br><br>
<?php
	$boardmap=array(1=>"车协工作区",2=>"行者足音",3=>"车友宝典",4=>"纯净水",5=>"考察与社会",6=>"五湖四海",7=>"一技之长",9=>"竞赛竞技",28=>"网站维护");
	$nowonlines=mainfunc(array("ask"=>"online"));
	$x=count($nowonlines);
?>
<table style="border:1 solid #A091DE;table-layout:fixed" align=center cellspacing=1 cellpadding=3>
<caption style="margin-bottom:15px;font-size:18px;color:black;filter:dropshadow(offx=1,offy=1,color=#9966FF)">当前在线（共 <?php echo $x;?> 人）</caption>
<colgroup align=center><col width=140><col width=130><col width=130><col width=130><col width=150><?php if ($cansee) echo '<col width=300>';?></colgroup>
<tr><th>用户ID</th><th>最近活动时间</th><th>IP地址</th><th>当前所在版面</th><th>登录方式</th><?php if ($cansee) echo '<th>详细信息</th>';?></tr>
<?php
	for ($i=0;$i<$x;$i++) {
		$co1=intval(rand(0,9));
		$co2=intval(rand(0,9));
		$co3=intval(rand(0,9));
		echo '<tr bgcolor="#F'.$co1.'F'.$co2.'F'.$co3.'"><td>';
		$user=$nowonlines[$i]['username'];
		echo '<a href="../user/?name='.$user.'" target="_blank">'.$user.'</a></td>';
		$time=date("H:i:s",$nowonlines[$i]['tokentime']);
		echo '<td>'.$time.'</td>';
		$ip=$nowonlines[$i]['lastip'];
		if (!$cansee) $ip="*.*.*.*";
		echo '<td>'.$ip.'</td>';
		$board=$nowonlines[$i]['nowboard'];
		if ($board==null) $board="";
		if ($board!="") {
			$board=intval($board);
			$board=$boardmap[$board];	
		}
		echo '<td>'.$board.'</td>';
		$type=$nowonlines[$i]['onlinetype'];
		if ($type=="web") {
			$logininfo=$nowonlines[$i]['logininfo'];
			$infos=getBrowser($logininfo);
			echo '<td>web版登录</td>';
			$systeminfo=$infos['platform'];
			$browserinfo=$infos['name']." ".$infos['version'];
			if ($cansee) echo "<td>$systeminfo<br>$browserinfo</td>";
		}
		else if ($type=="android") {
			$logininfo=$nowonlines[$i]['logininfo'];
			$infos=getdeviceinfo($logininfo);
			echo '<td>Android客户端登录</td>';
			if ($cansee) echo "<td>".$infos['device']."<br>Android ".$infos['version']."</td>";
		}
		else if ($type=="ios") {
			$logininfo=$nowonlines[$i]['logininfo'];
			$infos=getdeviceinfo($logininfo);
			echo '<td>iOS客户端登录</td>';
			if ($cansee) echo "<td>".$infos['device']."<br>iOS ".$infos['version']."</td>";

		}
		else {
			echo '<td></td>';
			echo '<td></td>';
		}
		echo '</tr>'."\n";
	}


	function getBrowser($u_agent) 
	{ 
		$bname = 'Unknown';
		$platform = 'Unknown';
		$version= "";
		$ub="";

		if (preg_match('/linux/i', $u_agent)) {
			if(preg_match('/android/i', $u_agent)){
				$platform = 'Android';
				if (preg_match('/Android 4.4.4/',$u_agent))
					$platform.=" 4.4.4";
				else if (preg_match('/Android 4.4.3/',$u_agent))
					$platform.=" 4.4.3";
				else if (preg_match('/Android 4.4/',$u_agent))
					$platform.=" 4.4+";
				else if (preg_match('/Android 4.3/',$u_agent))
					$platform.=" 4.3+";
				else if (preg_match('/Android 4.2.2/',$u_agent))
					$platform.=" 4.2.2";
				else if (preg_match('/Android 4.2/',$u_agent))
					$platform.=" 4.2+";
				else if (preg_match('/Android 4.1.2/',$u_agent))
					$platform.=" 4.1.2";
				else if (preg_match('/Android 4.1/',$u_agent))
					$platform.=" 4.1+";
				else if (preg_match('/Android 4.0.3/',$u_agent))
					$platform.=" 4.0.3";
				else if (preg_match('/Android 4.0/',$u_agent))
					$platform.=" 4.0";
					
			}else{
				$platform = 'linux';
			}
			
		}
		elseif (preg_match('/macintosh|mac os x/i', $u_agent)) {
			if(preg_match('/iphone/i', $u_agent)){
				$platform = 'iPhone';
			}else if(preg_match('/ipad/i', $u_agent)){
				$platform = 'iPad';
			}else if(preg_match('/ipod/i', $u_agent)){
				$platform = 'iPod Touch';
			}else{
				$platform = 'Mac OS X';
			}
		}
		elseif (preg_match('/windows|win32/i', $u_agent)) {
			$platform = 'Windows';
			if (preg_match('/NT 6.2/i', $u_agent)) { $platform .= ' 8'; }
			elseif (preg_match('/NT 6.3/i', $u_agent)) { $platform .= ' 8.1'; }
			elseif (preg_match('/NT 6.1/i', $u_agent)) { $platform .= ' 7'; }
			elseif (preg_match('/NT 6.0/i', $u_agent)) { $platform .= ' Vista'; }
			elseif (preg_match('/NT 5.1/i', $u_agent)) { $platform .= ' XP'; }
			elseif (preg_match('/NT 5.0/i', $u_agent)) { $platform .= ' 2000'; }
			if (preg_match('/WOW64/i', $u_agent) || preg_match('/x64/i', $u_agent)) { $platform .= ' (x64)'; }
		}
    //echo($u_agent.":".preg_match('/Safari/i',$u_agent));
		if(preg_match('/MSIE/i',$u_agent) && !preg_match('/Opera/i',$u_agent)) 
		{ 
			$bname = 'Internet Explorer'; 
			$ub = "MSIE";
		}elseif(preg_match('/rv:11/i',$u_agent)){
			$bname = 'Internet Explorer';
			$ub = "MSIE";
			$version="11";
		}
		elseif(preg_match('/Firefox/i',$u_agent)) 
		{
			$bname = 'Mozilla Firefox'; 
			$ub = "Firefox"; 
		}
		elseif(preg_match('/Chrome/i',$u_agent)) 
		{
			$bname = 'Google Chrome'; 
			$ub = "Chrome"; 
		}
		elseif(preg_match('/Safari/i',$u_agent)) 
		{
			$bname = 'Apple Safari'; 
			$ub = "Safari";
		}
		elseif(preg_match('/Opera/i',$u_agent)) 
		{
			$bname = 'Opera'; 
			$ub = "Opera";
		}
		elseif(preg_match('/Netscape/i',$u_agent)) 
		{ 
			$bname = 'Netscape'; 
			$ub = "Netscape"; 
		} 
    
		$known = array('Version', $ub, 'other');
		$pattern = '#(?<browser>' . join('|', $known) .
			')[/ ]+(?<version>[0-9.|a-zA-Z.]*)#';
		if (!preg_match_all($pattern, $u_agent, $matches)) {
		}
    
		$i = count($matches['browser']);
		if ($ub!="MSIE" && $version!="11") {
		if ($i != 1) {
			if (strripos($u_agent,"Version") < strripos($u_agent,$ub)){
			$version= $matches['version'][0];
			}
			else {
				$version= $matches['version'][1];
			}
		}
		else {
			$version= $matches['version'][0];
		}
    		}
		if ($version==null || $version=="") {$version="?";}
		return array(
			'userAgent' => $u_agent,
			'name' => $bname,
			'version' => $version,
			'platform' => $platform,
			'pattern' => $pattern
    		);
	}

	function getdeviceinfo($info) {
		$xx=explode("#",$info);
		return array(
			"device"=>@$xx[0],
			"version"=>@$xx[1]
		);
	}
?>

</table>

</body>
</html>
