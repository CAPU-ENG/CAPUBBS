<?php
    header('Content-type: application/xml');
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo "\n";
    date_default_timezone_set("Asia/Shanghai");

    $ask=@$_REQUEST['ask'];
    if ($ask=="show") show();
    else if ($ask=="post") post();
    else if ($ask=="login") login();
    else if ($ask=="logout") logout();
    else if ($ask=="main") seemain();
    else if ($ask=="news") news();
    else if ($ask=="hot") gethot();
    else if ($ask=="globaltop") getglobaltop();
    else if ($ask=="userinfo") getuserinfo();
    else if ($ask=="sendmsg") sendmsg();
    else if ($ask=="msg") msg();
    else if ($ask=="register") register();
    else if ($ask=="edituser") edituser();
    else if ($ask=="changepsd") changepsd();
    else if ($ask=="delete") del();
    else if ($ask=="image") uploadimage();
    else if ($ask=="file") uploadfile();
    else if ($ask=="lzl") lzl();
    else if ($ask=="search") search();
    else if ($ask=="action") action();
    else {
        echo '<capu><info><code>14</code><msg>ask错误。</msg></info></capu>';
        exit;
    }

    function request($posts) {
        $token=@$_POST['token'];
        $ip=$_SERVER['REMOTE_ADDR'];
        $url="https://chexie.net/api/jiekouapi.php?ip=$ip&token=$token";
        $rawstr= http($url,"POST",$posts);
        $xml=simplexml_load_string($rawstr, null, LIBXML_NOCDATA);
        return json_decode(json_encode($xml->xpath("info")),true);
    }


    function show() {
        $id=@$_REQUEST['bid'];
        $see=@$_REQUEST['tid'];
        $page=@$_REQUEST['p'];
        if(!$page) $page=1;
        $page=intval($page);
        $results=request(array("bid"=>$id,"tid"=>$see,"p"=>$page));

        $pages=request(array("ask"=>"getpages","bid"=>$id,"tid"=>$see));
        $pages=intval($pages[0]['pages']);

        echo '<capu>'."\n";

        $count=count($results);
        if ($count==0) {echo '<info><code>1</code><msg>帖子不存在。</msg></info></capu>';exit;}
        if (intval($id)==1 && @$_REQUEST['token']=="") {
            echo '<info><code>11</code><msg>您需要登录后才能查看此版面内容。</msg></info></capu>';
            exit;
        }
        $title=$results[0]['title'];
        for ($i=0;$i<$count;$i++) {
            $floor=$results[$i];
            echo '<info>'."\n";
            if ($see=="") showtitle($floor,$id,$page,$pages);
            else {
                showtext($floor,$id,$see,$page,$pages,$title);
                $temp=request(array("bid"=>$id,"tid"=>$see,"ask"=>"tidinfo"));
                echo '<click>'.$temp[0]['click'].'</click>';
                echo '<reply>'.$temp[0]['reply'].'</reply>';
            }
            echo '</info>'."\n";
        }
        echo '</capu>'."\n";
        exit;
    }

    function showtitle($content,$bid,$page,$pages) {
        echo '<code>-1</code>'."\n";
        if (@$content['replyer']==null || @$content['replyer']=="")
            $content['replyer']="";
        $nextpage="false";
        if ($page!=$pages) $nextpage="true";
        echo "<nextpage>$nextpage</nextpage>\n";
        echo "<pages>$pages</pages>\n";
        echo "<page>$page</page>\n";
        echo "<bid>$bid</bid>\n";
        echo "<text><![CDATA[".$content['title']."]]></text>\n";
        echo "<author><![CDATA[".$content['author']."        /        ".$content['replyer']."]]></author>\n";
        echo "<tid>".$content['tid']."</tid>\n";
        echo "<time>".date("Y-m-d H:i:s",$content['timestamp'])."</time>\n";
        echo "<lock>".$content['locked']."</lock>\n";
        echo "<top>".$content['top']."</top>\n";
        echo "<extr>".$content['extr']."</extr>\n";
    }

    function showtext($content,$bid,$tid,$page,$pages,$title) {//新增用户头像、星数和签名档
        $id=request(array("ask"=>"view","view"=>$content['author']));
        echo "<code>-1</code>\n";
        $nextpage="false";
        if ($page!=$pages) $nextpage="true";
        echo "<nextpage>$nextpage</nextpage>\n";
        echo "<pages>$pages</pages>\n";
        echo "<page>$page</page>\n";
        echo "<bid>$bid</bid>\n";
        echo "<author><![CDATA[".$content['author']."]]></author>\n";
        echo "<icon><![CDATA[".$id[0]['icon']."]]></icon>";
        echo "<star><![CDATA[".$id[0]['star']."]]></star>";
        echo "<title><![CDATA[".$title."]]></title>\n";
        echo "<text><![CDATA[".translate(@$content['text'],@$content['ishtml'],false)."]]></text>\n";
        echo "<sig><![CDATA[".translate($id[0]['sig'.@$content['sig']],false,true)."]]></sig>\n";
        echo "<floor>".@$content['pid']."</floor>\n";
        echo "<tid>$tid</tid>\n";
        echo "<fid>".@$content['fid']."</fid>\n";
        echo "<lzl>".@$content['lzl']."</lzl>\n";
        echo "<time>".date("Y-m-d H:i:s",@$content['replytime'])."</time>"; // 发表时间
        echo "<edittime>".date("Y-m-d H:i:s",@$content['updatetime'])."</edittime>"; // 编辑时间
        echo "<type>".@$content['type']."</type>"; // 发帖类型(web android ios)

    }

    function post() {
        $bid=@$_POST["bid"];
        $tid=@$_POST["tid"];
        $pid=@$_POST["pid"];
        $title=$_POST["title"];
        $text=$_POST["text"];
        $sig=$_POST["sig"];
        $type=@$_POST['os'];
        if ($type=="") $type="android";
        if ($tid=="") {
            $result=request(array("ask"=>"post",
                "bid"=>$bid,
                "title"=>$title,
                "text"=>$text,
                "sig"=>$sig,
                "type"=>$type
            ));
            $result=$result[0];
            $result=intval($result['code']);
            echo '<capu><info><code>';
            if ($result==0) echo 0;
            else if ($result==1) echo -25;
            else if ($result==2) echo 4;
            else echo 6;
            echo '</code><msg>'.@$result['msg'].'</msg></info></capu>';
        }
        else if ($pid=="") {
            $result=request(array("ask"=>"reply",
                "bid"=>$bid,
                "tid"=>$tid,
                "title"=>$title,
                "text"=>$text,
                "sig"=>$sig,
                "type"=>$type
            ));
            $result=$result[0];
            $code=intval($result['code']);
            echo '<capu><info><code>';
            if ($code==0) echo 0;
            else if ($code==1) echo -25;
            else if ($code==2) echo 4;
            else if ($code==3) echo 6;
            else if ($code==4) echo 5;
            else echo 6;
            echo '</code><msg>'.@$result['msg'].'</msg></info></capu>';
        }
        else {
            $result=request(array("ask"=>"edit",
                "bid"=>$bid,
                "tid"=>$tid,
                "pid"=>$pid,
                "title"=>$title,
                "text"=>$text,
                "sig"=>$sig,
                "type"=>$type
            ));
            $result=$result[0];
            $code=intval($result['code']);
            echo '<capu><info><code>';
            if ($code==0) echo 0;
            else if ($code==1) echo -25;
            else if ($code==2) echo 4;
            else if ($code==3) echo 6;
            else if ($code==4) echo 5;
            else if ($code==5) echo 7;
            else echo 6;
            echo '</code><msg>'.@$result['msg'].'</msg></info></capu>';
        }
        exit;
    }

    function del() {
        $bid=@$_POST['bid'];
        $tid=@$_POST['tid'];
        $pid=intval(@$_POST['pid']);
        $result=request(array("ask"=>"delete",
            "bid"=>$bid,
            "tid"=>$tid,
            "pid"=>$pid
        ));
        $result=$result[0];
        $code=intval($result['code']);
        echo '<capu><info><code>';
        if ($code==0) echo 0;
        else if ($code==1) echo -25;
        else if ($code==3) echo 6;
        else if ($code==5) echo 10;
        else echo 6;
        echo '</code><msg>'.@$result['msg'].'</msg></info></capu>';
        exit;
    }

    function login() {

        $os=@$_POST['os'];
        if ($os=="") $os="android";
        $system=@$_POST['device'];
        if($os=="ios") $system=packiOSDevice($system);
        $version=@$_POST['version'];
        $system=$system."#".$version;

        $username=@$_POST['username'];
        $password=@$_POST['password'];
        $result=request(array("ask"=>"login",
            "username"=>$username,
            "password"=>$password,
            "onlinetype"=>$os,
            "system"=>$system
        ));
        $result=$result[0];
        $code=intval($result['code']);
        $token=@$result['token'];
        echo '<capu><info><code>';
        if ($code==0) echo 0;
        else if ($code==1) echo 2;
        else if ($code==2) echo 1;
        else echo 6;
        echo '</code><token>'.$token.'</token><msg>'.@$result['msg'].'</msg></info></capu>';
        exit;
    }

    function logout() {
        $result=request(array("ask"=>"logout"));
        echo '<capu><info><code>0</code></info></capu>';
    }

    function packiOSDevice($raw){
        $info=file_get_contents("deviceinfo.txt");
        $infos=explode("\n",$info);
        for($i=0;$i<count($infos);$i++){
            $data=explode("#",$infos[$i]);
            if($data[0]==$raw) return $data[1];
        }
        return $raw;
    }
    function register() {

        $os=@$_POST['os'];
        if ($os=="") $os="android";
        $system=@$_POST['device'];
        if($os=="ios") $system=packiOSDevice($system);
        $version=@$_POST['version'];
        $system=$system."#".$version;


        $username=@$_POST['username'];
        $password=@$_POST['password'];
        $sex=@$_POST['sex'];
        $qq=@$_POST['qq'];
        $mail=@$_POST['mail'];
        $from=@$_POST['from'];
        $intro=@$_POST['intro'];
        $hobby=@$_POST['hobby'];//增加爱好功能
        $sig1=@$_POST['sig'];
        $sig2=@$_POST['sig2'];//增加了多签名档功能
        $sig3=@$_POST['sig3'];

        /*$code=@$_POST['code'];//取消注册码制度

        if ($code=="") {
            echo '<capu><info><code>11</code><msg>无效的注册号。</msg></info></capu>';
            exit;

        }*/

        $icon=@$_POST['icon'];
        if ($icon=="")
            $icon="/bbsimg/icons/zebra.jpeg";//默认头像
        $results=request(array("ask"=>"register",
            "username"=>$username,
            "password"=>$password,
            //"code"=>$code,
            "sex"=>$sex,
            "qq"=>$qq,
            "mail"=>$mail,
            "icon"=>$icon,
            "place"=>$from,
            "intro"=>$intro,
            "hobby"=>$hobby,
            "sig1"=>$sig1,
            "sig2"=>$sig2,
            "sig3"=>$sig3,
            "onlinetype"=>$os,
            "system"=>$system
        ));
        echo '<capu><info><code>';
        $results=$results[0];
        $code=intval($results['code']);
        if ($code==1)
            echo 9;
        else if ($code==0)
            echo 0;
        else echo 6;
        echo '</code><token>'.@$results['token'].'</token><msg>'.@$results['msg'].'</msg></info></capu>';
        exit;
    }

    function edituser() {

        $sex=@$_POST['sex'];
        $qq=@$_POST['qq'];
        $mail=@$_POST['mail'];
        $from=@$_POST['from'];
        $intro=@$_POST['intro'];
        $hobby=@$_POST['hobby'];
        $sig1=@$_POST['sig'];
        $sig2=@$_POST['sig2'];
        $sig3=@$_POST['sig3'];
        $icon=@$_POST['icon'];
        if ($icon=="")
            $icon="/bbsimg/icons/zebra.jpeg";//默认头像
        
        $results=request(array("ask"=>"edituser",
                               "sex"=>$sex,
                               "qq"=>$qq,
                               "mail"=>$mail,
                               "icon"=>$icon,
                               "place"=>$from,
                               "intro"=>$intro,
                               "hobby"=>$hobby,
                               "sig1"=>$sig1,
                               "sig2"=>$sig2,
                               "sig3"=>$sig3,
                               ));
        
        $results=$results[0];
        echo '<capu><info><code>'.@$results['code'].'</code>';
        if (@$results['error']=="")
            echo '<msg>'.@$results['msg'].'</msg>';
        else
            echo '<msg>'.@$results['error'].'</msg>';
        echo '</info></capu>';
        exit;
    }

    function changepsd() {
        $old=@$_POST['old'];
        $new=@$_POST['new'];
        $results=request(array("ask"=>"changepsd",
                               "old"=>$old,
                               "new"=>$new,
                               ));
        $results=$results[0];
        echo '<capu><info><code><![CDATA['.$results['code'].']]></code>';
        echo '<msg><![CDATA['.$results['msg'].']]></msg></info></capu>';
    }

    function seemain() {
        echo '<capu><info><code>-1</code>';
	require_once '../lib.php';
        dbconnect();
        $statement="select * from capubbs.mainpage where id=-1";
        $results=mysql_query($statement);
        $results=mysql_fetch_row($results);
        echo '<updatetext><![CDATA['.$results[2].']]></updatetext>';
        echo '<updateurl><![CDATA['.$results[3].']]></updateurl>';
        echo '<updatetime><![CDATA['.$results[4].']]></updatetime>';
        echo '<iostext>客户端版本过老，请至App Store升级！</iostext>';
        echo '<iosurl><![CDATA[https://itunes.apple.com/cn/app/capubbs/id826386033?mt=8]]></iosurl>';
        echo '<iosversion>3.0</iosversion>';
        echo '</info>'."\n";

        $moreinfo=@$_REQUEST['more'];//兼容老版本无法显示超过六条通知的Bug
        if ($moreinfo=="YES")
            $statement="select * from capubbs.mainpage where id=1 order by number desc limit 0,20";//增加了首页最多显示的通知数量
        else
            $statement="select * from capubbs.mainpage where id=1 order by number desc limit 0,6";//增加了首页最多显示的通知数量
        
        $results=mysql_query($statement);
        while (($res=mysql_fetch_row($results))!=null) {
            echo '<info><text>'."<![CDATA[".$res[2].']]></text>';
            $ar=parse_url($res[3],PHP_URL_QUERY);
            echo '<time>'.$res[4].'</time>';
            if ($ar!=null) {
                parse_str($ar,$params);
                echo '<bid>'.$params['bid'].'</bid>';
                echo '<tid>'.$params['tid'].'</tid>';
            }
            else echo '<bid></bid><tid></tid>';
            echo '<url>'."<![CDATA[".$res[3].']]></url>';//原始url
            echo '</info>'."\n";
        }

        echo '</capu>';
        exit;
    }

    function news() {
        $method = @$_REQUEST['method'];
        $time = @$_REQUEST['time'];
        $text = @$_REQUEST['text'];
        $url = @$_REQUEST['url'];
        $result = request(array("ask"=>"news", "method"=>$method, "time"=>$time, "text"=>$text, "url"=>$url));
        echo '<capu><info><code>'.$result[0]['code'].'</code><msg>'.$result[0]['msg'].'</msg></info></capu>';
    }

    function gethot() {
        $hotnum=10; // Default number of hot list
        if (@$_REQUEST['hotnum'])
            $hotnum=@$_REQUEST['hotnum'];
        echo '<capu>';
        $hots=request(array("ask"=>"hot","hotnum"=>$hotnum));
        for ($i=1;$i<=$hotnum;$i++) {//增加热点数量
            $hot=$hots[$i];
            echo '<info><text><![CDATA['.$hot['title'].']]></text>';
            echo '<bid>'.$hot['bid'].'</bid><tid>'.$hot['tid'].'</tid><pid>';
            $num=intval($hot['reply']);
            echo $num.'</pid><replyer><![CDATA['.$hot['replyer'].']]></replyer>';
            echo '<author><![CDATA['.$hot['author'].']]></author><time>';//增加论坛热点查看作者的功能
            $time=date("Y-m-d H:i:s",$hot['timestamp']);
            echo $time.'</time></info>';
        }
        echo '</capu>';

    }
    function getglobaltop() {
        echo '<capu>';
        $hots=request(array("ask"=>"global_top"));
        for ($i=1;$i<count($hots);$i++) {
            $hot=$hots[$i];
            echo '<info><text><![CDATA['.$hot['title'].']]></text>';
            echo '<bid>'.$hot['bid'].'</bid><tid>'.$hot['tid'].'</tid><pid>';
            $num=intval($hot['reply']);
            echo $num.'</pid><replyer><![CDATA['.$hot['replyer'].']]></replyer>';
            echo '<author><![CDATA['.$hot['author'].']]></author><time>';
            $time=date("Y-m-d H:i:s",$hot['timestamp']);
            echo $time.'</time></info>';
        }
        echo '</capu>';

    }

    function sendmsg() { // 私信API
        $token=$_REQUEST['token'];
        $to=$_REQUEST['to'];
        $text=$_REQUEST['text'];
        $id=request(array("ask"=>"sendmsg","token"=>$token,"to"=>$to,"text"=>$text));
        echo '<capu><info>';
        echo '<code><![CDATA['.$id[0]['code'].']]></code>';
        echo '<msg><![CDATA['.$id[0]['msg'].']]></msg>';
        echo '</info></capu>';
    }

    function msg() {
        $token = $_REQUEST['token'];
        $type = $_REQUEST['type'];
        $page = $_REQUEST['page'];
        $chatter = $_REQUEST['chatter'];
        
        $id = request(array("ask"=>"msg", "token"=>$token, "type"=>$type, "p"=>$page, "to"=>$chatter, "shrink"=>"no"));
        
        if (intval($id[0]['code']) == 1){
            echo("<capu><info><code>1</code><msg>".$id[0]['msg']."</msg></info></capu>");
            return;
        }
        echo("<capu><info><code>0</code>");
        echo("<sysmsg>".$id[0]['sysmsg']."</sysmsg>");
        echo("<prvmsg>".$id[0]['prvmsg']."</prvmsg>");
        echo("</info>");
        
        if ($type == "system") {
            for ($i = 1; $i < count($id); $i++) {
                echo("<info>");
                echo("<username><![CDATA[".$id[$i]['username']."]]></username>");
                $user=request(array("ask"=>"view","view"=>$id[$i]['username']));
                echo("<icon>".$user[0]['icon']."</icon>");
                echo("<type>".$id[$i]['type']."</type>");
                echo("<title><![CDATA[".$id[$i]['title']."]]></title>");
                echo("<url><![CDATA[".$id[$i]['url']."]]></url>");//原始url
                $ar=parse_url($id[$i]['url'],PHP_URL_QUERY);
                if ($ar!=null) {//解析bid tid p
                    parse_str($ar,$params);
                    echo '<bid>'.$params['bid'].'</bid>';
                    echo '<tid>'.$params['tid'].'</tid>';
                    echo '<p>'.$params['p'].'</p>';
                }
                else echo '<bid></bid><tid></tid><p></p>';
                echo("<time>".date("Y-m-d H:i:s",$id[$i]['time'])."</time>");
                echo("<hasread>".$id[$i]['hasread']."</hasread>");
                echo("</info>");
            }
        }else if ($type == "private") {
            for ($i = 1; $i < count($id); $i++) {
                echo("<info>");
                echo("<username><![CDATA[".$id[$i]['username']."]]></username>");
                $user=request(array("ask"=>"view","view"=>$id[$i]['username']));
                echo("<icon>".$user[0]['icon']."</icon>");
                echo("<text><![CDATA[".$id[$i]['text']."]]></text>");
                echo("<time>".date("Y-m-d H:i:s",$id[$i]['time'])."</time>");
                echo("<number>".$id[$i]['number']."</number>");
                echo("<totalnum>".$id[$i]['totalnum']."</totalnum>");
                echo("</info>");
            }
        }else if ($type == "chat") {
            $user=request(array("ask"=>"view","view"=>$chatter));
            for ($i = 1; $i < count($id); $i++) {
                echo("<info>");
                echo("<type>".$id[$i]['type']."</type>");
                echo("<icon>".$user[0]['icon']."</icon>");
                echo("<text><![CDATA[".$id[$i]['text']."]]></text>");
                echo("<time>".date("Y-m-d H:i:s",$id[$i]['time'])."</time>");
                echo("</info>");
            }
        }
        
        echo("</capu>");
    }

    function getuserinfo() {
        $user=@$_REQUEST['uid'];
        $id=request(array("ask"=>"view","view"=>$user));
        echo '<capu><info>';
        echo '<username><![CDATA['.$id[0]['username'].']]></username>';
        echo '<sex><![CDATA['.$id[0]['sex'].']]></sex>';
        echo '<icon><![CDATA['.$id[0]['icon'].']]></icon>';
        echo '<intro><![CDATA['.$id[0]['intro'].']]></intro>';
        echo '<sig1><![CDATA['.translate($id[0]['sig1'],false,true).']]></sig1>';
        echo '<sig2><![CDATA['.translate($id[0]['sig2'],false,true).']]></sig2>';
        echo '<sig3><![CDATA['.translate($id[0]['sig3'],false,true).']]></sig3>';
        echo '<hobby><![CDATA['.$id[0]['hobby'].']]></hobby>';
        echo '<qq><![CDATA['.$id[0]['qq'].']]></qq>';
        echo '<mail><![CDATA['.$id[0]['mail'].']]></mail>';
        echo '<place><![CDATA['.$id[0]['place'].']]></place>';
        echo '<regdate><![CDATA['.$id[0]['regdate'].']]></regdate>';
        echo '<lastdate><![CDATA['.$id[0]['lastdate'].']]></lastdate>';
        echo '<star><![CDATA['.$id[0]['star'].']]></star>';
        echo '<post><![CDATA['.$id[0]['post'].']]></post>';
        echo '<reply><![CDATA['.$id[0]['reply'].']]></reply>';
        echo '<water><![CDATA['.$id[0]['water'].']]></water>';
        echo '<sign><![CDATA['.$id[0]['sign'].']]></sign>';
        echo '<rights><![CDATA['.$id[0]['rights'].']]></rights>';
        echo '<newmsg><![CDATA['.$id[0]['newmsg'].']]></newmsg>';
        echo '<extr><![CDATA['.$id[0]['extr'].']]></extr>';
        echo '</info>';
        
        $recent=@$_REQUEST['recent'];
        if ($recent == 'YES') {
            echo '<info>';
            $id=request(array("ask"=>"recentpost","view"=>$user));
            for ($i = 1; $i < count($id); $i++) {
                echo("<info><type>post</type>");
                echo("<bid>".$id[$i]['bid']."</bid>");
                echo("<tid>".$id[$i]['tid']."</tid>");
                echo("<title><![CDATA[".$id[$i]['title']."]]></title>");
                echo("<time>".date("Y-m-d H:i:s",$id[$i]['timestamp'])."</time>");
                echo("</info>");
            }
            echo '</info><info>';
            $id=request(array("ask"=>"recentreply","view"=>$user));
            for ($i = 1; $i < count($id); $i++) {
                echo("<info><type>reply</type>");
                echo("<bid>".$id[$i]['bid']."</bid>");
                echo("<tid>".$id[$i]['tid']."</tid>");
                echo("<pid>".$id[$i]['pid']."</pid>");
                echo("<title><![CDATA[".$id[$i]['title']."]]></title>");
                // echo("<time>".date("Y-m-d H:i:s",$id[$i]['replytime'])."</time>");
                echo("<time>".date("Y-m-d H:i:s",$id[$i]['updatetime'])."</time>");
                echo("</info>");
            }
            echo '</info>';
        }
        
        echo '</capu>';
    }

    function uploadfile() {

        $random=mt_rand(0,999999999);
        while (file_exists("../bbsimg/upload/$random.gif"))
            $random=mt_rand(0,999999999);
        echo '<capu><info><code>';
        if ($_FILES['image']['error']!=UPLOAD_ERR_OK) {
            echo '6</code><msg>上传失败。错误代码；'.$_FILES['image']['error'].'</msg></info></capu>';
        }
        if (!move_uploaded_file($_FILES['image']['tmp_name'],"../bbsimg/upload/$random.gif")) {
            echo '6</code><msg>保存文件失败。</msg></info></capu>';
            exit;
        }
        echo '-1</code><imgurl>/bbsimg/upload/'.$random.'.gif</imgurl></info></capu>';
        exit;


    }

    function uploadimage() {
        $data=@$_POST['image'];
        $data=base64_decode($data);
        $random=mt_rand(0,999999999);
        while (file_exists("../bbsimg/upload/$random.gif"))
            $random=mt_rand(0,999999999);
        echo '<capu><info><code>';
        if (file_put_contents("../bbsimg/upload/$random.gif",$data)===false) {
            echo '6</code></info></capu>';
            exit;
        }
        echo '-1</code><imgurl>/bbsimg/upload/'.$random.'.gif</imgurl></info></capu>';
        exit;
    }

    function search() {
        $bid=@$_POST['bid'];
        $text=@$_POST['text'];
        $starttime=@$_POST['starttime'];
        $endtime=@$_POST['endtime'];
        $author=@$_POST['username'];
        $type=@$_POST['type'];

        if ($starttime=="") $starttime="2001-01-01";
        if ($endtime=="") $endtime=date("Y-m-d",time());
        if ($type=="") $type="thread";

        $content=request(array("ask"=>"search",
            "bid"=>$bid,
            "keyword"=>$text,
            "type"=>$type,
            "starttime"=>$starttime,
            "endtime"=>$endtime,
            "author"=>$author
            ));
        echo '<capu><info><code>-1</code></info>';
        $num=count($content);
        if ($type=="thread") {
            for ($i=0;$i<$num;$i++) {
                echo "<info>";
                echo "<bid>".$content[$i]['bid']."</bid>\n";
                echo "<tid>".$content[$i]['tid']."</tid>\n";
                echo "<text><![CDATA[".$content[$i]['title']."]]></text>\n";
                echo "<author><![CDATA[".$content[$i]['author']."]]></author>\n";
                // echo "<time>".date("Y-m-d H:i:s",$content[$i]['updatetime'])."</time>\n";
                echo "<time>".date("Y-m-d H:i:s",$content[$i]['replytime'])."</time>\n";
                echo "</info>";
            }

        }
        else {
            for ($i=0;$i<$num;$i++) {
                $text=$content[$i]['text'];
                if (mb_strlen($text,'utf-8')>=50)
                    $text=mb_substr($text,0,50,'utf-8')."...";
                echo "<info>";
                echo "<bid>".$content[$i]['bid']."</bid>\n";
                echo "<tid>".$content[$i]['tid']."</tid>\n";
                echo "<floor>".$content[$i]['pid']."</floor>\n";
                echo "<fid>".$content[$i]['fid']."</fid>\n";
                echo "<author><![CDATA[".$content[$i]['author']."]]></author>\n";
                echo "<title><![CDATA[".$content[$i]['title']."]]></title>\n";
                echo "<text><![CDATA[".$text."]]></text>\n";
                echo "<lzl>".$content[$i]['lzl']."</lzl>\n";
                echo "<time>".date("Y-m-d H:i:s",$content[$i]['updatetime'])."</time>";
                echo "</info>";
            }
        }
        echo "</capu>";
        exit;
    }

    function action() {
        $type=@$_POST['method'];
        $bid=@$_POST['bid'];
        $tid=@$_POST['tid'];
        echo '<capu><info><code>';
        if ($type!="top" && $type!="extr" && $type!="lock" && $type !="global_top_action") {
            echo '6</code><msg>未知帖子操作</msg></info></capu>';
            exit;
        }
        $result=request(array("ask"=>$type,
            "bid"=>$bid,
            "tid"=>$tid
        ));
        $result=$result[0];
        $code=intval($result['code']);
        if ($code==0) echo 0;
        else if ($code==1) echo -25;
        else if ($code==3) echo 6;
        else if ($code==5) echo 10;
        else echo 6;
        echo '</code><msg>'.@$result['msg'].'</msg></info></capu>';
        exit;
    }

    function lzl() {
        $method=@$_POST['method'];
        $fid=@$_POST['fid'];
        $id=@$_POST['id'];

        if ($method=="show") {
            $lzl=request(array(
                               "ask"=>"lzl",
                               "method"=>"ask",
                               "fid"=> $fid
                               ));
            echo '<capu><info><code>-1</code></info>';
            for($j=0;$j< count($lzl);$j++) {//新增查看头像
                $user=request(array("ask"=>"view","view"=>$lzl[$j]['author']));
                echo '<info>';
                echo '<id>'.$lzl[$j]['id'].'</id>';
                echo '<fid>'.$lzl[$j]['fid'].'</fid>';
                echo '<author><![CDATA['.$lzl[$j]['author'].']]></author>';
                echo '<icon><![CDATA['.$user[0]['icon'].']]></icon>';
                echo '<text><![CDATA['.$lzl[$j]['text'].']]></text>';
                echo '<time>'.date("Y-m-d H:i:s",$lzl[$j]['time']).'</time>';
                echo '</info>';
            }
            echo '</capu>';
            exit;
        }
        if ($method=="post") {
            $text=@$_POST['text'];
            $lzl=request(array("ask"=>"lzl",
                "method"=>"post","fid"=>$fid,
                "text"=>$text
            ));
            $lzl=$lzl[0];
            $code=intval($lzl['code']);
            echo '<capu><info><code>';
            if ($code==0) echo 0;
            else if ($code==1) echo -25;
            else if ($code==2) echo 4;
            else if ($code==3) echo 5;
            else echo 6;
            echo '</code><msg>'.@$lzl['msg'].'</msg></info></capu>';
            exit;
        }
        if ($method=="delete") {
            $lzl=request(array("ask"=>"lzl",
                "method"=>"delete",
                "fid"=>$fid,
                "lzlid"=>$id
            ));
            $lzl=$lzl[0];
            $code=intval($lzl['code']);
            echo '<capu><info><code>';
            if ($code==0) echo 0;
            else if ($code==1) echo -25;
            else if ($code==3) echo 6;
            else if ($code==5) echo 7;
            else echo 6;
            echo '</code><msg>'.@$lzl['msg'].'</msg></info></capu>';
            exit;
        }
        exit;
    }



    function http($url, $method="POST", $postfields = NULL) {
        $ci = curl_init();
        curl_setopt($ci, CURLOPT_URL, $url);
        curl_setopt($ci, CURLOPT_CONNECTTIMEOUT, 30); // 连接超时
        curl_setopt($ci, CURLOPT_TIMEOUT, 30); // 执行超时
        curl_setopt($ci, CURLOPT_RETURNTRANSFER, true); // 文件流的形式返回，而不是直接输出
        curl_setopt($ci, CURLOPT_ENCODING, "gzip");
        curl_setopt($ci, CURLOPT_HEADER, FALSE);
        if ('POST' == $method) {
            curl_setopt($ci, CURLOPT_POST, true); // post
        }
        if (!empty($postfields)) {
            curl_setopt($ci, CURLOPT_POSTFIELDS, $postfields); // post数据 可为数组、连接字串
        }
        curl_setopt($ci, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ci, CURLOPT_SSL_VERIFYHOST, false);        // 不检查证书
        $response = curl_exec($ci);
        curl_close($ci);
        return $response;
    }


    function translate($raw,$ishtml,$issig){
        $html=$raw;
        if(!$ishtml){
            $html=htmlspecialchars_decode($html);
        }
        $html=str_replace(chr(10)."<br>", "<br>",$html);
        $html=str_replace(chr(10), "<br>",$html);
        $html=str_replace(chr(13), "<br>",$html);
        if ($issig) {
            $html=str_replace(" ", "&nbsp;",$html);//修复空格显示的Bug
        }
        $html=preg_replace("#(\\[img])(.+?)(\\[/img])#", "<img src='$2'>", $html);
        $html=preg_replace("#(\\[quote=)(.+?)(])([\\s\\S]+?)(\\[/quote])#", "<quote><div style=\"background:#F5F5F5;padding:10px\"><font color='gray' size=2>引用自 [at]$2[/at] ：<br><br>$4<br><br></font></div></quote>",$html);//改善显示
        $html=preg_replace("#(\\[size=)(.+?)(])([\\s\\S]+?)(\\[/size])#", "<font size='$2'>$4</font>", $html);
        $html=preg_replace("#(\\[font=)(.+?)(])([\\s\\S]+?)(\\[/font])#", "<font face='$2'>$4</font>", $html);
        $html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)(\\[/color])#", "<font color='$2'>$4</font>", $html);
        $html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)#", "<font color='$2'>$4</font>", $html);
        $html=preg_replace("#(\\[at])(.+?)(\\[/at])#", href("/bbs/user/?name=$2","@$2"), $html);//@改为链接到用户信息界面形式
        $html=preg_replace("#(\\[url])(.+?)(\\[/url])#", href("$2","$2"), $html);
        $html=preg_replace("#(\\[url=)(.+?)(])([\\s\\S]+?)(\\[/url])#", href("$2","$4"), $html);
        $html=preg_replace("#(\\[b])(.+?)(\\[/b])#", "<b>$2</b>", $html);
        $html=preg_replace("#(\\[i])(.+?)(\\[/i])#", "<i>$2</i>", $html);
        return $html;
    }

    function href($link,$href) {return "<a href='$link'>$href</a>";}
?>

