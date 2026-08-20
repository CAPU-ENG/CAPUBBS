<?php

function get_joint($username, $activity_id) {
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    $username = mysqli_real_escape_string($con, $username);
    $statement = "select * from season_activity_join
        where activity_id=$activity_id and username='$username'";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results)==0) {
        return false;
    } else {
        return true;
    }
}

function get_activity_join($activity_id) {
    $activity_id = intval($activity_id);
    $ret = array();
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");
    $statement = "select season_activity_join.username,cancel,case when has_punishment is null then 0 else 1 end as has_punishment
        from 
            season_activity_join 
        left join 
            (select username, 1 as has_punishment from punishment where is_end=0 and is_deleted=0 group by username) punishment 
        on 
            season_activity_join.username=punishment.username
        where 
            activity_id=$activity_id 
        order by
            join_id";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results)!=0) {
        while ($rows = mysqli_fetch_array($results)) {
            $username = $rows["username"];
            $cancel = $rows["cancel"];
            $has_punishment = $rows["has_punishment"];
            $option_value = getUsernameOptionValue($username, $activity_id);
            $ret[] = array("username"=> $username,"option_value"=> $option_value, "cancel"=> $cancel, "has_punishment"=>$has_punishment);
        }
    }
    return $ret;
}

function get_activity_join_remind($activity_id) {
    $activity_id = intval($activity_id);
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");
    $statement = "select text from activity_join_remind where activity_id=$activity_id";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results)!=0) {
        $rows = mysqli_fetch_array($results);
        return $rows["text"];
    }
    return NULL;
}

function get_canceled($username, $activity_id) {
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    $username = mysqli_real_escape_string($con, $username);
    $statement = "select * from season_activity_join
        where activity_id=$activity_id and username='$username' and cancel=1";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results)==0) {
        return false;
    } else {
        return true;
    }
}


function createActivity($username, $bid, $title, $text, $options, $sig, $attachs = '', $signup_starts_at = null, $signup_ends_at = null) {
    $season_id = -1;
    $GLOBALS['validtime']=1800;
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    $ip = '*';
    $time = time();
    $tid = null;
    $user_count_updated = false;
    $author_username = $username;
    $username = mysqli_real_escape_string($con, $username);

    mysqli_begin_transaction($con);
    try {
        $statement="select max(tid) from threads where bid=$bid";
        $result = activity_service_query_or_throw($con, $statement);
        $tid=intval(mysqli_fetch_row($result)[0])+1;
        if (mb_strlen($title,'utf-8')>=43)
            $title=mb_substr($title,0,40,'utf-8')."...";
        $type='web';
        $posttime=date('Y-m-d');
        $title=html_entity_decode($title);
        $text=html_entity_decode($text);
        $title=mysqli_real_escape_string($con, $title);
        $text=mysqli_real_escape_string($con, $text);
        $text=search_replace_exec_at_2($con,$text,$bid,$tid,1,$author_username,$title);

        $statement="insert into threads values ($bid,$tid,'$title','$username',null,0,0,1,0,0,0,$time,'$posttime')";
        activity_service_query_or_throw($con, $statement);
        $statement="insert into posts (bid,tid,pid,title,author,text,ishtml,attachs,replytime,updatetime,sig,ip,type,lzl) values ($bid,$tid,1,'$title','$username','$text','YES','$attachs',$time,$time,$sig,'$ip','$type',0)";
        activity_service_query_or_throw($con, $statement);
        if ($bid!=4)
            $statement="update userinfo set post=post+1, lastpost=$time, tokentime=$time where username='$username'";
        else
            $statement="update userinfo set water=water+1, lastpost=$time, tokentime=$time where username='$username'";
        activity_service_query_or_throw($con, $statement);
        $user_count_updated = true;
        updatestar($con,$author_username);

        $statement="insert into season_threads_activity (bid,tid,season_id,name,leader_username)
            values ($bid,$tid,$season_id,'$title','$username')";
        activity_service_query_or_throw($con, $statement);
        $activity_id = mysqli_insert_id($con);

        if ($signup_starts_at !== null && $signup_ends_at !== null) {
            $signup_starts_at = intval($signup_starts_at);
            $signup_ends_at = intval($signup_ends_at);
            $statement = "insert into season_activity_signup_window (activity_id, starts_at, ends_at)
                values ($activity_id, $signup_starts_at, $signup_ends_at)";
            activity_service_query_or_throw($con, $statement);
        }

        foreach($options as $option) {
            $type_id = intval($option["type_id"]);
            $option_name = mysqli_real_escape_string($con, $option["option_name"]);
            $required = intval($option["required"]);
            $comment = mysqli_real_escape_string($con, isset($option["comment"]) ? $option["comment"] : '');
            $hiden = isset($option['hiden']) ? intval($option['hiden']) : 0;
            $statement="insert into season_activity_option (activity_id, type_id, option_name, required, comment, hiden)
                values ($activity_id, $type_id, '$option_name', $required, '$comment', $hiden)";
            activity_service_query_or_throw($con, $statement);
            $option_id = mysqli_insert_id($con);

            if ($type_id === 1 || $type_id === 3) {
                foreach ($option["cases"] as $case) {
                    $case_name = mysqli_real_escape_string($con, $case["case_name"]);
                    $case_comment = mysqli_real_escape_string($con, isset($case["comment"]) ? $case["comment"] : '');
                    $statement= "insert into season_option_case (option_id, case_name, comment)
                        values ($option_id, '$case_name', '$case_comment')";
                    activity_service_query_or_throw($con, $statement);
                }
            }
        }

        mysqli_commit($con);
        return array("activity_id" => $activity_id, "bid" => $bid, "tid" => $tid);
    } catch (Exception $error) {
        mysqli_rollback($con);
        if ($tid !== null) {
            mysqli_query($con, "delete from posts where bid=$bid and tid=$tid");
            mysqli_query($con, "delete from threads where bid=$bid and tid=$tid");
        }
        if ($user_count_updated) {
            if ($bid!=4)
                mysqli_query($con, "update userinfo set post=greatest(post-1,0) where username='$username'");
            else
                mysqli_query($con, "update userinfo set water=greatest(water-1,0) where username='$username'");
            updatestar($con,$author_username);
        }
        throw $error;
    }
}

