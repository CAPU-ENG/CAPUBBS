<?php
function writelog($data) {
	date_default_timezone_set('Asia/Shanghai');
	$date=date("r",time());
	$data="[$date] ".$data;
	$logfile="/home/capu/web/log/record.log";
	if ($fd=fopen($logfile,"a")) {
		fputs($fd,$data);
		fclose($fd);
	}
}
?>
