<?php
    function getTidInfo($con, $bid, $tid) {
        $statement="select * from threads where bid=$bid && tid=$tid";
        $results = mysqli_query($con, $statement);
        $ret = array();
        while ($res = mysqli_fetch_array($results)) {
            $ret[] = $res;
        }
        return $ret;
    }

    function checkUserAndSign($con, $ip, $token) {
        $GLOBALS['validtime']=60*60*24*7;

        $nowtime=time();
        $time=time();
        $statement="select username,star,rights,lastpost from userinfo 
            where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results = mysqli_query($con, $statement);
        $res = mysqli_fetch_array($results, MYSQLI_ASSOC);
        $username = $res['username'];

        if ($username) {
            $today=date("Y-m-d");
            $onlinetype="web";
            $browser=@$_REQUEST['browser'];
            $system=@$_REQUEST['system'];
            $logininfo="";
            if ($onlinetype=="web") $logininfo=$browser;
            if ($onlinetype=="android" || $onlinetype=="ios") $logininfo=$system;

            if ($ip!="") {
                $statement="insert into username_lastip (username, lastip) values ('$username', '$ip')";
                mysqli_query($con, $statement);
            }
    
            if ($ip!="") $statement="update userinfo set tokentime=$nowtime, token='$token', lastip='$ip',lastdate='$today',onlinetype='$onlinetype',logininfo='$logininfo' where username='$username'";
            else $statement="update userinfo set tokentime=$nowtime, token='$token', lastdate='$today',onlinetype='$onlinetype',logininfo='$logininfo' where username='$username'";
            mysqli_query($con, $statement);

            $year=date("Y",$time);
            $month=date("m",$time);
            $day=date("d",$time);
            $statement="select * from capubbs.sign where year=$year && month=$month && day=$day && username='$username'";
            $result = mysqli_query($con, $statement);
            if (mysqli_num_rows($result)==0) {
                $hour=date("H",$time);
                $minute=date("i",$time);
                $second=date("s",$time);
                $week=date("N",$time);
                $statement="insert into capubbs.sign values ($year,$month,$day,$hour,$minute,$second,$week,'$username')";
                mysqli_query($con, $statement);
                $statement="update capubbs.userinfo set sign=sign+1 where username='$username'";
                mysqli_query($con, $statement);
            }
        }

        mysqli_free_result($result);
        return $username;
    }

    function getOnePage($con, $bid, $tid, $page, $see_lz, $ip, $token, $username) {
        $GLOBALS['validtime']=60*60*24*7;
        $GLOBALS['attachroot']="../bbs/attachment/";

        $nowuser="";
        if ($token!="") {
            $nowtime=time();
            $statement="select username from userinfo where token='$token' && $nowtime-tokentime<={$GLOBALS['validtime']}";
            $result = mysqli_query($con, $statement);
            $user="";
            while ($res=mysqli_fetch_array($result)) {
                foreach ( $res as $key => $value ) {
                    if ($key=="username") { $user=$value; $nowuser=$user;}
                }
                if ($ip!="")
                    $statement="update userinfo set tokentime=$nowtime, nowboard=$bid, lastip='$ip' where username='$user'";
                else
                    $statement="update userinfo set tokentime=$nowtime, nowboard=$bid where username='$user'";
                mysqli_query($con, $statement);
            }
        }
        $author="";
        if ($see_lz!="") {
            $statement="select author from threads where bid=$bid && tid=$tid";
            $results=mysqli_query($con, $statement);
            if (mysqli_num_rows($results)!=0) {
                $result=mysqli_fetch_row($results);
                $author=$result[0];
            }
        }
        $today=date("Y-m-d");
        $statement="insert into username_view (username, date, bid, tid, ip) values ('$username', '$today', $bid, $tid, '$ip')";
        mysqli_query($con, $statement);
        $start=($page-1)*12;
        if ($author!="")
            $statement="select * from posts where bid=$bid && tid=$tid && author='$author' order by pid limit $start, 12";
        else
            $statement="select * from posts where bid=$bid && tid=$tid order by pid limit $start, 12";

        $results = mysqli_query($con, $statement);
        $ret = mysqli_fetch_all($results, MYSQLI_ASSOC);

        $statement = "update threads set click=click+1 where bid=$bid && tid=$tid";
        mysqli_query($con, $statement);
        return $ret;
    }
?>
