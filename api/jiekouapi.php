<?php
    require_once '../lib.php';

    if(false&&@$_REQUEST['debug']=='yes'){
        echo("GET:<br>");
        foreach($_GET as $key=>$value){
            echo("$key => $value<br>");
        }
        echo("<br><br>POST:<br>");
        foreach($_POST as $key=>$value){
            echo("$key => $value<br>");
        }
        exit;
    }
    $GLOBALS['validtime']=60*60*24*7;
    $GLOBALS['attachroot']="../bbs/attachment/";
    header('Content-type: application/xml');
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo "\n";
    date_default_timezone_set("Asia/Shanghai");
    dbconnect();
    mysql_select_db("capubbs");
    $ask=@$_REQUEST['ask'];
    $bid=intval(@$_REQUEST['bid']);
    $tid=intval(@$_REQUEST['tid']);
    $pid=intval(@$_REQUEST['pid']);
    $to=@$_REQUEST['to'];
    $fid=intval(@$_REQUEST['fid']);
    $path=@$_REQUEST['path'];
    $filename=@$_REQUEST['filename'];
    $text=@$_REQUEST['text'];
    $price=@$_REQUEST['price'];
    $auth=@$_REQUEST['auth'];
    $id=@$_REQUEST['id'];
    $attachs=@$_REQUEST['attachs'];
    $keyword=@$_REQUEST['keyword'];
    $type=@$_REQUEST['type'];

    if(!islegal($bid)||!islegal($tid)||!islegal($pid)||!islegal($fid)){
        echo("<capu><info><code>-1</code><msg>未知错误，请反馈给我们。</msg></info></capu>");
        exit;
    }
    $token=@$_REQUEST['token'];
    $ip=@$_REQUEST['ip'];
    $view=@$_REQUEST['view'];
    $con=null;

    $nowtime=time();
    {
        $time=time();
        $statement="select username,star,rights,lastpost from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        $res=mysql_fetch_array($results);
        $username=$res[0];

        if ($username) {
            $today=date("Y-m-d");
            $onlinetype=@$_REQUEST['onlinetype'];
            $browser=@$_REQUEST['browser'];
            $system=@$_REQUEST['system'];
            $logininfo="";
            if ($onlinetype=="web") $logininfo=$browser;
            if ($onlinetype=="android" || $onlinetype=="ios") $logininfo=$system;
    
            if ($ip!="") $statement="update userinfo set tokentime=$nowtime, token='$token', nowboard=null, lastip='$ip',lastdate='$today',onlinetype='$onlinetype',logininfo='$logininfo' where username='$username'";
            else $statement="update userinfo set tokentime=$nowtime, token='$token', nowboard=null, lastdate='$today',onlinetype='$onlinetype',logininfo='$logininfo' where username='$username'";
            mysql_query($statement);

            $year=date("Y",$time);
            $month=date("m",$time);
            $day=date("d",$time);
            $statement="select * from capubbs.sign where year=$year && month=$month && day=$day && username='$username'";
            $result=mysql_query($statement);
            if (mysql_num_rows($result)==0) {
                $hour=date("H",$time);
                $minute=date("i",$time);
                $second=date("s",$time);
                $week=date("N",$time);
                $statement="insert into capubbs.sign values ($year,$month,$day,$hour,$minute,$second,$week,'$username')";
                mysql_query($statement);
                $statement="update capubbs.userinfo set sign=sign+1 where username='$username'";
                mysql_query($statement);
            }
        }
    }

    if ($ip=="") $ip=$_SERVER["REMOTE_ADDR"];
    if ($ask=="bbsinfo") bbsinfo($con,$bid,@$_REQUEST['name']);
    else if ($ask=="login") login($con,@$_REQUEST['username'],@$_REQUEST['password'],$ip);
    else if ($ask=="logout") logout($con,$token,$ip);
    else if ($ask=="register") register($con,$ip);
    else if ($ask=="boardcast") boardcast($con,$token,$text);
    else if ($ask=="getuser") getuser($con,$token);
    else if ($ask=="userexists") userexists($con);
    else if ($ask=="hot") hot($con,$token);
    else if ($ask=="global_top") global_top($con,$token);
    else if ($ask=="news") news($con,$token);
    else if ($ask=="tidinfo") tidinfo($con,$bid,$tid);
    else if ($ask=="recentpost") recentpost($con,$view);
    else if ($ask=="recentreply") recentreply($con,$view);
    else if ($ask=="rights") rights($con,$bid,$token);
    else if ($ask=="attach") attach($con,$token,$path,$filename,$price,$auth);
    else if ($ask=="attachdl") attachdl($con,$token,$id);
    else if ($ask=="attachinfo") attachinfo($con,$id,$token);
    else if ($ask=="unusedattachinfo") unusedattachinfo($con,$token);
    else if ($ask=="delattach") delattach($con,$token,$id);
    else if ($ask=="editpreview") editpreview($con,$token,$bid,$tid,$pid);
    else if ($ask=="sendmsg") sendmsg($con,$token,$to,$text);
    else if ($ask=="msg") msg($con,$token,$type);
    else if ($ask=="changepsd") changepsd($con,$token);
    else if ($ask=="currentUserInfo") currentUserInfo($con,$token);
    else if ($ask=="search") searchByKeyword($con,$keyword,$token,$type,$bid);
    else if ($ask=="edituser") edituser($con,$token,$ip);
    else if ($ask=="online") viewonline($con);
    else if ($ask=="update") updatetokentime($con,$token,$ip);
    else if ($ask=="post") post($con,$token,$bid,$ip,$attachs);
    else if ($ask=="reply") reply($con,$token,$bid,$tid,$ip,$attachs);
    else if ($ask=="edit") edit($con,$token,$bid,$tid,$pid,$ip,$attachs);
    else if ($ask=="lock" || $ask=="extr" || $ask=="top" || $ask=="global_top_action") threads_action($con,$token,$bid,$tid,$ask);
    else if ($ask=="delete") delete($con,$token,$bid,$tid,$pid,$ip);
    else if ($ask=="move") move($con,$token,$bid,$tid,$to);
    else if ($ask=="lzl") lzl($con,@$_REQUEST['method'],$fid,$token,$ip);
    else if ($ask=="getpages") getpages($con,$bid,$tid);
    else if ($ask=="getlznum") getlznum($con,$bid,$tid);
    else if ($ask=="getnum") getnum($con);
    else if ($ask=="sign_today") sign_today($con);
    else if ($ask=="sign_year") sign_year($con);
    else if ($ask=="sign_user") sign_user($con);
    else if ($view!="") view_user($con,$view);
    else if ($bid!="") {
        $page=@$_REQUEST['p'];
        $nowuser="";
        if ($token!="") {
            $nowtime=time();
            $statement="select username from userinfo where token='$token' && $nowtime-tokentime<={$GLOBALS['validtime']}";
            $result=mysql_query($statement);
            $user="";
            while ($res=mysql_fetch_array($result)) {
                foreach ( $res as $key => $value ) {
                    if ($key=="username") { $user=$value; $nowuser=$user;}
                }
                if ($ip!="") $statement="update userinfo set tokentime=$nowtime, nowboard=$bid, lastip='$ip' where username='$user'";
                else $statement="update userinfo set tokentime=$nowtime, nowboard=$bid where username='$user'";
                mysql_query($statement);
            }
        }
        if ($tid!="") {
            $see_lz=@$_REQUEST['see_lz'];
            $author="";
            if ($see_lz!="") {
                $statement="select author from threads where bid=$bid && tid=$tid";
                $results=mysql_query($statement);
                if (mysql_num_rows($results)!=0) {
                    $result=mysql_fetch_row($results);
                    $author=$result[0];
                }
            }
            if ($pid!="") $statement="select * from posts where bid=$bid && tid=$tid && pid=$pid";
            else if ($page!="")
            {
                $start=($page-1)*12;
                if ($author!="")
                    $statement="select * from posts where bid=$bid && tid=$tid && author='$author' order by pid limit $start, 12";
                else
                    $statement="select * from posts where bid=$bid && tid=$tid order by pid limit $start, 12";
            }
            else
                $statement="select * from posts where bid=$bid && tid=$tid order by pid";

        }
        else {
            $extr=@$_REQUEST['extr'];
            if ($extr=="") $extr=0;
            else $extr=1;
            if ($page=="") $page=1;
            $start=($page-1)*25;
            $statement="
            select threads.bid,threads.tid,title,author,replyer,click,reply,extr,top,locked,timestamp,postdate,
            case when thread_global_top.bid is null then 0 else 1 end as global_top 
            from threads left join thread_global_top on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid 
            where threads.bid=$bid and extr>=$extr order by top desc, timestamp desc limit $start, 25";
        }
        view_bbs($con,$statement);
        if ($tid!="" && $pid=="") {
            $statement="update threads set click=click+1 where bid=$bid && tid=$tid";
            mysql_query($statement);
        }
    }else {
        echo '<capu><info><code>14</code><msg>ask错误。</msg></info></capu>';
    }
    exit;

    function trans($data) {
        $data=str_replace("]]>", "]]]]><![CDATA[>", $data);
        return "<![CDATA[".$data."]]>";
    }

    function getlznum($con,$bid,$tid) {
        $author="";
        $statement="select author from threads where bid=$bid && tid=$tid";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)!=0) {
            $result=mysql_fetch_row($results);
            $author=$result[0];
        }
        if ($author=="") {
            echo '<capu><info><num>0</num></info></capu>';
            exit;
        }
        $statement="select pid from posts where bid=$bid && tid=$tid && author='$author'";
        $results=mysql_query($statement);
        $num=mysql_num_rows($results);
        echo "<capu><info><num>$num</num></info></capu>";
    }

    function bbsinfo($con,$bid,$name) {
        $askforall=1;
        if ($bid!="") {
            $askforall=0;
            $statement="select * from boardinfo where bid=$bid";
        }
        else $statement="select * from boardinfo where bid!=0 order by bid";
        $results=mysql_query($statement);
        echo '<capu>';
        while ($res=mysql_fetch_array($results)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                if ($key=="key" || $key=="msg") continue;
                if ($key=="bid") $bid=$value;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            if ($askforall==0) {
                $statement="select count(*) from threads where bid=$bid";
                echo '<topics>'.mysql_result(mysql_query($statement), 0).'</topics>';
                $statement="select count(*) from threads where bid=$bid && extr=1";
                echo '<extr>'.mysql_result(mysql_query($statement), 0).'</extr>';
                #$ress=mysql_fetch_array($resultt);
                #echo '<maxtid>'.$ress[0].'</maxtid>';
                $date=date("Y-m-d");
                $statement="select count(*) from threads where bid=$bid && postdate=\"$date\"";
                echo '<newpost>'.mysql_result(mysql_query($statement), 0).'</newpost>';
                $time1=strtotime("$date 00:00:00");
                $time2=strtotime("$date 23:59:59");
                $statement="select count(*) from posts where bid=$bid && replytime>=$time1 && replytime<=$time2";
                echo '<newreply>'.mysql_result(mysql_query($statement), 0).'</newreply>';
            }
            echo "</info>\n";
        }
        echo '</capu>';
        exit;
    }

    function view_user($con,$username) {
        echo '<capu>';
        $statement="select * from userinfo where username='$username'";
        $results=mysql_query($statement);
        while ($res=mysql_fetch_array($results)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                if ($key=="password") continue;
                if ($key=="token") continue;
                if ($key=="tokentime") continue;
                if ($key=="lastpost") continue;
                if ($key=="nowboard") continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo "</info>\n";
        }
        echo '</capu>';
    }

    function view_bbs($con,$statement) {
        $results=mysql_query($statement);
        echo '<capu>';
        while ($res=mysql_fetch_array($results)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                print '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo "</info>\n";
        }
        echo '</capu>';
    }

    function viewonline($con) {
        $nowtime=time();
        $statement="select username, nowboard, tokentime, lastip, onlinetype, logininfo from userinfo where $nowtime-tokentime<=600";
        $result=mysql_query($statement);
        echo '<capu>';
        while ($res=mysql_fetch_array($result)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo "</info>\n";
        }
        echo '</capu>';
        exit;
    }

    function login($con,$username,$password,$ip) {
        if (@$_REQUEST['md5']=="yes") $password=md5($password);
        echo '<capu>';
        $statement="select password from userinfo where username='$username'";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            echo '<info><code>1</code><msg>用户不存在。</msg></info>';
        }
        else {
            $res=mysql_fetch_array($results);
            $psd=$res[0];
            if (strtoupper($psd)!=strtoupper($password)) {
                echo '<info><code>2</code><msg>密码错误。</msg></info>';
            }
            else {
                echo '<info><code>0</code><username>'.$username.'</username>';
                $nowtime=time();
                $statement="select token from userinfo where username='$username' && $nowtime-tokentime<={$GLOBALS['validtime']}";
                $results=mysql_query($statement);
                $token=md5($username.$nowtime);
                if (mysql_num_rows($results)!=0)
                {$res=mysql_fetch_array($results);$token=$res[0];}
                $today=date("Y-m-d");

                $onlinetype=@$_REQUEST['onlinetype'];
                $browser=@$_REQUEST['browser'];
                $system=@$_REQUEST['system'];
                $logininfo="";
                if ($onlinetype=="web") $logininfo=$browser;
                if ($onlinetype=="android" || $onlinetype=="ios") $logininfo=$system;

                if ($ip!="") $statement="update userinfo set tokentime=$nowtime, token='$token', nowboard=null, lastip='$ip',lastdate='$today',onlinetype='$onlinetype',logininfo='$logininfo' where username='$username'";
                else $statement="update userinfo set tokentime=$nowtime, token='$token', nowboard=null, lastdate='$today',onlinetype='$onlinetype',logininfo='$logininfo' where username='$username'";
                mysql_query($statement);
                echo '<token>'.$token.'</token></info>';
                $time=time();
                $year=date("Y",$time);
                $month=date("m",$time);
                $day=date("d",$time);
                $statement="select * from capubbs.sign where year=$year && month=$month && day=$day && username='$username'";
                $result=mysql_query($statement);
                if (mysql_num_rows($result)==0) {
                    $hour=date("H",$time);
                    $minute=date("i",$time);
                    $second=date("s",$time);
                    $week=date("N",$time);
                    $statement="insert into capubbs.sign values ($year,$month,$day,$hour,$minute,$second,$week,'$username')";
                    mysql_query($statement);
                    $statement="update capubbs.userinfo set sign=sign+1 where username='$username'";
                    mysql_query($statement);
                }
            }
        }
        echo '</capu>';
        exit;
    }

    function register($con,$ip) {
        $username=@$_REQUEST['username'];
        $statement="select * from userinfo where username='$username'";
        if (mysql_num_rows(mysql_query($statement))>0) {
            echo '<capu><info><code>1</code><msg>用户已存在。</msg></info></capu>';
            exit;
        }

        //$code=mysql_real_escape_string(@$_REQUEST['code']);//取消验证码制度
/*
        $statement="select times from codes where code='$code'";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0)
        {
            echo '<capu><info><code>2</code><msg>无效的会员号。</msg></info></capu>';
            exit;
        }
        $res=mysql_fetch_row($results);
        if (intval($res[0])>=5)
        {
            echo '<capu><info><code>2</code><msg>此会员号注册的ID数目已到上限。</msg></info></capu>';
            exit;
        }
        $statement="update codes set times=times+1 where code='$code'";
        mysql_query($statement);
*/

        $password=@$_REQUEST['password'];
        if (@$_REQUEST['md5']=="yes") $password=md5($password);
        $sex=@$_REQUEST['sex'];
        $icon=@$_REQUEST['icon'];
        if (@$_REQUEST['qq'])
            $qq=intval(@$_REQUEST['qq']);
        $mail=@$_REQUEST['mail'];
        $intro=@$_REQUEST['intro'];
        $place=@$_REQUEST['place'];
        $hobby=@$_REQUEST['hobby'];
        $sig1=@$_REQUEST['sig1'];
        $sig2=@$_REQUEST['sig2'];
        $sig3=@$_REQUEST['sig3'];
        $time=time();
        $date=date("Y-m-d");
        $token=md5($username.$time);
        $sig1=mysql_real_escape_string($sig1);
        $sig2=mysql_real_escape_string($sig2);
        $sig3=mysql_real_escape_string($sig3);
        $place=mysql_real_escape_string($place);
        $hobby=mysql_real_escape_string($hobby);
        $intro=mysql_real_escape_string($intro);
        $mail=mysql_real_escape_string($mail);

        $onlinetype=@$_REQUEST['onlinetype'];
        $browser=@$_REQUEST['browser'];
        $system=@$_REQUEST['system'];
        $logininfo="";
        if ($onlinetype=="web") $logininfo=$browser;
        if ($onlinetype=="android" || $onlinetype=="ios") $logininfo=$system;


        $statement="insert into userinfo values ('$username','$password','$token',$time,'$sex','$icon','$intro','$sig1','$sig2','$sig3','$hobby','$qq','$mail'," .
                   "'$place','$date','$date','$ip',1,0,0,0,0,0,0,0,0,NULL,NULL,'$onlinetype','$logininfo','$code',null,null,null,null,null,null)";
        mysql_query($statement);
        $error=mysql_errno();
        if ($error!=0) {
            echo '<capu><info><code>'.$error.'</code><msg>'.mysql_error().'</msg></info></capu>';exit;
        }
        echo '<capu><info><code>0</code><username>'.$username.'</username><token>'.$token.'</token></info></capu>';
        exit;
    }

    function edituser($con,$token,$ip) {
        $time=time();
        $a=token2user($con,$token);
        if (!$a) {echo '<capu><info><code>1</code><msg>超时，请重新登录。</msg></info></capu>';exit;}
        $username=$a['username'];
        $sex=mysql_real_escape_string(@$_REQUEST['sex']);
        $icon=mysql_real_escape_string(@$_REQUEST['icon']);
        $qq=mysql_real_escape_string(@$_REQUEST['qq']);
        $mail=mysql_real_escape_string(@$_REQUEST['mail']);
        $place=mysql_real_escape_string(@$_REQUEST['place']);
        $hobby=mysql_real_escape_string(@$_REQUEST['hobby']);
        $sig1=mysql_real_escape_string(@$_REQUEST['sig1']);
        $sig2=mysql_real_escape_string(@$_REQUEST['sig2']);
        $sig3=mysql_real_escape_string(@$_REQUEST['sig3']);
        $intro=mysql_real_escape_string(@$_REQUEST['intro']);
        $statement="update userinfo set tokentime=$time, sex='$sex'," .
                       "lastip='$ip', icon='$icon', mail='$mail', qq='$qq', intro='$intro', place='$place'," .
                       "hobby='$hobby', sig1='$sig1', sig2='$sig2', sig3='$sig3' where username='$username'";
        mysql_query($statement);
        if(mysql_error()){
            echo '<capu><info><code>1</code><error>'.mysql_error().'</error></info></capu>';
        }else{
            echo '<capu><info><code>0</code><username>'.$username.'</username></info></capu>';
        }
    }

    function updatetokentime($con,$token,$ip) {
        echo '<capu>';
        $time=time();
        $statement="select username from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            echo '<info><code>1</code><msg>超时，请重新登录。</msg></info>';
        }
        else {
            $res=mysql_fetch_array($results);
            $username=$res[0];
            echo "<info><code>0</code><username>$username</username></info>";
            if ($ip!="") $statement="update userinfo set tokentime=$time, lastip='$ip' where username='$username'";
            else $statement="update userinfo set tokentime=$time where username='$username'";
            mysql_query($statement);
        }
        echo '</capu>';
    }
    exit;

    function post($con,$token,$bid,$ip,$attachs) {
        $time=time();
        $statement="select username,star,rights,lastpost from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        /*if (mysql_num_rows($results)==0) {
            echo '<info><code>1</code><msg>超时，请重新登录。</msg></info></capu>';
            exit;
        }*/
        $res=mysql_fetch_array($results);
        $username=$res[0];
        $star=intval($res[1]);
        $rights=intval($res[2]);
        $lastpost=intval($res[3]);
        checkDelayTime($time, $star, $rights, $lastpost, $ip, $results);
        echo '<capu>';
        $statement="select max(tid) from threads where bid=$bid";
        $tid=intval(mysql_result(mysql_query($statement), 0))+1;
        $title=@$_REQUEST['title'];
        if (mb_strlen($title,'utf-8')>=43)
            $title=mb_substr($title,0,40,'utf-8')."...";
        $text=@$_REQUEST['text'];
        $type=@$_REQUEST['type'];
        $sig=intval(@$_REQUEST['sig']);
        $posttime=date('Y-m-d');
        $replytime=date('Y-m-d H:i:s');
        $title=html_entity_decode($title);
        $text=html_entity_decode($text);
        $title=mysql_real_escape_string($title);
        $text=mysql_real_escape_string($text);
        $text=search_replace_exec_at($con,$text,$bid,$tid,1,$username,$title);
        $statement="insert into threads values ($bid,$tid,'$title','$username',null,0,0,1,0,0,0,$time,'$posttime')";
        mysql_query($statement);
        $statement="insert into posts (bid,tid,pid,title,author,text,ishtml,attachs,replytime,updatetime,sig,ip,type,lzl) values ($bid,$tid,1,'$title','$username','$text','YES','$attachs',$time,$time,$sig,'$ip','$type',0)";
        mysql_query($statement);
        echo("<msg>".mysql_error()."</msg>");
        if ($bid!=4)
            $statement="update userinfo set post=post+1, lastpost=$time, tokentime=$time where username='$username'";
        else
            $statement="update userinfo set water=water+1, lastpost=$time, tokentime=$time where username='$username'";
        mysql_query($statement);
        updatestar($con,$username);
        echo "<info><code>0</code><bid>$bid</bid><tid>$tid</tid></info></capu>";
        exit;
    }

    function reply($con,$token,$bid,$tid,$ip,$attachs) {
        $time=time();
        $statement="select username,star,rights,lastpost from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        /*if (mysql_num_rows($results)==0) {
            echo "<info><code>1</code><msg>超时，请重新登录。</msg></info></capu>";
            exit;
        }*/
        $res=mysql_fetch_array($results);
        $username=$res[0];
        $star=intval($res[1]);
        $rights=intval($res[2]);
        $lastpost=intval($res[3]);
        checkDelayTime($time, $star, $rights, $lastpost, $ip, $results);

        {
            $statement = "select activity_id, bid, tid, season_id, name, leader_username 
                from season_threads_activity 
                where bid=$bid and tid=$tid";
            $result_activity = mysql_query($statement);
            if (mysql_num_rows($result_activity)!=0) {
                echo '<capu><info><code>3</code><msg>禁止直接回复报名帖！</msg></info></capu>';
                exit;
            }
        }

        echo '<capu>';
        $statement="select pid from posts where bid=$bid && tid=$tid order by pid desc";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            echo '<info><code>3</code><msg>主题不存在！</msg></info></capu>';
            exit;
        }
        $res=mysql_fetch_array($results);
        $pid=intval($res[0])+1;
        $statement="select locked,author,title from threads where bid=$bid && tid=$tid";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            echo '<info><code>3</code><msg>主题不存在！</msg></info></capu>';
            exit;
        }
        $res=mysql_fetch_array($results);
        $locked=intval($res[0]);
        $tidauthor=$res[1];
        $tidtitle=$res[2];

        if ($locked==1) {
            echo '<info><code>4</code><msg>主题已锁定。</msg></info></capu>';
            exit;
        }
        $title=@$_REQUEST['title'];
        $text=@$_REQUEST['text'];
        $sig=intval(@$_REQUEST['sig']);
        $replytime=date('Y-m-d H:i:s');
        $title=html_entity_decode($title);
        $text=html_entity_decode($text);
        $title=mysql_real_escape_string($title);
        $type=@$_REQUEST['type'];
        $text=mysql_real_escape_string($text);

        $text=search_replace_exec_at($con,$text,$bid,$tid,$pid,$username,$title);

        $statement="insert into posts (bid,tid,pid,title,author,text,ishtml,attachs,replytime,updatetime,sig,ip,type,lzl) values ($bid,$tid,$pid,'$title','$username','$text','YES','$attachs',$time,$time,$sig,'$ip','$type',0)";
        mysql_query($statement);
        if(mysql_error()){
            echo '<info><code>8</code><msg>statement:'.$statement."<br>error:".mysql_error().'</msg></info></capu>';
            exit;
        }
        if($attachs){
            $statement="update attachments set ref=ref+1 where id in (".join(",",explode(" ", $attachs)).")";
            mysql_query($statement);
        }
        $statement="update threads set reply=reply+1, replyer='$username', timestamp=$time where bid=$bid && tid=$tid";
        mysql_query($statement);
        if ($bid!=4)
            $statement="update userinfo set reply=reply+1, lastpost=$time, tokentime=$time where username='$username'";
        else
            $statement="update userinfo set water=water+1, lastpost=$time, tokentime=$time where username='$username'";
        mysql_query($statement);
        updatestar($con,$username);
        if($tidauthor!=$username)
        insertmsg($con,"system", $tidauthor,"reply",$bid, $tid, $pid,$username,$tidtitle);

        echo "<info><code>0</code><bid>$bid</bid><tid>$tid</tid><pid>$pid</pid></info></capu>";
        exit;
    }

    function edit($con,$token,$bid,$tid,$pid,$ip,$attachs) {
        echo '<capu>';
        $time=time();
        $a=getrights($con,$bid,$token);
        if ($a[0]==-1) {echo '<info><code>1</code><msg>超时，请重新登录。</msg></info></capu>';exit;}
        $statement="select author from posts where bid=$bid and tid=$tid and pid=$pid";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {echo '<info><code>3</code><msg>主题不存在！</msg></info></capu>';exit;}
        $res=mysql_fetch_array($results);
        $author=$res[0];
        $username=$a[1];
        if ($a[0]==0 && $username!=$author) {echo '<info><code>5</code><msg>权限不足！</msg></info></capu>';exit;}

        $statement="select locked from threads where bid=$bid && tid=$tid";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            echo '<info><code>3</code><msg>主题不存在！</msg></info></capu>';
            exit;
        }
        $res=mysql_fetch_array($results);
        $locked=intval($res[0]);
        if ($locked==1) {
            echo '<info><code>4</code><msg>主题已锁定。</msg></info></capu>';
            exit;
        }
        $title=@$_REQUEST['title'];
        $text=@$_REQUEST['text'];
        $type=$_REQUEST['type'];
        $sig=intval(@$_REQUEST['sig']);
        $title=html_entity_decode($title);
        $text=html_entity_decode($text);
        $title=mysql_real_escape_string($title);
        $text=mysql_real_escape_string($text);
        $statement="update posts set title='$title', author='$username', text='$text', ishtml='YES', sig=$sig, ip='$ip', type='$type', attachs='$attachs', updatetime=$time where bid=$bid && tid=$tid && pid=$pid";
        mysql_query($statement);
        /*
        if (intval($pid)==1)
        {
            $statement="update threads set timestamp=$time, title='$title', author='$username' where bid=$bid && tid=$tid";
            mysql_query($statement);
        }
        */
        if (intval($pid)==1)
        {
            $statement="update threads set title='$title', author='$username' where bid=$bid && tid=$tid";
            mysql_query($statement);
        }
        $statement="select pid from posts where bid=$bid && tid=$tid order by pid desc";
        $res=mysql_query($statement);
        $number=mysql_num_rows($res);
        if (intval($pid)==intval($number)) {
            $statement="update threads set replyer='$username' where bid=$bid && pid=$pid";
            mysql_query($statement);
        }
        echo "<info><code>0</code><bid>$bid</bid><tid>$tid</tid><pid>$pid</pid></info></capu>";
        exit;
    }

    function threads_action($con,$token,$bid,$tid,$action) {
        $a=getrights($con,$bid,$token);
        if ($a[0]==-1) {echo '<capu><info><code>1</code><msg>超时，请重新登录。</msg></info></capu>';exit;}
        if ($a[0]==0) {echo '<capu><info><code>5</code><msg>权限不足！</msg></info></capu>';exit;}
        echo '<capu>';
        $statement="select * from threads where bid=$bid && tid=$tid";
        if (mysql_num_rows(mysql_query($statement))==0) {
            echo '<info><code>3</code><msg>主题不存在！</msg></info></capu>';
            exit;
        }
        if ($action=="lock")
            $statement="update threads set locked=1-locked where bid=$bid && tid=$tid";
        else if ($action=="top")
            $statement="update threads set top=1-top where bid=$bid && tid=$tid";
        else if ($action=="extr")
            $statement="update threads set extr=1-extr where bid=$bid && tid=$tid";
        else if ($action=="global_top_action") {
            $statement="select bid, tid from thread_global_top where bid=$bid and tid=$tid";
            $results=mysql_query($statement);
            if (mysql_num_rows($results) == 0) {
                $statement="insert into thread_global_top (bid,tid) values ($bid,$tid)";
            } else {
                $statement="delete from thread_global_top where bid=$bid and tid=$tid";
            }
            $results=mysql_query($statement);
            echo '<info><code>0</code></info></capu>';
            return;
        }
        mysql_query($statement);
        if(mysql_error()){
            echo '<info><code>2</code><error>'.mysql_error().'</error></info></capu>';
        }else{
            echo '<info><code>0</code></info></capu>';
            if ($action=="extr") {
                $statement="select author,extr from threads where bid=$bid && tid=$tid";
                $results=mysql_query($statement);
                $res=mysql_fetch_row($results);
                $extr=intval($res[1]);
                $author=$res[0];
                if ($extr==1) {
                    $statement="update userinfo set extr=extr+1 where username='$author'";
                }
                else
                    $statement="update userinfo set extr=extr-1 where username='$author'";
                mysql_query($statement);
            }
        }

    }

    function delete($con,$token,$bid,$tid,$pid) {
        $time=time();
        $a=getrights($con,$bid,$token);

        if ($a[0]==-1) {echo '<capu><info><code>1</code><msg>超时，请重新登录。</msg></info></capu>';exit;}
        $username=$a[1];
        $ip=$a[2];

        if ($pid=="") {
            $statement="select author, reply from threads where bid=$bid && tid=$tid";
            $results=mysql_query($statement);
            $num=mysql_num_rows($results);
            if ($num==0) {
                echo '<capu><info><code>3</code><msg>主题不存在！</msg></info></capu>';
                exit;
            }
            $res=mysql_fetch_row($results);
            $author=$res[0];
            $replynum=intval($res[1]);
            if ($a[0]==0 && ($username!=$author || $replynum!=0))
                {echo '<capu><info><code>5</code><msg>权限不足！</msg></info></capu>';exit;}
            $statement="delete from threads where bid=$bid && tid=$tid";
            mysql_query($statement);
            $statement="select * from posts where bid=$bid && tid=$tid order by pid";
            $results=mysql_query($statement);
            while ($res=mysql_fetch_array($results)) {
                $pid=$res['pid'];
            $title=mysql_real_escape_string($res['title']);
            $author=$res['author'];
            $text=mysql_real_escape_string($res['text']);
            $replytime=$res['replytime'];
            $updatetime=$res['updatetime'];

            $attach=$res['attachs'];
            $attachs=explode(" ",$attach);
            reset($attachs);
            while (list($key,$value)=each($attachs)) {
                if ($value!="")
                    _delattach($con,$value);
            }

            $replyip=$res['ip'];
                $statement="insert into capubbs.null values (null,$bid,$tid,$pid,'$title','$text','$author'," .
                           "'$username',$replytime,$updatetime,$time,'$replyip','$ip')";
                mysql_query($statement);
                echo mysql_error($con);
            }
            $statement="delete from posts where bid=$bid && tid=$tid";
            mysql_query($statement);
            echo '<capu><info><code>0</code></info></capu>';
            exit;
        }
        $statement="select pid from posts where bid=$bid && tid=$tid order by pid desc";
        $results=mysql_query($statement);
        $res=mysql_fetch_array($results);
        $number=intval($res[0]);
        $pid=intval($pid);
        if ($pid<=0 || $pid>$number) {
            echo '<capu><info><code>3</code><msg>帖子不存在！/msg></info></capu>';
            exit;
        }
        if ($number==1) {
            delete($con,$token,$bid,$tid,"");
            exit;
        }
        $statement="select * from posts where bid=$bid && tid=$tid && pid=$pid";
        $results=mysql_query($statement);
        while ($res=mysql_fetch_array($results)) {
            $pid=$res['pid'];
            $title=mysql_real_escape_string($res['title']);
            $author=$res['author'];

            if ($a[0]==0 && $username!=$author)
            {echo '<capu><info><code>5</code><msg>权限不足！</msg></info></capu>';exit;}

            $attach=$res['attachs'];
            $attachs=explode(" ",$attach);
            reset($attachs);
            while (list($key,$value)=each($attachs)) {
                if ($value!="")
                    _delattach($con,$value);
            }

            $text=mysql_real_escape_string($res['text']);
            $replytime=$res['replytime'];
            $updatetime=$res['updatetime'];
            $replyip=$res['ip'];
            $statement="insert into capubbs.null values (null,$bid,$tid,$pid,'$title','$text','$author','$username',$replytime,$updatetime,$time,'$replyip','$ip')";

            mysql_query($statement);
        }
        $statement="delete from posts where bid=$bid && tid=$tid && pid=$pid";
        mysql_query($statement);
        $statement="update posts set pid=pid-1 where bid=$bid && tid=$tid && pid>$pid";
        mysql_query($statement);
        if ($pid==1) {
            $statement="select title, author from posts where bid=$bid && tid=$tid && pid=1";
            $results=mysql_query($statement);
            $res=mysql_fetch_array($results);
            $title=mysql_real_escape_string($res[0]);
            $author=$res[1];
            $statement="update threads set title='$title', author='$author', reply=$number-2 where bid=$bid && tid=$tid";
            mysql_query($statement);
            echo '<capu><info><code>0</code></info></capu>';
            exit;
        }
        if ($pid==$number) {
            $pid=$pid-1;
            $statement="select author,updatetime from posts where bid=$bid && tid=$tid && pid=$pid";
            $results=mysql_query($statement);
            $res=mysql_fetch_row($results);
            $author=$res[0];
            $updatetime=$res[1];
            if ($pid!=1)
                $statement="update threads set replyer='$author',timestamp=$updatetime, reply=$number-2 where bid=$bid && tid=$tid";
            else
                $statement="update threads set replyer=null,timestamp=$updatetime, reply=$number-2 where bid=$bid && tid=$tid";
            mysql_query($statement);
            echo '<capu><info><code>0</code></info></capu>';
            exit;
        }
        $statement="update threads set reply=$number-2 where bid=$bid && tid=$tid";
        mysql_query($statement);
        echo '<capu><info><code>0</code></info></capu>';
        exit;
    }

    function move($con,$token,$bid,$tid,$to) {
        $a=getrights($con,$bid,$token);
        if ($a[0]!=2) {echo '<capu><info><code>5</code><msg>权限不足！</msg></info></capu>';exit;}
        $statement="select max(tid) from threads where bid=$to";
        $totid=intval(mysql_result(mysql_query($statement), 0))+1;
        $statement="select tid from threads where bid=$bid && tid=$tid";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            echo '<capu><info><code>3</code><msg>主题不存在！</msg></info></capu>';
            exit;
        }
        $statement="update threads set bid=$to, tid=$totid where bid=$bid && tid=$tid";
        mysql_query($statement);
        $statement="update posts set bid=$to, tid=$totid where bid=$bid && tid=$tid";
        mysql_query($statement);
        echo '<capu><info><code>0</code><bid>'.$to.'</bid><tid>'.$totid.'</tid></info></capu>';
        exit;
    }

    function lzl($con,$method,$fid,$token,$ip) {
        if ($method=="ask") {
            $statement="select * from lzl where fid=$fid && visible=1 order by id";
            $results=mysql_query($statement);
            echo '<capu>';
            while ($res=mysql_fetch_array($results)) {
                echo '<info>';
                foreach ( $res as $key => $value ) {
                    if (is_long($key)) continue;
                    echo '<'.$key.'>'.trans($value).'</'.$key.'>'."\n";
                }
                echo '</info>';
            }
            echo '</capu>';
            exit;
        }
        if ($method=="post") {
            $time=time();
            $statement="select username,star,rights,lastpost from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
            $results=mysql_query($statement);
            /*if (mysql_num_rows($results)==0) {
                echo '<capu><info><code>1</code><msg>超时，请重新登录。</msg></info></capu>';
                exit;
            }*/
            $res=mysql_fetch_row($results);
            $username=$res[0];
            $star=intval($res[1]);
            $rights=intval($res[2]);
            $lastpost=intval($res[3]);
            checkDelayTime($time, $star, $rights, $lastpost, $ip, $results);

            $text=@$_REQUEST['text'];
            $replytime=time();

            $statement="select author from lzl where fid=$fid";
            $result=mysql_query($statement);
            if (mysql_num_rows($result)>=100) {
                echo "<capu><info><code>10</code><msg>楼中楼数目已经达到上限。</msg></info></capu>";exit;
            }

            $statement="select bid,tid,pid,author from posts where fid=$fid limit 1";
            $result=mysql_query($statement);
            $info=mysql_fetch_array($result);
            $bid=$info['bid'];
            $tid=$info['tid'];
            $pid=$info['pid'];
            $pidauthor=$info['author'];

            $statement="select author,title,locked from threads where bid=$bid && tid=$tid";
            $result=mysql_query($statement);
            $info=mysql_fetch_array($result);
            $tidauthor=$info['author'];
            $tidtitle=$info['title'];
            $lock=intval($info['locked']);
            if ($lock==1) {
                echo "<capu><info><code>3</code><msg>帖子已锁定。</msg></info></capu>";exit;
            }

            if (mb_strlen($text,'utf-8')>=503) $text=mb_substr($text,0,500,'utf-8')."...";

            $text_mysql_escaped=mysql_real_escape_string($text);

            $statement="insert into lzl (fid,author,text,time) values ($fid, '$username', '$text_mysql_escaped', $replytime)";
            mysql_query($statement);
            $error=mysql_errno();
            if($error==0){

                $statement="update posts set lzl=lzl+1 where fid=$fid";
                mysql_query($statement);


                $statement="update userinfo set lastpost=$time, tokentime=$time where username='$username'";
                mysql_query($statement);

                if($pidauthor!=$username) insertmsg($con,"system",$pidauthor,"replylzl",$bid,$tid,$pid, $username,$tidtitle);
                if($tidauthor!=$username&& $tidauthor!=$pidauthor) insertmsg($con,"system",$tidauthor,"reply",$bid,$tid,$pid, $username,$tidtitle);
                $matches = array();
                if(preg_match('/^回复 @(.*)(:|：).*/s', $text, $matches)) {
                    $replied=$matches[1];
                    if($replied!=$pidauthor && $replied!=$tidauthor) insertmsg($con,"system",$replied,"replylzlreply",$bid,$tid,$pid,$username,$tidtitle);
                }
                echo("<capu><info><code>0</code></info></capu>");
            }else{
                echo("<capu><info><code>2</code><msg>".mysql_error()."</msg></info></capu>");
            }

            exit;
        }
        if ($method=="delete") {
            $lzlid=@$_REQUEST['lzlid'];
            $time=time();
            $statement="select username, rights from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
            $results=mysql_query($statement);
            if (mysql_num_rows($results)==0) {
                echo '<capu><info><code>1</code><msg>超时，请重新登录。</msg></info></capu>';
                exit;
            }
            $res=mysql_fetch_array($results);
            $username=$res[0];
            $rights=intval($res[1]);

            $statement="select author from lzl where id=$lzlid";
            $results=mysql_query($statement);
            if (mysql_num_rows($results)==0) {
                echo '<capu><info><code>3</code><msg>帖子不存在！</msg></info></capu>';
                exit;
            }
            $res=mysql_fetch_row($results);
            $author=$res[0];

            $statement="select bid from posts where fid=$fid";
            $results=mysql_query($statement);
            if (mysql_num_rows($results)==0) {
                echo '<capu><info><code>3</code><msg>帖子不存在！</msg></info></capu>';
                exit;
            }

            $res=mysql_fetch_array($results);
            $bid=$res[0];
            $statement="select m1,m2,m3,m4 from boardinfo where bid=$bid";
            $res=mysql_fetch_array($results);
            $able=0;
            for ($i=0;$i<=3;$i++) if ($res[$i]==$username) $able=1;
            if (($rights+$able<3)&&$author!=$username) {
                echo '<capu><info><code>5</code><msg>权限不足！</msg></info></capu>';
                exit;
            }

            $statement="update lzl set visible=0 where id=$lzlid limit 1";
            mysql_query($statement);
            echo '<capu><info><code>0</code></info></capu>';
            $statement="update posts set lzl=lzl-1 where fid=$fid";
            mysql_query($statement);
            exit;
        }
        exit;
    }

    function hot($con,$token){
        $hotnum=10; // Default number of hot list
        if (@$_REQUEST['hotnum'])
            $hotnum=@$_REQUEST['hotnum'];
        echo '<capu>';
        $time=time();
        $statement="select username from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            echo '<info><nowuser></nowuser></info>';
        }else {
            $res=mysql_fetch_array($results);
            $username=$res[0];
            echo "<info><nowuser>$username</nowuser></info>";
        }

        $results=mysql_query("
            select threads.bid,threads.tid,title,author,replyer,click,reply,extr,top,locked,timestamp,postdate,
            case 
                when thread_global_top.bid is null then 0
                else 1
            end as global_top
            from threads left join thread_global_top on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid 
            where thread_global_top.bid is null
            order by timestamp desc 
            limit 0,$hotnum");
        while ($res=mysql_fetch_array($results)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo "</info>\n";
        }
        echo '</capu>';
    }

    function global_top($con,$token){
        echo '<capu>';
        $time=time();
        $statement="select username from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            echo '<info><nowuser></nowuser></info>';
        }else {
            $res=mysql_fetch_array($results);
            $username=$res[0];
            echo "<info><nowuser>$username</nowuser></info>";
        }

        $results=mysql_query("
            select threads.bid,threads.tid,title,author,replyer,click,reply,extr,top,locked,timestamp,postdate,
            case when thread_global_top.bid is null then 0 else 1 end as global_top 
            from threads left join thread_global_top on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid 
            where thread_global_top.bid is not null 
            order by timestamp desc");

        while ($res=mysql_fetch_array($results)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo "</info>\n";
        }
        echo '</capu>';
    }

    function news($con,$token) {
        echo '<capu><info>';
        $a=getrights($con,$bid,$token);
        if (intval($a[3]) < 1) {
            echo '<code>-1</code><msg>您的权限不足！</msg></info></capu>';
            exit;
        }
        $method = @$_REQUEST['method'];
        if ($method == "delete") {
            $time = @$_REQUEST['time'];
            $results = mysql_query("delete from capubbs.mainpage where id=1 && field3='$time'");
            echo '<code>0</code>';
            mysql_query("alter table capubbs.mainpage order by number");
        }else if ($method == "add") {
            $title = @$_REQUEST['text'];
            $url = @$_REQUEST['url'];
            if (strlen($title) == 0) {
                echo '<code>-1</code><msg>您未填写公告内容！</msg></info></capu>';
                exit;
            }
            if (strlen($url) == 0) {
                $url = "javascript:void(0)";
            }
            $time=time();
            $results = mysql_query("insert into capubbs.mainpage values (null,1,'$title','$url','$time','','')");
            echo '<code>0</code>';
            mysql_query("alter table capubbs.mainpage order by number");
        }else {
            echo '<code>-1</code><msg>错误操作！</msg>';
        }
        echo '</info></capu>';
    }

    function tidinfo($con,$bid,$tid){
        $statement="select * from threads where bid=$bid && tid=$tid";
        view_bbs($con,$statement);
    }

    function recentpost($con,$view){
        // $results=mysql_query("select * from threads where author='$view' order by timestamp desc limit 0,10");
        $results=mysql_query("select bid,tid,pid,title,author,replytime as timestamp from posts where author='$view' and pid=1 order by replytime desc limit 0,10");
        echo '<capu>';

        echo "<info><nowuser></nowuser></info>\n";
        while ($res=mysql_fetch_array($results)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo "</info>\n";
        }
        echo '</capu>';
    }
    function recentreply($con,$view){
        $results=mysql_query("select title, bid, tid, pid, updatetime from posts where author='$view' order by updatetime desc limit 0,10");
        echo '<capu>';
        echo "<info><nowuser></nowuser></info>\n";
        while ($res=mysql_fetch_array($results)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo "</info>\n";
        }
        echo '</capu>';
    }

    function logout($con,$token,$ip){
        echo("<capu>");
        $today=date("Y-m-d");
        // $statement="update userinfo set tokentime=null, token=null, nowboard=null, lastip='$ip',lastdate='$today' where token='$token'";
        $statement="update userinfo set nowboard=null, lastip='$ip',lastdate='$today' where token='$token'";
        mysql_query($statement);
        echo("<info><code>0</code></info>");
        echo("</capu>");
    }

    function _userexists($con,$user){
        if(strstr($user, "'")!="") return false;
        else{
            $statement="select * from userinfo where username='$user' limit 1";
            if(mysql_num_rows(mysql_query($statement))==0){
                return false;
            }else{
                return true;
            }
        }
        return false;
    }

    function userexists($con){
        $user=mysql_real_escape_string(@$_REQUEST['user']);
        if(strstr($user, "'")!="") $code= 2;
        else{
            $statement="select * from userinfo where username='$user' limit 1";
            if(mysql_num_rows(mysql_query($statement))==0){
                $code=0;
            }else{
                $code=1;
            }
        }
        echo("<capu><info><code>$code</code></info></capu>");
    }

    function islegal($num){
        return strlen(strval($num))==0|| is_numeric($num);
    }

    // getrights: check if user has enough rights to do something
    // return as an array $a
    // $a[0]: rights
    //     -1: Time out, need to login again
    //     0: No rights to do anything
    //     1: Delete, Top, Extr, Lock. But not Move
    //     2: Enough rights to do anything
    // $a[1]: username
    // $a[2]: ip
    function getrights($con,$bid,$token) {
        $time=time();
        $statement="select username, rights, lastip from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0)
            return array(-1,"","",0);
        $res=mysql_fetch_array($results);
        $username=$res[0];
        $rights=intval($res[1]);
        $ip=$res[2];
        $statement="select m1,m2,m3,m4 from boardinfo where bid=$bid";

        $results=mysql_query($statement);
        $res=mysql_fetch_array($results);
        $able=0;
        for ($i=0;$i<=3;$i++){
            if ($res[$i]==$username) $able=1;
        }
        if ($rights>=3) return array(2,$username,$ip,$rights);
        return array($able,$username,$ip,$rights);
    }

    function rights($con,$bid,$token){
        $a=getrights($con,$bid,$token);
        echo("<capu><info>");
        echo("<username>".$a[1]."</username>");
        echo("<code>".$a[0]."</code>");
        echo("</info></capu>");
    }

    function getuser($con,$token) {
        echo '<capu><info>';
        $nowtime=time();
        if ($token=="") {
            echo '<username></username><rights>0</rights></info></capu>';
            exit;
        }
        $token=mysql_real_escape_string($token);
        $statement="select username,rights from userinfo where token='$token' && $nowtime-tokentime<={$GLOBALS['validtime']}";
        $result=mysql_query($statement);
        if (mysql_num_rows($result)==0) {
            echo '<username></username><rights>0</rights></info></capu>';
            exit;
        }
        $res=mysql_fetch_row($result);
        echo '<username><![CDATA['.$res[0].']]></username><rights>'.$res[1].'</rights></info></capu>';
        exit;
    }

    function token2user($con,$token){
        $nowtime=time();
        if(!$token) return null;
        if(strstr($token, "'")!=""){
            report(1,"illegal");
        }
        $statement="select username,score,star from userinfo where token='$token' && $nowtime-tokentime<={$GLOBALS['validtime']}";
        $result=mysql_query($statement);
        $user="";
        return mysql_fetch_array($result);
        /*
while ($res=mysql_fetch_array($result)) {
            foreach ( $res as $key => $value ) {
                if ($key=="username") { $user=$value; $nowuser=$user;}
            }
        }
        return $user;
*/
    }
    function attach($con,$token,$path,$filename,$price,$auth){
        $user=token2user($con,$token);
        if(!$user) report(3,"unauthorized:$token");
        // if(intval($user['star'])<3&&intval($user['rights'])<1) report(4,"not enough star");
        $user=$user['username'];
        if(strstr($path, "'")!=""){
            report(1,"illegal");
        }
        if(!islegal($price)||!islegal($auth)){
            report(1,"illegal");
        }
        $filename=str_replace("&", "&amp;", $filename);
        $filename=mysql_real_escape_string($filename);
        $size=filesize("{$GLOBALS['attachroot']}".$path);
        $statement="insert into attachments (name,path,size,uploader,price,auth,time) values('$filename','$path',$size,'$user',$price,$auth,".time().")";
        mysql_query($statement);
        if(!mysql_error()) report(0, mysql_insert_id());
        else report(2, $statement."<br>error:".mysql_error());
    }
    function report($code,$msg){
        echo("<capu><info><code>$code</code><msg>$msg</msg></info></capu>");
        exit;
    }
    function attachdl($con,$token,$id){
        $user=token2user($con,$token);
        if(!$user) report(3,"unauthorized");
        $username=$user['username'];
        $score=intval($user['score']);
        if(!islegal($id)){
            report(1,"illegal");
        }
        $statement="select * from attachments where id=$id limit 1";
        $result=mysql_query($statement);
        $ainfo=mysql_fetch_array($result);
        $auth=$ainfo['auth'];
        $price=intval($ainfo['price']);
        if($score<$auth) report(4,"no enough auth");
        if($price>0){
            $statement="select * from purchaserecord where username='$username' and aid=$id limit 1";
            $rows=mysql_num_rows(mysql_query($statement));
            if($rows==0){
                if($score-$price<0){
                    report(5,"no enough score");
                }
                $statement="update userinfo set score=score-$price";
                $result=mysql_query($statement);
                if(!($result&& mysql_affected_rows()>0)){
                    report(2, mysql_error());
                }
                $statement="insert into purchaserecord (username,aid) values('$username',$id)";
                mysql_query($statement);
            }
        }
        $statement="update attachments set count=count+1 where id=$id limit 1";
        mysql_query($statement);
        echo("<capu><info><code>0</code><aid>$id</aid><path>".$ainfo['path']."</path><name>".$ainfo['name']."</name></info></capu>");
    }

    function packBool($bool){
        if($bool) return "YES";
        return "NO";
    }
    function attachinfo($con,$id,$token){
        $statement="select * from attachments where id=$id limit 1";
        $result=mysql_query($statement);
        $ainfo=mysql_fetch_array($result);
        $user=token2user($con,$token);
        $isAuthor=false;
        $hasPurchased=false;
        if($user){
            $username=$user['username'];
            if($username==$ainfo['uploader']){
                $isAuthor=true;
            }else{
                $haspurchased=false;
            }
        }
        $statement="";
        echo '<capu>';
        echo "<info>\n";
        if($ainfo){
            echo("<exist>YES</exist>\n");
            echo("<isAuthor>".packBool($isAuthor)."</isAuthor>\n");
            echo("<hasPurchased>".packBool($hasPurchased)."</hasPurchased>\n");
            foreach ( $ainfo as $key => $value ) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
        }else{
            echo("<exist>NO</exist>\n");
        }
        echo "</info>\n";
        echo '</capu>';
    }
    function unusedattachinfo($con,$token){
        $user=token2user($con,$token);
        if(!$user){
            echo("<capu><info><code>1</code></info></capu>");
            exit();
        }
        $username=$user['username'];
        $statement="select * from attachments where uploader='$username' and ref=0";
        $result=mysql_query($statement);
        echo '<capu>';
        echo("<info><code>0</code></info>");
        while($ainfo=mysql_fetch_array($result)){
            echo("<info>");
            foreach ( $ainfo as $key => $value ) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo("</info>");
        }
        echo("</capu>");
    }
    function delattach($con,$token,$id){
        $user=token2user($con,$token);
        if(!$user){
            echo("<capu><info><code>1</code><msg>超时，请重新登录。</msg></info></capu>");
            exit();
        }
        $username=$user['username'];
        $statement="select * from attachments where id=$id limit 1";
        $result=mysql_query($statement);
        $ainfo=mysql_fetch_array($result);
        if(!$ainfo){
            echo("<capu><info><code>6</code><msg>找不到该附件</msg></info></capu>");
            exit();
        }
        if($ainfo['uploader']!=$username){
            echo("<capu><info><code>2</code><msg>无权删除</msg></info></capu>");
            exit();
        }
        if($ainfo['path']){
            if(!file_exists($GLOBALS['attachroot'].$ainfo['path']) or unlink($GLOBALS['attachroot'].$ainfo['path'])){
                $statement="delete from attachments where id=$id limit 1";
                mysql_query($statement);
                if(!mysql_error()){
                    echo("<capu><info><code>0</code></info></capu>");
                }else{
                    echo("<capu><info><code>3</code><msg>".mysql_error()."</msg></info></capu>");
                }
            }else{
                echo("<capu><info><code>4</code><msg>无法删除附件</msg></info></capu>");
            }
        }else{
            echo("<capu><info><code>5</code><msg>数据库错误</msg></info></capu>");
        }
    }

    function _delattach($con,$id){
        $statement="select * from attachments where id=$id limit 1";
        $result=mysql_query($statement);
        $ainfo=mysql_fetch_array($result);
        if(!$ainfo){
            return false;
        }
        if($ainfo['path']){
            if(!file_exists($GLOBALS['attachroot'].$ainfo['path']) or unlink($GLOBALS['attachroot'].$ainfo['path'])){
                $statement="delete from attachments where id=$id limit 1";
                mysql_query($statement);
                if(!mysql_error()){
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    function getpages($con,$bid,$tid) {
        echo '<capu><info><code>0</code><pages>';
        if ($tid=="") {
            $statement="select count(*) from threads where bid=$bid";
            $results=mysql_query($statement);
            $res=mysql_fetch_row($results);
            $num=intval($res[0]);
            echo ceil($num/25);
        }
        else {
            $statement="select reply from threads where bid=$bid && tid=$tid";
            $results=mysql_query($statement);
            $res=mysql_fetch_row($results);
            $num=intval($res[0]);
            echo ceil($num/12);
        }
        echo '</pages></info></capu>';
        exit;

    }

    function editpreview($con,$token,$bid,$tid,$pid){
        $user=token2user($con,$token);
        if(!$user){
            report(1,"尚未登录");
        }
        $statement="select * from posts where bid=$bid and tid=$tid and pid=$pid limit 1";
        $result=mysql_query($statement);
        $info=mysql_fetch_array($result);
        if(!$info){
            report(4,"贴子不存在");
        }
        if(!$info['author']==$user['username']){
            if(getrights($con,$bid,$token)<1){
                report(2,"无权编辑");
            }
        }

        echo '<capu>';
        echo("<info><code>0</code></info>");
        echo "<info>\n";
        foreach ( $user as $key => $value ) {
            if (is_long($key)) continue;
            if ($key=="password") continue;
            if ($key=="token") continue;
            if ($key=="tokentime") continue;
            if ($key=="lastpost") continue;
            if ($key=="nowboard") continue;
            echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
        }
        echo "</info>\n";
        echo "<info>\n";
        foreach ( $info as $key => $value ) {
            if (is_long($key)) continue;
            echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
        }
        echo "</info>\n";
        echo '</capu>';

    }

    function updatestar($con,$username) {
        $statement="select post,reply,other2 from userinfo where username='$username'";
        $results=mysql_query($statement);
        $res=mysql_fetch_array($results);
        $post=intval($res['post']);
        $reply=intval($res['reply']);
        $total=$post+$reply;
        $star=1;
        if ($total<20) $star=1;
        else if ($total<109) $star=2;
        else if ($total<317) $star=3;
        else if ($total<675) $star=4;
        else if ($total<1278) $star=5;
        else if ($total<2303) $star=6;
        else if ($total<3550) $star=7;
        else if ($total<4885) $star=8;
        else $star=9;
        $ss=intval(@$res['other2']);
        if ($ss!="" && $ss>=1 && $ss<=9) $star=$ss;
        $statement="update userinfo set star=$star where username='$username'";
        mysql_query($statement);
    }

    function sendmsg($con,$token,$to,$text){
        $user=token2user($con,$token);
        if(!$user){
            report(1,"尚未登录");
        }
        $sender=$user['username'];
        $text=mysql_real_escape_string($text);
        $to=mysql_real_escape_string($to);
        $statement="select username from userinfo where username='$to'";
        if(!mysql_fetch_array(mysql_query($statement))){
            report(3, "留言的对象不存在！");
        }
        if(insertmsg($con,$sender,$to,$text,0,0,0,"","")){
            report(0,"success");
        }else{
            report(4,"Database Error");
        }

    }

    function boardcast($con,$token,$text) {
        $rights=getrights($con,1,$token);
        $rights=intval($rights[3]);
        if ($rights!=4) {echo '<capu><info><code>1</code><msg>权限不足</msg></info></capu>';exit;}
        $statement="select username from userinfo";
        $results=mysql_query($statement);
        $text=mysql_real_escape_string($text);
        while ($res=mysql_fetch_row($results)) {
            $user=$res[0];
            $tmptext="尊敬的 ".$user." 用户您好，".$text;
            insertmsg($con,"admin",$user,$tmptext,0,0,0,"","");
        }
        echo '<capu><info><code>0</code></info></capu>';
        exit;
    }

    function insertmsg($con,$from,$to,$text,$bid,$tid,$pid,$ruser,$rmsg){
        $time=time();
        $statement="insert into messages (sender,receiver,text,time,rbid,rtid,rpid,ruser,rmsg) values('$from','$to','$text',$time,$bid,$tid,$pid,'$ruser','$rmsg')";
        if(mysql_query($statement)){
            $statement="update userinfo set newmsg=newmsg+1 where username='$to' limit 1";
            mysql_query($statement);
            return true;
        }else{
            return false;
        }
    }

    function search_replace_exec_at($con,$text,$bid,$tid,$pid,$username,$tidtitle){
        $matches=array();
        preg_match_all("#\[at\](.+?)\[\/at\]#", $text, $matches,PREG_SET_ORDER);
        foreach($matches as $one){
            $str=$one[1];
            if(_userexists($con,$str)){
                insertmsg($con,"system",$str,"at",$bid,$tid,$pid,$username,$tidtitle);
            }
        }
        preg_match_all("#\[quote=(.+?)\](.+?)\[\/quote\]#", $text, $matches,PREG_SET_ORDER);
        foreach($matches as $one){
            $str=$one[1];
            if(_userexists($con,$str)){
                insertmsg($con,"system",$str,"quote",$bid,$tid,$pid,$username,$tidtitle);
            }
        }
        return $text;
    }

    function msgold($con,$token){
        $user=token2user($con,$token);
        if(!$user){
            report(1,"尚未登录");
        }
        $username=$user['username'];

        echo("<ilaw>");
        $statement="select * from messages where receiver='$username' and hasread=0 order by time desc";
        $result=mysql_query($statement);
        echo(mysql_error());
        while ($res=mysql_fetch_array($result)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo "</info>\n";
        }
        $statement="select * from messages where receiver='$username' and hasread=1 order by time desc limit 10 ";
        $result=mysql_query($statement);
        while ($res=mysql_fetch_array($result)) {
            echo "<info>\n";
            foreach ( $res as $key => $value ) {
                if (is_long($key)) continue;
                echo '<'.$key.'>'.trans($value).'</'.$key.">\n";
            }
            echo "</info>\n";
        }
        echo("</ilaw>");

        $statement="update messages set hasread=1 where receiver='$username' and hasread=0";
        mysql_query($statement);
        $statement="update userinfo set newmsg=0 where username='$username' limit 1";
        mysql_query($statement);
    }

    function msg($con,$token,$type){
        $user=token2user($con,$token);
        if(!$user){
            echo("<capu><info><code>1</code><msg>尚未登录</msg></info></capu>");
            return ;
        }
        $username=$user['username'];
        $p=@$_REQUEST['p'];

        $result=mysql_fetch_array(mysql_query("select count(1) as c from messages where receiver='$username' and sender='system' and hasread=0"));
        $sysmsg=$result['c'];
        $result=mysql_fetch_array(mysql_query("select count(1) as c from messages where receiver='$username' and sender='system'"));
        $systotal=$result['c'];
        if($to=@$_REQUEST['to']){
            $statement="select count(1) as c from messages where receiver='$username' and sender!='system' and sender!='$to' and hasread=0";
        }else{
            $statement="select count(1) as c from messages where receiver='$username' and sender!='system' and hasread=0";
        }
        $result=mysql_fetch_array(mysql_query($statement));
        $prvmsg=$result['c'];
        echo("<capu>");
        echo("<info>");
        echo("<code>0</code>");
        echo("<sysmsg>$sysmsg</sysmsg>");
        echo("<prvmsg>$prvmsg</prvmsg>");
        echo("<systotal>$systotal</systotal>");
        echo("</info>");

        if($type=="system"){


            if($p<1) $p=1;
            $limit=10;
            $start=$limit*($p-1);

            $result=mysql_query("select * from messages where receiver='$username' and sender='system' order by hasread,time desc limit $start,$limit");
            while(($one=mysql_fetch_array($result))!=null){
                echo("<info>");
                $username2=$one['ruser'];
                $type=$one['text'];
                $title=$one['rmsg'];
                if($type!="reply"&&$type!="at"&&$type!="replylzl"&&$type!="replylzlreply"&&$type!="quote"){
                    $title=$type;
                    $type="plain";
                }
                $pid=intval($one['rpid']);
                $page=ceil($pid/12);
                $url="/bbs/content/?bid=".$one['rbid']."&tid=".$one['rtid']."&p=$page#$pid";
                $time=$one['time'];
                $hasread=$one['hasread'];
                echo("<username>".trans($username2)."</username>");
                echo("<type>".trans($type)."</type>");
                echo("<title>".trans($title)."</title>");
                echo("<url>".trans($url)."</url>");
                echo("<time>".trans($time)."</time>");
                echo("<hasread>".trans($hasread)."</hasread>");
                echo("</info>");
            }
            echo("</capu>");
            mysql_query("update messages set hasread=1 where receiver='$username' and sender='system' and hasread=0");
        }else if($type=="private"){
            $ans=array();
            $senders=array();
            $result=mysql_query("select sender,group_concat(time order by time desc),group_concat(hasread) from messages where receiver='$username' and sender!='system' group by sender order by hasread,time desc");
            while($one=mysql_fetch_array($result)){
                array_push($ans, $one);
                array_push($senders,$one[0]);
            }
            $senderarea="(";
            for($i=0;$i<count($senders);$i++){
                $senderarea=$senderarea."'".$senders[$i]."',";
            }
            $senderarea=substr($senderarea,0,strlen($senderarea)-1).")";
            if(count($senders)==0){
                $statement="select receiver,group_concat(time order by time desc) from messages where sender='$username' group by receiver order by hasread,time desc";
            }else{
                $statement="select receiver,group_concat(time order by time desc) from messages where sender='$username' and receiver not in $senderarea group by receiver order by hasread,time desc";
            }
            $result=mysql_query($statement);
            while($one=mysql_fetch_array($result)){
                array_push($ans, $one);
            }
            for($i=0;$i< count($ans);$i++){
                $times=$ans[$i][1];
                $times=explode(",",$times);
                $ans[$i][1]=$times[0];
            }

            function comp($a,$b){
                if (intval($a[1])>intval($b[1])){
                    return -1;
                }else if(intval($a[1])==intval($b[1])){
                    return 0;
                }else{
                    return 1;
                }

            }
            usort($ans, "comp");
            for($i=0;$i<count($ans);$i++){
                $one=$ans[$i];
                echo("<info>");
                $sender=$one[0];
                if(!@$one[2]&&@$one[2]!="0"){
                    $hasread="";
                }else{
                    $hasread=$one[2];
                }

                $number=substr_count($hasread, "0");
                $textresult=mysql_fetch_array(mysql_query("select text,time from messages where (receiver='$username' and sender='$sender') or (receiver='$sender' and sender='$username') order by time desc limit 1"));
                $text=$textresult[0];
                $time=$textresult[1];
                $shrink=@$_REQUEST['shrink'];
                if(!$shrink=="no"&&mb_strlen($text,"utf-8")>30){
                    $text=mb_substr($text, 0,30,"utf-8")."......";
                }
                $tresult=mysql_fetch_array(mysql_query("select  count(1) as c from messages where  (receiver='$username' and sender='$sender') or (receiver='$sender' and sender='$username')"));
                $totalnum=$tresult['c'];
                echo("<username>".trans($sender)."</username>");
                echo("<text>".trans($text)."</text>");
                echo("<time>".trans($time)."</time>");
                echo("<number>".trans($number)."</number>");
                echo("<totalnum>".trans($totalnum)."</totalnum>");
                echo("</info>");
            }
            echo("</capu>");

        }else if($type=="chat"){
            $to=@$_REQUEST['to'];
            $result=mysql_query("select * from messages where (receiver='$username' and sender='$to') or (sender='$username' and receiver='$to') order by time");
            while($one=mysql_fetch_array($result)){
                echo("<info>");
                $atype=$one['sender']==$username?"send":"get";
                $text=$one['text'];
                $time=$one['time'];
                echo("<type>$atype</type>");
                echo("<text>".trans($text)."</text>");
                echo("<time>$time</time>");
                echo("</info>");
            }
            echo("</capu>");
            mysql_query("update messages set hasread=1 where receiver='$username' and sender='$to' and hasread=0");
        }
        $result=mysql_fetch_array(mysql_query("select count(1) as c from messages where hasread=0 and receiver='$username'"));
        $num=$result['c'];
        mysql_query("update userinfo set newmsg=$num where username='$username' limit 1");
    }
    function currentUserInfo($con,$token){
        $user=token2user($con,$token);
        if(!$user){
            echo("<ilaw></ilaw>");
            exit();
        }
        view_user($con,$user['username']);

    }

    function changepsd($con,$token){
        $token=mysql_real_escape_string($token);
        $nowtime=time();
        $statement="select password from userinfo where token='$token' and $nowtime-tokentime<={$GLOBALS['validtime']} limit 1";
        $result=mysql_query($statement);
        $result=mysql_fetch_array($result);
        if(!$result){
            report(1,"会话超时，请重新<a href='../login'>登录</a>");
        }
        $oldpsd=@$_REQUEST['old'];
        if(strtoupper($result['password'])!=strtoupper($oldpsd)){
            report(2,"旧密码不正确，请重新输入");
        }
        $newpsd=@$_REQUEST['new'];

        $newtoken=md5($oldpsd.$nowtime);
        $statement="update userinfo set password='$newpsd',token='$newtoken' where token='$token' limit 1";
        if(mysql_query($statement)){
            report(0,$newtoken);
        }else{
            report(3, mysql_error());
        }
    }

    function sign_today($con) {

        $date=@$_REQUEST['view'];
        $time=strtotime($date." 00:00:00");
        if ($time==false || $time==-1) $time=time();
        $year=date("Y",$time);
        $month=date("m",$time);
        $day=date("d",$time);
        $statement="select username from capubbs.sign where year=$year && month=$month && day=$day order by hour, minute, second";
        $todays=mysql_query($statement);
        echo '<capu>';
        while (($res=mysql_fetch_row($todays))!=null) {
            echo '<info><username><![CDATA['.$res[0].']]></username></info>'."\n";
        }
        echo '</capu>';
        exit;

    }

    function sign_year($con) {
        $time=time();
        $year=date("Y",$time);
        $statement="select * from capubbs.sign where year=$year order by month, day";
        $results=mysql_query($statement);
        error_reporting(E_ALL & ~E_NOTICE);
        $datas=array();
        while (($res=mysql_fetch_array($results))!=null) {
            $m=intval($res['month']);
            if ($m<10) $m="0".$m;
            $date=$res['year']."-".$m;
            $d=$res['day'];
            $datas[$date][$d]=intval($datas[$date][$d])+1;
        }
        echo '<capu>';
        foreach ($datas as $key=>$value) {
            echo '<info><month>'.$key.'</month>';
            $y=intval(substr($key,0,4));
            $m=intval(substr($key,5,2));
            for ($i=1;$i<=getdays($y,$m);$i++) {
                $x=0;
                if (@$value[$i]) $x=$value[$i];
                echo '<data><day>'.$i.'</day><number>'.$x.'</number></data>'."\n";
                //echo $x." ";
            }
            echo '</info>';
        }
        echo '</capu>';
        exit;

    }
    function sign_user($con) {
        $statement="select username,sign from capubbs.userinfo order by sign desc,username limit 0,100";
        $results=mysql_query($statement);
        echo '<capu>';
        $i=1;
        $j=1;
        $last=0;
        while (($res=mysql_fetch_row($results))!=null) {
            echo '<info>';
            $username=$res[0];
            $sign=intval($res[1]);
            if ($sign!=$last) $j=$i;
            //echo "#$j: $username   ($sign)\n";
            echo "<number>$j</number><username><![CDATA[$username]]></username><times>$sign</times>";
            echo '</info>';
            $last=$sign;
            $i++;
        }
        echo '</capu>';
    }

    function getdays($year,$month) {
        $days=array(31,28,31,30,31,30,31,31,30,31,30,31);
        if ($month!=2) return $days[$month-1];
        if ($year%4!=0) return 28;
        if ($year%100==0 && $year%400!=0) return 28;
        return 29;
    }
    function searchByKeyword($con,$keyword,$token,$type,$bid){
        $keyword=mysql_real_escape_string($keyword);
        $starttime=mysql_real_escape_string(@$_REQUEST['starttime']);
        $endtime=mysql_real_escape_string(@$_REQUEST['endtime']);
        $author=mysql_real_escape_string(@$_REQUEST['author']);
        $start=strtotime($starttime." 00:00:00");
        $end=strtotime($endtime." 23:59:59");
        if ($start==false || $start==-1)
        {
            $start=strtotime("2001-01-01 00:00:00");
            $starttime="2001-01-01";
        }
        if ($end==false || $end==-1)
        {
            $end=time();
            $endtime=date("Y-m-d",$end);
        }
        if($type=="thread"){
            if ($author=="")
                $statement="select title,bid,tid,author,replytime from posts where bid=$bid and replytime>=$start && replytime<=$end and pid=1 and title like '%$keyword%' order by replytime desc limit 100";
            else
                $statement="select title,bid,tid,author,replytime from posts where bid=$bid and replytime>=$start && replytime<=$end and pid=1 and author='$author' and title like '%$keyword%' order by replytime desc limit 100";

        }else if($type=="post"){
            if ($author=="")
                $statement="select title,bid,tid,pid,author,updatetime from posts where bid=$bid and updatetime>=$start && updatetime<=$end and text like '%$keyword%' order by updatetime desc limit 100";
            else
                $statement="select title,bid,tid,pid,author,updatetime from posts where bid=$bid and updatetime>=$start && updatetime<=$end and author='$author' and text like '%$keyword%' order by updatetime desc limit 100";
        }
        view_bbs($con, $statement);
    }

    function getnum($con) {
        $time=time();
        $year=date("Y",$time);
        $month=date("m",$time);
        $day=date("d",$time);

        $statement="select * from sign where year=$year && month=$month && day=$day order by hour, minute, second";

        $results=mysql_query($statement);
        $num=mysql_num_rows($results);

        echo '<capu><info><sign>'.$num.'</sign>';

        $statement="select username from userinfo where $time-tokentime<=600";
        $result=mysql_query($statement);
        $num=mysql_num_rows($result);

        $statement="select field1,field2 from mainpage where id=-2";
        $result=mysql_query($statement);
        $res=mysql_fetch_row($result);
        $maxnum=intval($res[0]);
        $thattime=intval($res[1]);

        if ($num>$maxnum) {
            $maxnum=$num;
            $thattime=$time;
            $statement="update mainpage set field1='$maxnum', field2='$thattime' where id=-2";
            mysql_query($statement);
        }

        echo '<online>'.$num.'</online><maxnum>'.$maxnum.'</maxnum><time>'.date("Y-m-d",$thattime).'</time></info></capu>';
        exit;
    }

    function checkinschool($ip) {
        $ips=explode(".",$ip);
        if ($ips[0]=="10") return true;
        if ($ips[0]=="59" && $ips[1]=="108") return true;
        if ($ips[0]=="61" && $ips[1]=="50" && $ips[2]=="221") return true;
        if ($ips[0]=="111" && $ips[1]=="205") return true;
        if ($ips[0]=="115" && $ips[1]=="27") return true;
        if ($ips[0]=="124" && $ips[1]=="17" && $ips[2]=="17") return true;
        if ($ips[0]=="124" && $ips[1]=="17" && $ips[2]=="18") return true;
        if ($ips[0]=="162" && $ips[1]=="105") return true;
        if ($ips[0]=="202" && $ips[1]=="112") return true;
        if ($ips[0]=="211" && $ips[1]=="71") return true;
        if ($ips[0]=="211" && $ips[1]=="82") return true;
        if ($ips[0]=="222" && $ips[1]=="28") return true;
        if ($ips[0]=="222" && $ips[1]=="29") return true;
        if ($ips[0]=="218" && $ips[1]=="249") return true;
        if ($ips[0]=="88" && $ips[1]=="12" && $ips[2]=="242") return true;
        if ($ips[0]=="127" && $ips[1]=="0" && $ips[2]=="0" && $ips[3]=="1") return true;
        if ($ips[0]=="2001" && $ips[1]=="da8" && $ips[2]=="201") return true;
        return false;
    }

    function checkDelayTime($time, $star, $rights, $lastpost, $ip, $results) {
        /*
         * the checkDelayTime() function checks the delay time between
         * two recent posts from the same user. If the delay time is
         * too short, it'll return an error message.
        */
        if (mysql_num_rows($results)==0) {
            echo '<capu><info><code>1</code><msg>超时，请重新登录。</msg></info></capu>';
            exit;
        }
        // $inschool = checkinschool($ip);
        $inschool = true;       // 跳过对校内ip的判断逻辑
        $delta = 180;
        if ($inschool || $rights >= 1 || $star >= 3)
            $delta = 15;
        if ($time - $lastpost >= 0 && $time - $lastpost <= $delta) {
            echo '<capu><info><code>2</code>';
            if ($inschool)
                echo ' <msg>两次发表/回复的时间间隔不能少于15秒';
            else
                echo '<msg>您的ip位于校外，两次发表/回复的时间间隔不能少于3分钟';
            echo '！</msg></info></capu>';
            exit;
        }
    }

?>
