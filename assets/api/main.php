<?php
	require_once '../../lib.php';
	require_once '../../bbs/lib/mainfunc.php';

	$ask=@$_POST['ask'];
	date_default_timezone_set("Asia/Shanghai");
	if ($ask=="getfilesize") getfilesize();
	if ($ask=="loadcalendar") loadcalendar();
	if ($ask=="savecalendar") savecalendar();
	if ($ask=="addinform") addinform();
	if ($ask=="delinform") delinform();
	if ($ask=="saveimg") saveimg();
	if ($ask=="login") login();

	if ($ask=="add_download") adddownload();
	if ($ask=="edit_download") editdownload();
	if ($ask=="del_download") deldownload();

	function trans($x) {return "<![CDATA[".$x."]]>";}

	function loadcalendar() {
		dbconnect();
		$year=@$_POST['year'];
		$month=@$_POST['month'];
		$day=@$_POST['day'];
		$statement="select * from capubbs.calendar where year='$year' && month='$month' && day='$day'";
		$results=mysql_query($statement);
		header('Content-type: application/xml;charset:UTF-8');
		echo '<capu>';
		while ($res=mysql_fetch_array($results)) {
			echo '<data>';
			foreach ( $res as $key => $value ) {
				if (is_long($key)) continue;
				echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
			}
			echo '</data>';
		}		

		echo '</capu>';
		exit;
	}

	function savecalendar() {
		$res=checkuser();
		$rights=intval($res[1]);
		if ($rights==0) {echo '-18';exit;}
		dbconnect();
		$year=mysql_real_escape_string(@$_POST['year']);
                $month=mysql_real_escape_string(@$_POST['month']);
                $day=mysql_real_escape_string(@$_POST['day']);
		$json=@$_POST['content'];
		$statement="delete from capubbs.calendar where year='$year' && month='$month' && day='$day'";
		mysql_query($statement);
		$de_json=json_decode($json,true);
                $count_json = count($de_json);
		for ($i=0;$i<$count_json;$i++) {
			$time=mysql_real_escape_string($de_json[$i]['time']);
			$title=mysql_real_escape_string($de_json[$i]['title']);
			$text=mysql_real_escape_string($de_json[$i]['content']);
			$statement="insert into capubbs.calendar values ('$year','$month','$day','$time','$title','$text')";
			mysql_query($statement);
		}
		echo mysql_errno();
		exit;
	}

	function saveimg() {
		$res=checkuser();
		$rights=intval($res[1]);
		if ($rights==0) {echo '-18';exit;}
		dbconnect();
		mysql_query("delete from capubbs.mainpage where id=0");
		$json=@$_POST['json'];
		$de_json=json_decode($json,true);
		$count_json = count($de_json);
                usort($de_json,function($a,$b) {
			$al=intval(@$a['id']);
			$bl=intval(@$b['id']);
			return ($al>$bl)?1:-1;
		});
		for ($i=0;$i<$count_json;$i++) {
                        $fld1=mysql_real_escape_string($de_json[$i]['img']);
                        $fld2=mysql_real_escape_string($de_json[$i]['imgthumb']);
                        $fld3=mysql_real_escape_string($de_json[$i]['title']);
                        $statement="insert into capubbs.mainpage values (null,0,'$fld1','$fld2','$fld3','','')";
                        mysql_query($statement);
                }
                echo mysql_errno();
		mysql_query("alter table capubbs.mainpage order by number");
                exit;
	}

	function getfilesize() {
		$url=@$_POST['url'];
		$info=get_headers($url,true);
		echo $info['Content-Length'];
		exit;
	}

	function addinform() {
		$res=checkuser();
		$rights=intval($res[1]);
		if ($rights==0) {echo '-18';exit;}
		$title=mysql_real_escape_string(@$_POST['title']);
		$url=mysql_real_escape_string(@$_POST['url']);
		$time=time();
		dbconnect();
		$statement="insert into capubbs.mainpage values (null,1,'$title','$url','$time','','')";
		mysql_query($statement);
		echo mysql_errno();
		mysql_query("alter table capubbs.mainpage order by number");
		exit;
	}

	function delinform() {
		$res=checkuser();
		$rights=intval($res[1]);
		if ($rights==0) {echo '-18';exit;}
		$time=intval(@$_POST['time']);
		dbconnect();
		mysql_query("delete from capubbs.mainpage where id=1 && field3='$time'");
		echo mysql_errno();
		mysql_query("alter table capubbs.mainpage order by number");
		exit;
	}


	function login() {
		$username=@$_POST['username'];
		$password=@$_POST['password'];
		$result=mainfunc(array(
		"ask"=>"login",
		"username"=>$username,
		"password"=>$password,
		"onlinetype"=>"web",
		"browser"=>@$_SERVER['HTTP_USER_AGENT']
		));
		$result=$result[0];
		$code=intval($result['code']);
		$token=$result['token'];
		if($code==0){
			$time=time()+99999;
			$date=date("D, d M Y H:i:s",$time)." GMT";
			header('Set-cookie: token='.$token.'; domain=.'.CAPUBBS_HOST.'; expires='.$date.'; path=/'."\n");
		}
		echo $code;
		exit;
	}


	function adddownload() {
		$res=checkuser();
		$rights=intval($res[1]);
		if ($rights==0) {echo '-18';exit;}
		$title=mysql_real_escape_string(@$_POST['title']);
		$url=mysql_real_escape_string(@$_POST['url']);
		dbconnect();
		$statement="insert into capubbs.downloads values (null,'$title','$url',0)";
		mysql_query($statement);
		echo mysql_errno();
		exit;
	}

	function editdownload() {		
		$res=checkuser();
		$rights=intval($res[1]);
		if ($rights==0) {echo '-18';exit;}
		$title=mysql_real_escape_string(@$_POST['title']);
		$url=mysql_real_escape_string(@$_POST['url']);
		$id=mysql_real_escape_string(@$_POST['id']);
		dbconnect();
		$statement="update capubbs.downloads set name='$title', url='$url' where id=$id";
		mysql_query($statement);
		echo mysql_errno();
		exit;
	}

	function deldownload() {
		$res=checkuser();
		$rights=intval($res[1]);
		if ($rights==0) {echo '-18';exit;}
		$id=@$_POST['id'];
		dbconnect();
		$statement="delete from capubbs.downloads where id=$id";
		mysql_query($statement);
		echo mysql_errno();
		exit;
	}
?>
