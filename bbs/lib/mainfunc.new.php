<?php
    function getOnePage($bid, $tid, $page, $see_lz, $ip, $token) {
        $GLOBALS['validtime']=60*60*24*7;
        $GLOBALS['attachroot']="../bbs/attachment/";
        dbconnect();
        mysql_select_db("capubbs");

        $con=null;

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

                if ($ip!="") {
                    $statement="insert into username_lastip (username, lastip) values ('$username', '$ip')";
                    mysql_query($statement);
                }
        
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
        $author="";
        if ($see_lz!="") {
            $statement="select author from threads where bid=$bid && tid=$tid";
            $results=mysql_query($statement);
            if (mysql_num_rows($results)!=0) {
                $result=mysql_fetch_row($results);
                $author=$result[0];
            }
        }
        $today=date("Y-m-d");
        $statement="insert into username_view (username, date, bid, tid, ip) values ('$username', '$today', $bid, $tid, '$ip')";
        mysql_query($statement);
        $start=($page-1)*12;
        if ($author!="")
            $statement="select * from posts where bid=$bid && tid=$tid && author='$author' order by pid limit $start, 12";
        else
            $statement="select * from posts where bid=$bid && tid=$tid order by pid limit $start, 12";

        $results=mysql_query($statement);
        // $res=mysql_fetch_array($results);

        $ret = array();
        while ($res=mysql_fetch_array($results)) {
            $ret[] = $res;
        }

        $statement="update threads set click=click+1 where bid=$bid && tid=$tid";
        mysql_query($statement);
        return $ret;
    }
?>
