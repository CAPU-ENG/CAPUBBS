<?php
	require_once 'dbconnector.php';
	require_once 'sendsms.php';
	require_once 'sendmail.php';
	require_once 'checkuser.php';
	require_once 'captcha.php';

	dbconnect();
	$ask=@$_POST['ask'];
	date_default_timezone_set("Asia/Shanghai");
	if ($ask=="getfilesize") getfilesize();
	if ($ask=="loadcalendar") loadcalendar();
	if ($ask=="savecalendar") savecalendar();
	if ($ask=="addinform") addinform();
	if ($ask=="delinform") delinform();
	if ($ask=="saveimg") saveimg();
	if ($ask=="join") memjoin();
	if ($ask=="login") login();
	if ($ask=="lendto") lendto();
	if ($ask=="borrowfrom")	borrowfrom();
	if ($ask=="newborrow") newborrow();
	if ($ask=="newlend") newlend();
	if ($ask=="savelend") savelend();
	if ($ask=="postimg") postimg();
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

	function memjoin() {
		captcha_check();
		$res=checkuser();
		$name=$res[0];
		if ($name=="") {echo '-15';exit;}
		$id=mysql_real_escape_string(@$_POST['id']);
		$sex=mysql_real_escape_string(@$_POST['sex']);
		$phone=mysql_real_escape_string(@$_POST['phone']);
		$year=mysql_real_escape_string(@$_POST['year']);
		$code=mysql_real_escape_string(@$_POST['code']);
		$hint=mysql_real_escape_string(@$_POST['hint']);
		$ip=$_SERVER["REMOTE_ADDR"];
		$type=mysql_real_escape_string(@$_POST['type']);
		$time=time();

		if ($code!="") {
			$valid=true;
			if (strlen($code)!=14) $valid=false;
			if (substr($code,0,6)!="BDCX95") $valid=false;
			if (substr($code,8,2)!="10") $valid=false;
			if (substr($code,12,2)!="25") $valid=false;
			if ($valid==false) {echo '-3';exit;}
		}

		dbconnect();

		$statement="select * from capubbs.join where id='$id' && type='$type'";
		$results=mysql_query($statement);
		if (mysql_num_rows($results)!=0)
		{
			echo '-1';
			exit;
		}
		$statement="select * from capubbs.join where ip='$ip' && $time-timestamp<1800";
		$results=mysql_query($statement);
		if (mysql_num_rows($results)!=0)
                {
                        echo '-2';
                        exit;
                }
		
		$statement="insert into capubbs.join values ('$id','$name',$sex,'$phone','$year','$code','$hint','$ip',$time,'$type')";
		mysql_query($statement);
		$xx=mysql_errno();
		if ($xx!=0) {echo $xx;exit;}
		$text="";
		if ($type="join") {
		$text="[".$id."|".$name."]于".date("Y-m-d",$time)."登记入会";
		if ($code!="") $text=$text."（已交会费）";
		else $text=$text."（未交会费）";
		$text=$text."。请凭此短信于周五下午在农园西北角出摊地领取年刊等资料。";
		}
		else {
		$text="[".$id."|".$name."]于".date("Y-m-d",$time)."报名暑期";
		if ($code!="") $text=$text."（已交报名费）";
		else $text=$text."（未交报名费）";
		$text=$text."。请凭此短信于周五下午在农园西北角出摊地登记并领取暑期资料。";
		}
		echo sendsms($phone,$text);
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
			header('Set-cookie: token='.$token.'; expires='.$date.'; path=/'."\n");
		}
		echo $code;
		exit;
	}

	function makelend() {
		captcha_check();
		$id=@$_POST['to'];
		#$from=@$_POST['from'];
		#$from=@$_COOKIE['name'];
		$res=checkuser();
		$from=$res[0];
		if ($from=="") {echo '-15';exit;}
		$phone=mysql_real_escape_string(@$_POST['phone']);

		dbconnect();
		$statement="select id,phone from capubbs.borrow where number=$id";

		$results=mysql_query($statement);
		$error=mysql_errno();
		if ($error!=0) {echo $error;exit;}
		$res=mysql_fetch_row($results);
		return $res;
	}

	function lendto() {
		$res=makelend();
		$toid=$res[0];
		$tophone=$res[1];
		$res=checkuser();
		$from=$res[0];
		$phone=@$_POST['phone'];

		$text="[".$toid."]，[".$from."] (".$phone.") 可以向你出借爱车，请直接与其联系。借车成功记得请修改求借状态。";
		$error=sendsms($tophone,$text);
		echo $error;
		#echo $tophone."<br>".$text;
		exit;
	}

	function borrowfrom() {
		$res=makelend();
		$toid=$res[0];
		$tophone=$res[1];
		$res=checkuser();
		$from=$res[0];
		#$from=@$_COOKIE['name'];
		#$from=@$_POST['from'];
		$phone=@$_POST['phone'];

		$text="[".$toid."]，[".$from."]（".$phone."）请求向你借车，请直接与其联系。出借成功请记得修改求借状态。";
		$error=sendsms($tophone,$text);
		echo $error;
		#echo $tophone."<br>".$text;
		exit;
	}

	function newborrow() {
		captcha_check();
		$sex=@$_POST['sex'];
		$height=@$_POST['height'];
		#$username=@$_COOKIE['name'];
		$res=checkuser();
		$username=$res[0];
		if ($username=="") {echo '-15';exit;}
		$phone=mysql_real_escape_string(@$_POST['phone']);
		$length=mysql_real_escape_string(@$_POST['length']);
		$hint=mysql_real_escape_string(@$_POST['hint']);
		$time=time();
		dbconnect();

		$statement="insert into capubbs.borrow values (null,1,'$username','$sex','$phone','$height',null,null,'$length','$hint',$time,0)";
		mysql_query($statement);
		echo mysql_errno();
		exit;
	}

	function newlend() {
		captcha_check();
		$res=checkuser();
		$username=$res[0];
		if ($username=="") {echo '-15';exit;}
		$sex=mysql_real_escape_string(@$_POST['sex']);
		$phone=mysql_real_escape_string(@$_POST['phone']);
                $length=mysql_real_escape_string(@$_POST['length']);
                $hint=mysql_real_escape_string(@$_POST['hint']);
		$bike=mysql_real_escape_string(@$_POST['bike']);
		$condition=mysql_real_escape_string(@$_POST['condition']);
		$time=time();
		dbconnect();

                $statement="insert into capubbs.borrow values (null,0,'$username','$sex','$phone',null,'$bike','$condition','$length','$hint',$time,0)";
                mysql_query($statement);
                echo mysql_errno();
                exit;
	}

	function savelend() {
		$res=checkuser();
		$username=$res[0];
		if ($username=="") {echo '-15';exit;}
		$json=@$_POST['data'];
		$data=json_decode($json,true);
		$time=time();
		dbconnect();
		reset($data);
		while (list($code,$state)=each($data)) {
			$state=intval($state);
			$code=intval($code);
			$statement="update capubbs.borrow set state=$state , timestamp=$time where number=$code";
			mysql_query($statement);
			$x=mysql_errno();
			if ($x!=0) {echo $x;exit;}
		}			
		echo '0';
		exit;
	}
	
	function postimg() {
		$res=checkuser();
		$username=$res[0];
		if ($username=="") {echo '-15';exit;}
		$imgurl=@$_POST['imgurl'];
		$imgthumburl=@$_POST['imgthumburl'];
		$text=@$_POST['text'];
		$ret=sendmail('capubbs@qq.com',"【北大车协】首页图片投稿","投稿人：$username\r\n图片地址：$imgurl\r\n缩略图地址：$imgthumburl\r\n文字：$text");
		echo $ret;
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
