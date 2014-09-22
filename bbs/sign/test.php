<?php
	header("Content-type:text/html;charset=utf-8");
	date_default_timezone_set('Asia/Shanghai');

	error_reporting(E_ALL & ~E_NOTICE);
	echo '<title>签到统计</title>'."\n";
	$con=mysql_connect("localhost","root","19951025");
	mysql_query("set names 'utf8'");

	$date=@$_GET['view'];
	$time=strtotime($date." 00:00:00");

	if ($time==false || $time==-1) $time=time();
	$year=date("Y",$time);
	$month=date("m",$time);
	$day=date("d",$time);

	$statement="select * from capubbs.sign where year=$year && month=$month && day=$day order by hour, minute, second";
	$todays=mysql_query($statement,$con);

	echo "<pre>";
	echo "签到统计 ($year-$month-$day)：\n";
	$i=1;
	while (($res=mysql_fetch_array($todays))!=null) {
		echo '#'.$i.": ".$res['username']."\n";
		$i++;
	}
	echo "\n\n";

	$statement="select * from capubbs.sign where year=$year order by month, day";
	$results=mysql_query($statement,$con);
	echo "本年度签到统计：\n";

	$datas=array();
	while (($res=mysql_fetch_array($results))!=null) {
		$m=intval($res['month']);
		if ($m<10) $m="0".$m;
		$date=$res['year']."-".$m;
		$d=$res['day'];
		$datas[$date][$d]=intval($datas[$date][$d])+1;
	}
	foreach ($datas as $key=>$value) {
		echo $key."\n";
		$y=intval(substr($key,0,4));
		$m=intval(substr($key,5,2));
		for ($i=1;$i<=getdays($y,$m);$i++) {
			$x=0;
			if (@$value[$i]) $x=$value[$i];
			echo $x." ";
		}
		echo "\n\n";
	}
	echo "\n";

	echo "总签到次数排名top100：\n";
	$statement="select username,sign from capubbs.userinfo order by sign desc,username limit 0,100";
	$results=mysql_query($statement);
	$i=1;
	$j=1;
	$last=0;
	while (($res=mysql_fetch_row($results))!=null) {
		$username=$res[0];
		$sign=intval($res[1]);
		if ($sign!=$last) $j=$i;
		echo "#$j: $username   ($sign)\n";
		$last=$sign;
		$i++;
	}
	

	echo "</pre>";

	function getdays($year,$month) {
		$days=array(31,28,31,30,31,30,31,31,30,31,30,31);
		if ($month!=2) return $days[$month-1];
		if ($year%4!=0) return 28;
		if ($year%100==0 && $year%400!=0) return 28;
		return 29;
	}
?>
