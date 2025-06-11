<?php

function get_joint($username, $activity_id) {
    dbconnect();
    mysql_select_db("capubbs");

    $username = mysql_real_escape_string($username);
    $statement = "select * from season_activity_join
        where activity_id=$activity_id and username='$username'";
    $results = mysql_query($statement);
    if (mysql_num_rows($results)==0) {
        return false;
    } else {
        return true;
    }
}

function get_activity_join($activity_id) {
    dbconnect();
    mysql_select_db("capubbs");
    $statement = "select season_activity_join.username,cancel,case when has_punishment is null then 0 else 1 end as has_punishment 
        from 
            season_activity_join 
        left join 
            (select username, 1 as has_punishment from punishment where is_end=0 group by username) punishment 
        on 
            season_activity_join.username=punishment.username
        where 
            activity_id=$activity_id 
        order by
            join_id";
    $results = mysql_query($statement);
    if (mysql_num_rows($results)!=0) {
        while ($rows = mysql_fetch_array($results)) {
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
    dbconnect();
    mysql_select_db("capubbs");
    $statement = "select text from activity_join_remind where activity_id=$activity_id";
    $results = mysql_query($statement);
    if (mysql_num_rows($results)!=0) {
        $rows = mysql_fetch_array($results);
        return $rows["text"];
    }
    return NULL;
}

function get_canceled($username, $activity_id) {
    dbconnect();
    mysql_select_db("capubbs");

    $username = mysql_real_escape_string($username);
    $statement = "select * from season_activity_join
        where activity_id=$activity_id and username='$username' and cancel=1";
    $results = mysql_query($statement);
    if (mysql_num_rows($results)==0) {
        return false;
    } else {
        return true;
    }
}


function createActivity($username, $bid, $title, $text, $options, $sig) {

    echo "createActivity\n";

    // $con,$token,$bid,$ip,$attachs

    $season_id = -1;
    $GLOBALS['validtime']=1800;
    $GLOBALS['attachroot']="../bbs/attachment/";
    dbconnect();
    mysql_select_db("capubbs");

    $ip = '*';
    $time = time();
    $con = '';
    $statement="select max(tid) from threads where bid=$bid";
    $tid=intval(mysql_result(mysql_query($statement), 0))+1;
    if (mb_strlen($title,'utf-8')>=43)
        $title=mb_substr($title,0,40,'utf-8')."...";
    $type='web';
    $attachs = '';
    $posttime=date('Y-m-d');
    $replytime=date('Y-m-d H:i:s');
    $title=html_entity_decode($title);
    $text=html_entity_decode($text);
    $title=mysql_real_escape_string($title);
    $text=mysql_real_escape_string($text);
    $text=search_replace_exec_at_2($con,$text,$bid,$tid,1,$username,$title);
    $statement="insert into threads values ($bid,$tid,'$title','$username',null,0,0,1,0,0,0,$time,'$posttime')";
    mysql_query($statement);
    $statement="insert into posts (bid,tid,pid,title,author,text,ishtml,attachs,replytime,updatetime,sig,ip,type,lzl) values ($bid,$tid,1,'$title','$username','$text','YES','$attachs',$time,$time,$sig,'$ip','$type',0)";
    mysql_query($statement);
    if ($bid!=4)
        $statement="update userinfo set post=post+1, lastpost=$time, tokentime=$time where username='$username'";
    else
        $statement="update userinfo set water=water+1, lastpost=$time, tokentime=$time where username='$username'";
    mysql_query($statement);
    updatestar($con,$username);

    // 修改season_threads_activity表：增加活动
    // 拉练季节，对应bid、tid，拉练名称，队长名
    {
        $statement="insert into season_threads_activity (bid,tid,season_id,name,leader_username) 
        values ($bid,$tid,$season_id,'$title','$username')";
        mysql_query($statement);
        $activity_id = mysql_insert_id();
    }


    // 修改season_activity_option表：增加填表信息
    // 活动id，【信息类型id，信息名，是否必选，注释】
    foreach($options as $option)
    {
        $type_id = intval($option["type_id"]);
        $option_name = mysql_real_escape_string($option["option_name"]);
        $required = intval($option["required"]);
        $comment = mysql_real_escape_string($option["comment"]);
        $statement="insert into season_activity_option (activity_id, type_id, option_name, required, comment) 
        values ($activity_id, $type_id, '$option_name', $required, '$comment')";
        mysql_query($statement);
        $option_id = mysql_insert_id();

        // 修改season_option_case表：增加信息选项
        // 活动id，选项名，注释
        switch ($type_id) {
            case 1: // 单项选择
                $cases = $option["cases"];
                foreach ($cases as $case) {
                    $case_name = mysql_real_escape_string($case["case_name"]);
                    $comment = mysql_real_escape_string($case["comment"]);
                    $statement= "insert into season_option_case (option_id, case_name, comment) 
                    values ($option_id, '$case_name', '$comment')";
                    mysql_query($statement);
                }
                break;
        }
    }
}

function getUsernameOptionValue($username, $activity_id) {
    dbconnect();
    mysql_select_db("capubbs");

    $username = mysql_real_escape_string($username);
    $statement = "select join_id, post_fid  from season_activity_join
        where activity_id=$activity_id and username='$username'";
    $results = mysql_query($statement);
    if (mysql_num_rows($results) != 0) {
        $row_join_id = mysql_fetch_array($results);
        $join_id = $row_join_id["join_id"];
        $post_fid = $row_join_id["post_fid"];
        
        $statement = "select join_id from season_activity_join
            where activity_id=$activity_id and username='$username'";
        $results = mysql_query($statement);
        $row = mysql_fetch_array($results);
        $join_id = $row["join_id"];

        $statement = "select option_id, value from season_join_option_value
            where join_id=$join_id";
        $results = mysql_query($statement);
        while ($row = mysql_fetch_array($results)) {
            $ret[$row["option_id"]] = $row["value"];
        }
        
        $statement = "select sig from posts where fid=$post_fid";
        $results = mysql_query($statement);
        $row = mysql_fetch_array($results);
        $ret["sign"] = $row["sig"];
    }

    return $ret;
}

function getActivity($bid, $tid) {
    if (empty($bid) || empty($tid))
        return null;

    dbconnect();
    mysql_select_db("capubbs");

    $bid = intval($bid);
    $tid = intval($tid);
    $statement = "select activity_id, bid, tid, season_id, name, leader_username 
        from season_threads_activity 
        where bid=$bid and tid=$tid";
    $result_activity = mysql_query($statement);
    
    if ($result_activity and $row_activity = mysql_fetch_array($result_activity)) {
        $activity_id = $row_activity["activity_id"];
        $season_id = $row_activity["season_id"];
        $name = $row_activity["name"];
        $leader_username = $row_activity["leader_username"];

        $options = array();

        $statement = "select id, type_id, option_name, required, comment
            from season_activity_option
            where activity_id=$activity_id order by id";
        $result_option = mysql_query($statement);
        while ($row_option = mysql_fetch_array($result_option)) {
            $option = array(
                "option_id"=> $row_option["id"],
                "type_id"=> $row_option["type_id"],
                "option_name"=> $row_option["option_name"],
                "required"=> $row_option["required"],
                "comment"=> $row_option["comment"]
            );
            $option_id = $row_option["id"];
            switch ($option["type_id"]) {
                case 1:
                    $cases = array();
                    $statement = "select case_id, case_name, comment, need_value
                        from season_option_case
                        where option_id=$option_id order by case_id";
                    $result_case = mysql_query($statement);
                    while ($row_case = mysql_fetch_array($result_case)) {
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
        if(_userexists_2($con,$str)){
            insertmsg_2($con,"system",$str,"at",$bid,$tid,$pid,$username,$tidtitle);
        }
    }
    preg_match_all("#\[quote=(.+?)\](.+?)\[\/quote\]#", $text, $matches,PREG_SET_ORDER);
    foreach($matches as $one){
        $str=$one[1];
        if(_userexists_2($con,$str)){
            insertmsg_2($con,"system",$str,"quote",$bid,$tid,$pid,$username,$tidtitle);
        }
    }
    return $text;
}

function insertmsg_2($con,$from,$to,$text,$bid,$tid,$pid,$ruser,$rmsg) {
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

function _userexists_2($con,$user){
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

function get_floor_num_1($username, $activity_id) {
    dbconnect();
    mysql_select_db("capubbs");

    $username = mysql_real_escape_string($username);
    $statement = "
        select username, rank from (select username, @r:=@r+1 as rank from season_activity_join, (select @r := 1) r where activity_id=$activity_id order by post_fid) ranks where username='$username'";
    $results = mysql_query($statement);
    if (mysql_num_rows($results) != 0) {
        $row = mysql_fetch_array($results);
        $floor_num = $row["rank"];
        return $floor_num;
    }

    return -1;
}

function get_floor_num_2($username, $bid, $tid) {
    dbconnect();
    mysql_select_db("capubbs");

    $username = mysql_real_escape_string($username);
    $statement = "
        select author, rank from (select author as author, @r:=@r+1 as rank from posts, (select @r := 0) r where bid=$bid and tid=$tid order by replytime) ranks where author='$username'";
    $results = mysql_query($statement);
    if (mysql_num_rows($results) != 0) {
        $row = mysql_fetch_array($results);
        $floor_num = $row["rank"];
        return $floor_num;
    }

    return -1;
}