function activity_service_query_or_throw($con, $statement) {
    $result = mysqli_query($con, $statement);
    if ($result === false) {
        throw new Exception(mysqli_error($con));
    }
    return $result;
}

function getUsernameOptionValue($username, $activity_id) {
    $activity_id = intval($activity_id);
    $ret = array();
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    $username = mysqli_real_escape_string($con, $username);
    $statement = "select join_id, post_fid  from season_activity_join
        where activity_id=$activity_id and username='$username'";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) != 0) {
        $row_join_id = mysqli_fetch_array($results);
        $join_id = $row_join_id["join_id"];
        $post_fid = $row_join_id["post_fid"];

        $statement = "select join_id from season_activity_join
            where activity_id=$activity_id and username='$username'";
        $results = mysqli_query($con, $statement);
        $row = mysqli_fetch_array($results);
        $join_id = $row["join_id"];

        $statement = "select option_id, value from season_join_option_value
            where join_id=$join_id";
        $results = mysqli_query($con, $statement);
        while ($row = mysqli_fetch_array($results)) {
            $ret[$row["option_id"]] = $row["value"];
        }

        $statement = "select sig from posts where fid=$post_fid";
        $results = mysqli_query($con, $statement);
        $row = mysqli_fetch_array($results);
        $ret["sign"] = $row["sig"];
    }

    return $ret;
}

