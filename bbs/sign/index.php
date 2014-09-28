<?php
	include "../lib/mainfunc.php";
	header("Content-type:text/html;charset=utf-8");
	date_default_timezone_set('Asia/Shanghai');
	
	echo '<title>签到统计</title>'."\n";
	$date=@$_GET['view'];
	$time=strtotime($date." 00:00:00");
	if ($time==false || $time==-1) $time=time();
	$year=date("Y",$time);
	$month=date("m",$time);
	$day=date("d",$time);

	$today=mainfunc(array("ask"=>"sign_today","view"=>$date));
	echo "<pre>";
	echo "签到统计 ($year-$month-$day)：\n";
	$num=count($today);
	for ($i=0;$i<$num;$i++) {
		echo '#'.($i+1).": ".$today[$i]['username']."\n";
	}
	echo "\n\n";

	echo "本年度签到统计：\n";
	$signyear=mainfunc(array("ask"=>"sign_year"));
	$num=count($signyear);

	for ($i=0;$i<$num;$i++) {
		echo $signyear[$i]['month']."\n";
		$data=$signyear[$i]['data'];
		$count=count($data);
		for ($j=0;$j<$count;$j++) {
			echo $data[$j]['number']." ";
		}
		echo "\n\n";
	}
	echo "\n";

	echo "总签到次数排名top100：\n";

	$users=mainfunc(array("ask"=>"sign_user"));
	$count=count($users);

	for ($i=0;$i<$count;$i++) {
		echo "#".$users[$i]['number'].": ".$users[$i]['username']."  (".$users[$i]['times'].")\n";
	}
	echo '</pre>';

?>
