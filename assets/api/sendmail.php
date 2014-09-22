<?php
	require_once 'log.php';
	require_once 'checkuser.php';

	function checkmailvalid($to,$title,$body) {
		$a=checkuser();
		$username=$a[0];
		if ($username=="") {echo '-15';exit;}
		$time=time();
		date_default_timezone_set('Asia/Shanghai');
		writelog("[".date("r",$time)."][E-mail send to $to from $username] [Title: $title] $body\n");
	}

	function sendmail($to,$title,$body) {
		checkmailvalid($to,$title,$body);
		$body=wordwrap($body,70,"\r\n");
		$header="From: admin@chexie.net\r\nReply-To: ckcz123@126.com\r\nX-Mailer: PHP/".phpversion();
		$return=mail($to,$title,$body,$header);
		if ($return) return 0;
		return -23;
	}

?>
