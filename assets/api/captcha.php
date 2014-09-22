<?php
	//session_start();
	require_once 'securimage/securimage.php';

	if (@$_POST['ask']=="check") echo captcha_check();

	function captcha_check($code="",$auto=true) {
		session_start();
		if ($code=="") $code=@$_POST['captcha'];
		$securimage = new Securimage();
		if ($securimage->check($code) == false) {
			if ($auto) {
				echo '-44';
				exit;
			}
			else return -1;
		}
		else return 0;
	}
?>
