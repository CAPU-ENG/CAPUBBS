<?php
	require_once 'log.php';
	require_once '../../lib.php';

	if (@$_REQUEST['sms']=='remain') getremainsms();

	function checksmsvalid($phone,$text) {
		$a=checkuser();
		$username=$a[0];
		if ($username=="") {echo '-15';exit;}
		dbconnect();
		$time=time();
		$statement="select number from capubbs.sms where username='$username' && $time-timestamp<1800";
		$results=mysql_query($statement);
		if (mysql_num_rows($results)>=2) {
			echo '-22';exit;
		}
		$ip=@$_SERVER['REMOTE_ADDR'];
		$statement="insert into capubbs.sms values (null,'$username','$phone','$text','$ip',$time)";
		mysql_query($statement);
		writelog("[SMS send to $phone] $text\n");
	}


	function sendsms($phone,$text) {
		checksmsvalid($phone,$text);	
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "https://sms-api.luosimao.com/v1/send.json");
		curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE); 
		curl_setopt($ch, CURLOPT_HEADER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);     
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, TRUE); 
		curl_setopt($ch, CURLOPT_SSLVERSION , 3);
		curl_setopt($ch, CURLOPT_HTTPAUTH , CURLAUTH_BASIC);
		curl_setopt($ch, CURLOPT_USERPWD  , 'api:key-b7fc2a8ab2155cd1a5bbee10b6448f90');
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, array('mobile' => ''.$phone,'message' => $text.'【北大车协】'));
		$res = curl_exec( $ch );
		curl_close( $ch );
		$de_json=json_decode($res,true);
		return $de_json['error'];
	}

	function getremainsms() {
		$ch = curl_init();

curl_setopt($ch, CURLOPT_URL , "https://sms-api.luosimao.com/v1/status.json");
curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
curl_setopt($ch, CURLOPT_HEADER, FALSE);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE); 
        
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);     
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, TRUE); 
curl_setopt($ch, CURLOPT_SSLVERSION , 3);

curl_setopt($ch, CURLOPT_HTTPAUTH , CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD  , 'api:key-b7fc2a8ab2155cd1a5bbee10b6448f90');

$res =  curl_exec( $ch );
curl_close( $ch ); 
//$res  = curl_error( $ch );
var_dump($res);

	}