function getActivity($bid, $tid) {
    if (empty($bid) || empty($tid))
        return null;

    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    $bid = intval($bid);
    $tid = intval($tid);
    $statement = "select activity.activity_id, activity.bid, activity.tid, activity.season_id,
            activity.name, activity.leader_username, signup_window.starts_at, signup_window.ends_at
        from season_threads_activity activity
        left join season_activity_signup_window signup_window on signup_window.activity_id=activity.activity_id
        where activity.bid=$bid and activity.tid=$tid";
    $result_activity = mysqli_query($con, $statement);

    if ($result_activity and $row_activity = mysqli_fetch_array($result_activity)) {
        $activity_id = $row_activity["activity_id"];
        $season_id = $row_activity["season_id"];
        $name = $row_activity["name"];
        $leader_username = $row_activity["leader_username"];
        $signup_window = null;
        if ($row_activity["starts_at"] !== null && $row_activity["ends_at"] !== null) {
            $starts_at = intval($row_activity["starts_at"]);
            $ends_at = intval($row_activity["ends_at"]);
            $now = time();
            $signup_window = array(
                "starts_at" => $starts_at,
                "ends_at" => $ends_at,
                "status" => $now < $starts_at ? "not_started" : ($now >= $ends_at ? "closed" : "open"),
            );
        }

        $options = array();

        $statement = "select id, type_id, option_name, required, comment, hiden
            from season_activity_option
            where activity_id=$activity_id order by id";
        $result_option = mysqli_query($con, $statement);
        while ($row_option = mysqli_fetch_array($result_option)) {
            $option = array(
                "option_id"=> $row_option["id"],
                "type_id"=> $row_option["type_id"],
                "option_name"=> $row_option["option_name"],
                "required"=> $row_option["required"],
                "comment"=> $row_option["comment"],
                "hiden"=> $row_option["hiden"]
            );
            $option_id = $row_option["id"];
            switch ($option["type_id"]) {
                case 1: case 3:
                    $cases = array();
                    $statement = "select case_id, case_name, comment, need_value
                        from season_option_case
                        where option_id=$option_id order by case_id";
                    $result_case = mysqli_query($con, $statement);
                    while ($row_case = mysqli_fetch_array($result_case)) {
                        $case = array(
                            "case_id"=> $row_case["case_id"],
                            "case_name"=> $row_case["case_name"],
                            "comment"=> $row_case["comment"],
                            "need_value"=> $row_case["need_value"]
                        );
                        $cases[] = $case;
                    }
                    $option["cases"] = $cases;
                    break;
            }
            $options[] = $option;
        }
        $activity = array(
            "activity_id"=> $activity_id,
            "season_id"=> $season_id,
            "name"=> $name,
            "leader_username"=> $leader_username,
            "signup_window"=> $signup_window,
            "options"=>$options
        );
        return $activity;
    }

    return null;
}

function search_replace_exec_at_2($con,$text,$bid,$tid,$pid,$username,$tidtitle){
    $matches=array();
    preg_match_all("#\[at\](.+?)\[\/at\]#", $text, $matches,PREG_SET_ORDER);
    foreach($matches as $one){
        $str=$one[1];
        if($str!=$username && _userexists_2($con,$str)){
            insertmsg_2($con,"system",$str,"at",$bid,$tid,$pid,$username,$tidtitle);
        }
    }
    preg_match_all("#\[quote=(.+?)\](.+?)\[\/quote\]#", $text, $matches,PREG_SET_ORDER);
    foreach($matches as $one){
        $str=$one[1];
        if($str!=$username && _userexists_2($con,$str)){
            insertmsg_2($con,"system",$str,"quote",$bid,$tid,$pid,$username,$tidtitle);
        }
    }
    return $text;
}

function insertmsg_2($con,$from,$to,$text,$bid,$tid,$pid,$ruser,$rmsg) {
    $time=time();
    $statement="insert into messages (sender,receiver,text,time,rbid,rtid,rpid,ruser,rmsg) values('$from','$to','$text',$time,$bid,$tid,$pid,'$ruser','$rmsg')";
    if(mysqli_query($con, $statement)){
        $statement="update userinfo set newmsg=newmsg+1 where username='$to' limit 1";
        mysqli_query($con, $statement);
        return true;
    }else{
        return false;
    }
}

function _userexists_2($con,$user){
    if(strstr($user, "'")!="") return false;
    else{
        $statement="select * from userinfo where username='$user' limit 1";
        if(mysqli_num_rows(mysqli_query($con, $statement))==0){
            return false;
        }else{
            return true;
        }
    }
    return false;
}

function updatestar($con,$username) {
    $username = mysqli_real_escape_string($con, $username);
    $statement="select post,reply,other2 from userinfo where username='$username'";
    $results=mysqli_query($con, $statement);
    $res=mysqli_fetch_array($results);
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
    mysqli_query($con, $statement);
}

function get_floor_num_1($username, $activity_id) {
    $activity_id = intval($activity_id);
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    $username = mysqli_real_escape_string($con, $username);
    $statement = "
        select username, rank_num from (select username, @r:=@r+1 as rank_num from season_activity_join, (select @r := 1) r where activity_id=$activity_id order by post_fid) ranks where username='$username'";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) != 0) {
        $row = mysqli_fetch_array($results);
        $floor_num = $row["rank_num"];
        return $floor_num;
    }

    return -1;
}

function get_floor_num_2($username, $bid, $tid) {
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    $username = mysqli_real_escape_string($con, $username);
    $statement = "
        select author, rank_num from (select author as author, @r:=@r+1 as rank_num from posts, (select @r := 0) r where bid=$bid and tid=$tid order by replytime) ranks where author='$username'";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) != 0) {
        $row = mysqli_fetch_array($results);
        $floor_num = $row["rank_num"];
        return $floor_num;
    }

    return -1;
}
