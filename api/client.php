<?php

    header('Content-type: application/xml');
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo "\n";
    date_default_timezone_set("Asia/Shanghai");

    $ask=@$_REQUEST['ask'];
    if ($ask=="show") show();
    else if ($ask=="post") post();
    else if ($ask=="login") login();
    else if ($ask=="main") seemain();
    else if ($ask=="hot") gethot();
    else if ($ask=="userinfo") getuserinfo();
    else if ($ask=="register") register();
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
        $url="http://127.0.0.1/api/jiekouapi.php?ip=$ip&token=$token";
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
        echo "<text><![CDATA[".translate(@$content['text'],@$content['ishtml'])."]]></text>\n";
        echo "<sig><![CDATA[".translate($id[0]['sig'.@$content['sig']],false)."]]></sig>\n";
        echo "<floor>".@$content['pid']."</floor>\n";
        echo "<tid>$tid</tid>\n";
        echo "<fid>".@$content['fid']."</fid>\n";
        echo "<lzl>".@$content['lzl']."</lzl>\n";
        echo "<time>".date("Y-m-d H:i:s",@$content['updatetime'])."</time>";

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
        $sig1=@$_POST['sig'];

        $code=@$_POST['code'];

        if ($code=="") {
            echo '<capu><info><code>11</code><msg>无效的注册号。</msg></info></capu>';
            exit;

        }

        if (@_POST['icon'])
            $icon=@$_POST['icon'];
        else
            $icon="/bbsimg/icons/zebra.jpeg";//默认头像
        $results=request(array("ask"=>"register",
            "username"=>$username,
            "password"=>$password,
            "code"=>$code,
            "sex"=>$sex,
            "qq"=>$qq,
            "mail"=>$mail,
            "icon"=>$icon,
            "place"=>$from,
            "intro"=>$intro,
            "sig1"=>$sig1,
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

    function seemain() {
        echo '<capu><info><code>-1</code>';
        $con=mysql_connect("localhost","root","19951025");
        mysql_query("SET NAMES 'utf8'")    ;
        $statement="select * from capubbs.mainpage where id=-1";
        $results=mysql_query($statement,$con);
        $results=mysql_fetch_row($results);
        echo '<updatetext><![CDATA['.$results[2].']]></updatetext>';
        echo '<updateurl><![CDATA['.$results[3].']]></updateurl>';
        echo '<updatetime><![CDATA['.$results[4].']]></updatetime>';
        $statement="select * from capubbs.mainpage where id=-3";
        $results=mysql_query($statement,$con);
        $results=mysql_fetch_row($results);
        echo '<iostext><![CDATA['.$results[2].']]></iostext>';
        echo '<iosurl><![CDATA['.$results[3].']]></iosurl>';
        echo '<iosversion><![CDATA['.$results[4].']]></iosversion>';
        echo '</info>'."\n";

        $statement="select * from capubbs.mainpage where id=1 order by number desc limit 0,10";//增加了首页最多显示的通知数量
        $results=mysql_query($statement,$con);
        while (($res=mysql_fetch_row($results))!=null) {
            echo '<info><text>'."<![CDATA[".$res[2].']]></text>';
            $ar=parse_url($res[3],PHP_URL_QUERY);
            if ($ar!=null) {
                parse_str($ar,$params);
                echo '<bid>'.$params['bid'].'</bid>';
                echo '<tid>'.$params['tid'].'</tid>';
            }
            else echo '<bid></bid><tid></tid>';
            echo '</info>'."\n";
        }

        echo '</capu>';
        exit;
    }

    function gethot() {
        echo '<capu>';
        $hots=request(array("ask"=>"hot"));
        for ($i=1;$i<=10;$i++) {
            $hot=$hots[$i];
            echo '<info><text><![CDATA['.$hot['title'].']]></text>';
            echo '<bid>'.$hot['bid'].'</bid><tid>'.$hot['tid'].'</tid><pid>';
            $num=intval($hot['reply'])+1;
            echo $num.'</pid><replyer><![CDATA['.$hot['replyer'].']]></replyer>';
            echo '<author><![CDATA['.$hot['author'].']]></author><time>';//增加论坛热点查看作者的功能
            $time=date("Y-m-d H:i:s",$hot['timestamp']);
            echo $time.'</time></info>';
        }
        echo '</capu>';

    }

    function getuserinfo() {
        $user=@$_REQUEST['uid'];
        $id=request(array("ask"=>"view","view"=>$user));
        echo '<capu><info>';
        echo '<username><![CDATA['.$id[0]['username'].']]></username>';
        echo '<sex><![CDATA['.$id[0]['sex'].']]></sex>';
        echo '<icon><![CDATA['.$id[0]['icon'].']]></icon>';
        echo '<intro><![CDATA['.$id[0]['intro'].']]></intro>';
        echo '<sig1><![CDATA['.translate($id[0]['sig1'],false).']]></sig1>';
        echo '<sig2><![CDATA['.translate($id[0]['sig2'],false).']]></sig2>';
        echo '<sig3><![CDATA['.translate($id[0]['sig3'],false).']]></sig3>';
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
        echo '</info></capu>';
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
        echo '-1</code><imgurl>http://www.chexie.net/bbsimg/upload/'.$random.'.gif</imgurl></info></capu>';
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
        echo '-1</code><imgurl>http://www.chexie.net/bbsimg/upload/'.$random.'.gif</imgurl></info></capu>';
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
                echo "<time>".date("Y-m-d H:i:s",$content[$i]['updatetime'])."</time>\n";
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
        if ($type!="top" && $type!="extr" && $type!="lock") {
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
        $response = curl_exec($ci);
        curl_close($ci);
        return $response;
    }


    function translate($raw,$ishtml){
        $html=$raw;
        if(!$ishtml){
            $html=htmlspecialchars_decode($html);
        }
        $html=str_replace(chr(10)."<br>", "<br>",$html);
        $html=str_replace(chr(10), "<br>",$html);
        $html=str_replace(chr(13), "<br>",$html);
        if (!$space) $html=str_replace(" ", "&nbsp;", $html);//修复空格显示的Bug
        $html=preg_replace("#(\\[img])(.+?)(\\[/img])#", "<img src='$2'>", $html);
        $html=preg_replace("#(\\[quote=)(.+?)(])([\\s\\S]+?)(\\[/quote])#", "<font color='grey' size=2><hr>引用自 <font color='blue'>@$2</font> ：<br><br>$4<br><hr><br></font>",$html);//改善显示
        $html=preg_replace("#(\\[size=)(.+?)(])([\\s\\S]+?)(\\[/size])#", "<font size='$2'>$4</font>", $html);
        $html=preg_replace("#(\\[font=)(.+?)(])([\\s\\S]+?)(\\[/font])#", "<font face='$2'>$4</font>", $html);
        $html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)(\\[/color])#", "<font color='$2'>$4</font>", $html);
        $html=preg_replace("#(\\[color=)(.+?)(])([\\s\\S]+?)#", "<font color='$2'>$4</font>", $html);
        $html=preg_replace("#(\\[at])(.+?)(\\[/at])#", "<font color='blue'>@$2</font>", $html);//@暂时改为蓝色显示 以后可改为客户端可识别的显示ID的形式
        $html=preg_replace("#(\\[url])(.+?)(\\[/url])#", href("$2","$2"), $html);
        $html=preg_replace("#(\\[url=)(.+?)(])([\\s\\S]+?)(\\[/url])#", href("$2","$4"), $html);
        $html=preg_replace("#(\\[b])(.+?)(\\[/b])#", "<b>$2</b>", $html);
        $html=preg_replace("#(\\[i])(.+?)(\\[/i])#", "<i>$2</i>", $html);
        return $html;
    }
        function href($link,$href) {return "<a href='$link'>$href</a>";}
?>

