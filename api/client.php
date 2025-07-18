<?php
    header('Content-type: application/xml');
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo "\n";
    date_default_timezone_set("Asia/Shanghai");

    // if(@$_REQUEST['os']=="ios") {
    //     $build=intval(@$_REQUEST['clientbuild']);
    //     if ($build > 0 && $build < 3900) {
    //         echo '<capu><info><code>-999</code><msg>客户端版本过低，请前往App Store更新版本！</msg></info></capu>';
    //         exit;
    //     }
    // }

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
    else if ($ask=="image") uploadimage_legacy();
    else if ($ask=="file") uploadfile_legacy();
    else if ($ask=="upload") upload();
    else if ($ask=="lzl") lzl();
    else if ($ask=="search") search();
    else if ($ask=="action") action();
    else if ($ask=="attach") attach();
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
        $raw=(@$_REQUEST['raw'] == 'YES');
        if(!$page) $page=1;
        $page=intval($page);
        $results=request(array("bid"=>$id,"tid"=>$see,"p"=>$page));

        echo '<capu>'."\n";

        $count=count($results);
        if ($count==0) {echo '<info><code>1</code><msg>帖子不存在。</msg></info></capu>';exit;}
        if (intval($id)==1 && @$_REQUEST['token']=="") {
            echo '<info><code>11</code><msg>您需要登录后才能查看此版面内容。</msg></info></capu>';
            exit;
        }

        $title=$results[0]['title'];
        $pages=request(array("ask"=>"getpages","bid"=>$id,"tid"=>$see));
        $pages=intval($pages[0]['pages']);
        $stats=null;
        if ($see!="") {
            $stats=request(array("bid"=>$id,"tid"=>$see,"ask"=>"tidinfo"));
        }
        for ($i=0;$i<$count;$i++) {
            $floor=$results[$i];
            echo '<info>'."\n";
            if ($see=="") {
                $stats=request(array("bid"=>$id,"tid"=>$floor['tid'],"ask"=>"tidinfo"));
                showtitle($floor,$id,$page,$pages,$raw);
            } else {
                showtext($floor,$id,$see,$page,$pages,$title,$raw);
            }
            echo '<click>'.$stats[0]['click'].'</click>';
            echo '<reply>'.$stats[0]['reply'].'</reply>';
            echo '</info>'."\n";
        }
        echo '</capu>'."\n";
        exit;
    }

    function showtitle($content,$bid,$page,$pages,$raw) {
        echo '<code>-1</code>'."\n";
        if (@$content['replyer']==null || @$content['replyer']=="")
            $content['replyer']="";
        if (@$content['postdate']==null || @$content['postdate']=="")
            $content['postdate']="0";
        $nextpage="false";
        if ($page!=$pages) $nextpage="true";
        echo "<nextpage>$nextpage</nextpage>\n";
        echo "<pages>$pages</pages>\n";
        echo "<page>$page</page>\n";
        echo "<bid>$bid</bid>\n";
        echo "<text><![CDATA[".$content['title']."]]></text>\n";
        if ($raw) {
            echo "<author><![CDATA[".$content['author']."]]></author>\n";
            echo "<replyer><![CDATA[".$content['replyer']."]]></replyer>\n";
        } else {
            echo "<author><![CDATA[".$content['author']."        /        ".$content['replyer']."]]></author>\n";
        }
        echo "<tid>".$content['tid']."</tid>\n";
        echo "<time>".date("Y-m-d H:i:s",$content['timestamp'])."</time>\n";
        echo "<postdate>".$content['postdate']."</postdate>\n";
        echo "<lock>".$content['locked']."</lock>\n";
        echo "<top>".$content['top']."</top>\n";
        echo "<extr>".$content['extr']."</extr>\n";
    }

    function showlzl($lzl) {
        $user=request(array("ask"=>"view","view"=>$lzl['author']));
        echo '<id>'.$lzl['id'].'</id>';
        echo '<fid>'.$lzl['fid'].'</fid>';
        echo '<author><![CDATA['.$lzl['author'].']]></author>';
        echo '<icon><![CDATA['.$user[0]['icon'].']]></icon>';
        echo '<text><![CDATA['.$lzl['text'].']]></text>';
        echo '<time>'.date("Y-m-d H:i:s",$lzl['time']).'</time>';
    }

    function packBool($bool){
        if($bool) return "YES";
        return "NO";
    }

    function showattach($attach) {
        echo '<name><![CDATA['.@$attach['name'].']]></name>';
        echo '<size>'.@$attach['size'].'</size>';
        echo '<price>'.@$attach['price'].'</price>';
        echo '<minscore>'.@$attach['auth'].'</minscore>';
        echo '<id>'.@$attach['id'].'</id>';
        echo '<free>'.packBool(@$attach['isAuthor']=='YES'||@$attach['hasPurchased']=='YES').'</free>';
        echo '<count>'.@$attach['count'].'</count>';
    }

    function showtext($content,$bid,$tid,$page,$pages,$title,$raw) {//新增用户头像、星数、签名档、楼中楼和附件
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
        if ($raw) {
            echo "<textraw><![CDATA[".@$content['text']."]]></textraw>\n";
            echo "<ishtml>".@$content['ishtml']."</ishtml>\n";
            echo "<signum>".@$content['sig']."</signum>\n";
            echo "<sigraw><![CDATA[".$id[0]['sig'.@$content['sig']]."]]></sigraw>\n";
        } else {
            echo "<text><![CDATA[".translate(@$content['text'],@$content['ishtml'],false)."]]></text>\n";
            echo "<sig><![CDATA[".translate($id[0]['sig'.@$content['sig']],false,true)."]]></sig>\n";
        }
        if($raw&&$content["attachs"]){
            $attachs=explode(" ", $content["attachs"]);
            foreach($attachs as $attachid) {
                $attach=request(array("ask"=>"attachinfo","id"=>$attachid));
                if (count($attach)==1&&$attach[0]["exist"]=="YES") {
                    echo "<attach>\n";
                    showattach($attach[0]);
                    echo "</attach>\n";
                }
            }
        }
        echo "<floor>".@$content['pid']."</floor>\n";
        echo "<tid>$tid</tid>\n";
        echo "<fid>".@$content['fid']."</fid>\n";
        echo "<lzl>".@$content['lzl']."</lzl>\n";
        if ($raw) {
            $lzl=request(array(
                               "ask"=>"lzl",
                               "method"=>"ask",
                               "fid"=> $content['fid']
                               ));
            for($j=0;$j< count($lzl);$j++) {
                echo "<lzldetail>\n";
                showlzl($lzl[$j]);
                echo "</lzldetail>\n";
            }
        }
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
        $attachs=$_POST["attachs"];
        $sig=$_POST["sig"];
        $type=@$_POST['os'];
        if ($type=="") $type="android";
        if ($tid=="") {
            $result=request(array("ask"=>"post",
                "bid"=>$bid,
                "title"=>$title,
                "text"=>$text,
                "sig"=>$sig,
                "type"=>$type,
                "attachs"=>$attachs
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
                "type"=>$type,
                "attachs"=>$attachs
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
                "type"=>$type,
                "attachs"=>$attachs
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
    function register() {

        $os=@$_POST['os'];
        if ($os=="") $os="android";
        $system=@$_POST['device'];
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
        $con = dbconnect_mysqli();
        $statement="select * from capubbs.mainpage where id=-1";
        $results=mysqli_query($con, $statement);
        $results=mysqli_fetch_row($results);
        echo '<updatetext><![CDATA['.$results[2].']]></updatetext>';
        echo '<updateurl><![CDATA['.$results[3].']]></updateurl>';
        echo '<updatetime><![CDATA['.$results[4].']]></updatetime>';
        echo '</info>'."\n";

        $moreinfo=@$_REQUEST['more'];//兼容老版本无法显示超过六条通知的Bug
        if ($moreinfo=="YES")
            $statement="select * from capubbs.mainpage where id=1 order by number desc limit 0,20";//增加了首页最多显示的通知数量
        else
            $statement="select * from capubbs.mainpage where id=1 order by number desc limit 0,6";//增加了首页最多显示的通知数量
        
        $results=mysqli_query($con, $statement);
        while (($res=mysqli_fetch_row($results))!=null) {
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
        $raw=@$_REQUEST['raw'];
        $id=request(array("ask"=>"view","view"=>$user));
        echo '<capu><info>';
        echo '<username><![CDATA['.$id[0]['username'].']]></username>';
        echo '<sex><![CDATA['.$id[0]['sex'].']]></sex>';
        echo '<icon><![CDATA['.$id[0]['icon'].']]></icon>';
        echo '<intro><![CDATA['.$id[0]['intro'].']]></intro>';
        if($raw=="YES"){
            echo '<sig1><![CDATA['.$id[0]['sig1'].']]></sig1>';
            echo '<sig2><![CDATA['.$id[0]['sig2'].']]></sig2>';
            echo '<sig3><![CDATA['.$id[0]['sig3'].']]></sig3>';
        }else{
            echo '<sig1><![CDATA['.translate($id[0]['sig1'],false,true).']]></sig1>';
            echo '<sig2><![CDATA['.translate($id[0]['sig2'],false,true).']]></sig2>';
            echo '<sig3><![CDATA['.translate($id[0]['sig3'],false,true).']]></sig3>';
        }
        echo '<hobby><![CDATA['.$id[0]['hobby'].']]></hobby>';
        echo '<qq><![CDATA['.$id[0]['qq'].']]></qq>';
        echo '<mail><![CDATA['.$id[0]['mail'].']]></mail>';
        echo '<place><![CDATA['.$id[0]['place'].']]></place>';
        echo '<regdate><![CDATA['.$id[0]['regdate'].']]></regdate>';
        echo '<lastdate><![CDATA['.$id[0]['lastdate'].']]></lastdate>';
        echo '<star><![CDATA['.$id[0]['star'].']]></star>';
        echo '<score><![CDATA['.$id[0]['score'].']]></score>';
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

    // Legacy use only (Android?)
    function uploadfile_legacy() {
        $random=mt_rand(0,999999999);
        while (file_exists("../bbsimg/upload/$random.gif"))
            $random=mt_rand(0,999999999);
        echo '<capu><info><code>';
        if ($_FILES['image']['error']!=UPLOAD_ERR_OK) {
            echo '6</code><msg>上传失败。错误代码：'.$_FILES['image']['error'].'</msg></info></capu>';
        }
        if (!move_uploaded_file($_FILES['image']['tmp_name'],"../bbsimg/upload/$random.gif")) {
            echo '6</code><msg>保存文件失败。</msg></info></capu>';
            exit;
        }
        echo '-1</code><imgurl>/bbsimg/upload/'.$random.'.gif</imgurl></info></capu>';
        exit;
    }

    // Legacy use only (iOS cliennt version < 4.1 & and/or Android?)
    function uploadimage_legacy() {
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

    // Use this one for all future uploads
    function upload() {
        $extension=strtolower(@$_POST['extension']);
        $file=$_FILES['file'];
        if(!preg_match('/^[a-z0-9]{1,9}$/', $extension)||!$file||$file['error']!=UPLOAD_ERR_OK) {
            echo '<capu><info><code>14</code><msg>非法请求</msg></info></capu>';
            exit;
        }
        $path='';
        $maxsize=0;
        $type=@$_POST['type'];
        if($type=='icon'){$path='/bbsimg/icons/user_upload';$maxsize=512*1024;} // 512KB
        else if($type=='image'){$path='/bbs/images';$maxsize=1024*1024;} // 1MB
        else if($type=='file'){$path='/bbs/attachment';$maxsize=10*1024*1024;} // 10MB
        else {
            echo '<capu><info><code>14</code><msg>未知upload类型</msg></info></capu>';
            exit;
        }
        if($file['size']>$maxsize){
            echo '<capu><info><code>1</code><msg>文件太大</msg></info></capu>';
            exit;
        }
        
        $random=mt_rand(0,999999999);
        while (file_exists("..$path/$random.$extension")) {
            $random=mt_rand(0,999999999);
        }
        echo '<capu><info><code>';
        if (!move_uploaded_file($file['tmp_name'], "..$path/$random.$extension")) {
            echo '6</code></info></capu>';
            exit;
        }
        $publicpath="$path/$random.$extension";
        echo '-1</code><url>'.$publicpath.'</url></info></capu>';
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
                echo '<info>';
                showlzl($lzl[$j]);
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
        echo '<capu><info><code>14</code><msg>未知lzl操作</msg></info></capu>';
        exit;
    }

    function attach() {
        $method=@$_POST['method'];
        $id=@$_POST['id'];

        if ($method=="download") {
            $attach=request(array("ask"=>"attachdl","id"=>$id));
            $attach=$attach[0];
            $code=intval($attach['code']);
            if ($code!=0) {
                echo '<capu><info><code>'.$code.'</code><msg>'.@$attach['msg'].'</msg></info></capu>';
                exit;
            }
            echo '<capu><info><code>0</code><path>'.@$attach['path'].'</path></info></capu>';
            exit;
        }

        echo '<capu><info><code>14</code><msg>未知attach操作</msg></info></capu>';
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

