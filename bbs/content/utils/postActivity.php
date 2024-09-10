<?php
require_once "../../lib/mainfunc.php";
require_once "activityService.php";
require_once '../../../lib.php';

$GLOBALS['validtime']=1800;
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo json_encode(array("code"=> -1,"msg"=> "error"));
    exit();
}

$user = getuser();
$username = $user['username'];
$data = $_POST["data"];
$bid = $data["bid"];
$tid = $data["tid"];
$activity_id = $data["activity_id"];
$title = $data["title"];
$action = $data["action"];
$option_values = $data["option_values"];
$sig = $option_values["sign"];

if ($action == "join") {
    $ret = join_activity_by_content($bid, $tid, $username, $option_values, $title, $sig);
    if (!$ret) {
        echo json_encode(array("code"=> -1,"msg"=> "error"));
    } else {
        echo json_encode($ret);
    }
    exit();
} else if ($action == "modify") {
    // $option_values = getUsernameOptionValue($username, $activity_id);
    $ret = modify_join_activity_by_content($bid, $tid, $username, $option_values, $title, $sig);
    if (!$ret) {
        echo json_encode(array("code"=> -1,"msg"=> "error"));
    } else {
        echo json_encode($ret);
    }
    exit();

    // $ret["code"] = 0;
    // $ret["msg"] = "success";
    // $ret["option_values"] = $option_values;
    // // $ret["activity"] = $activity;
    // echo json_encode($ret);
} else if ($action == "cancel") {
    $option_values = getUsernameOptionValue($username, $activity_id);
    $ret = cancel_join_activity_by_content($bid, $tid, $username, $option_values, $title, true);
    if (!$ret) {
        echo json_encode(array("code"=> -1,"msg"=> "error"));
    } else {
        echo json_encode($ret);
    }
    exit();
} else if ($action == "restore") {
    $option_values = getUsernameOptionValue($username, $activity_id);
    $ret = cancel_join_activity_by_content($bid, $tid, $username, $option_values, $title, false);
    if (!$ret) {
        echo json_encode(array("code"=> -1,"msg"=> "error"));
    } else {
        echo json_encode($ret);
    }
    exit();
}

function cancel_join_activity_by_content($bid, $tid, $username, $option_values, $title, $cancel) {
    if (empty($bid) || empty($tid) || empty($username) || empty($option_values)) {
        return array("code"=> -1,"msg"=> "param empty");    
    }
    $activity = getActivity($bid, $tid);
    $activity_id = $activity["activity_id"];
    if (empty($activity)) {
        return array("code"=> -1,"msg"=> "activity not found");
    }

    if (!get_joint($username, $activity_id)) {
        return array("code"=> -1,"msg"=> "未报名");
    }

    $options = $activity["options"];
    
    dbconnect();
    mysql_select_db("capubbs");
    $con = null;

    // season_activity_join
    {
        $username = mysql_real_escape_string($username);
        $statement = "select join_id, post_fid from season_activity_join where activity_id=$activity_id and username='$username'";
        $result = mysql_query($statement);
        $row = mysql_fetch_array($result);
        $join_id = $row["join_id"];
        $post_fid = $row["post_fid"];

        $cancel_num = ($cancel) ? 1 : 0 ;
        $statement = "update season_activity_join set cancel=$cancel_num where (activity_id=$activity_id and username='$username')";
        mysql_query($statement);
    }

    // posts
    {
        $text = "";
        for ($option_idx = 0; $option_idx < count($options); $option_idx++) {
            $text = $text."<div>";
            $option = $options[$option_idx];
            $option_id = $option["option_id"];
            $option_name = $option["option_name"];
            $type_id = $option["type_id"];
            $required = $option["required"];
            $text = $text.$option_name."：";
            if (!is_null($option_values[$option_id])) {
                $value = $option_values[$option_id];
                
                switch ($option["type_id"]) {
                    case 1:
                        $text = $text.$value;
                        break;
                    case 6:
                        $text = $text.$value;
                        break;
                }
            } else {
                $text = $text."未知";
            }
            $text = $text."</div>";
        }
        if ($cancel) {
            $text = "<strike>".$text."</strike>";
        }

	    @$token=$_COOKIE['token'];
        $time = time();
        $statement="select username,star,rights,lastpost from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        $res=mysql_fetch_array($results);
        if ($res[0] != $username) {
            return array("code"=> -1,"msg"=> "user error");    
        }
        $statement="select locked,author,title from threads where bid=$bid && tid=$tid";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            return array("code"=> -1,"msg"=> "主题不存在！");
        }
        $res=mysql_fetch_array($results);
        $locked=intval($res[0]);
        $tidauthor=$res[1];
        $tidtitle=$res[2];

        if ($locked==1) {
            return array("code"=> -1,"msg"=> "主题已锁定。");
        }
        $replytime=date('Y-m-d H:i:s');
        $title=html_entity_decode($title);
        $text=html_entity_decode($text);
        $title=mysql_real_escape_string($title);
        $text=mysql_real_escape_string($text);
        $type=@$_REQUEST['type'];

        $statement = "select pid from posts where fid=$post_fid";
        $results=mysql_query($statement);
        $row=mysql_fetch_array($results);
        $pid = $row["pid"];

        $text=search_replace_exec_at_2($con,$text,$bid,$tid,$pid,$username,$title);
        $attachs = "";
	    $ip = $_SERVER["REMOTE_ADDR"];

        $type=$_REQUEST['type'];
        $sig=intval(@$_REQUEST['sig']);
        $statement="update posts set title='$title', author='$username', text='$text', ishtml='YES', sig=$sig, ip='$ip', type='$type', attachs='$attachs', updatetime=$time where bid=$bid && tid=$tid && pid=$pid";
        mysql_query($statement);

        $statement="select pid from posts where bid=$bid && tid=$tid order by pid desc";
        $res=mysql_query($statement);
        $number=mysql_num_rows($res);
        if (intval($pid)==intval($number)) {
            $statement="update threads set replyer='$username' where bid=$bid && pid=$pid";
            mysql_query($statement);
        }
    }

    $ret["code"] = 0;
    $ret["msg"] = "success";
    // $ret["debug"] = $debug;
    // $ret["post"] = $_POST;
    // $ret["activity"] = $activity;
    return $ret;
}

function modify_join_activity_by_content($bid, $tid, $username, $option_values, $title, $sig) {
    if (empty($bid) || empty($tid) || empty($username) || empty($option_values)) {
        return array("code"=> -1,"msg"=> "param empty");    
    }
    $activity = getActivity($bid, $tid);
    $activity_id = $activity["activity_id"];
    if (empty($activity)) {
        return array("code"=> -1,"msg"=> "activity not found");
    }

    if (!get_joint($username, $activity_id)) {
        return array("code"=> -1,"msg"=> "未报名");
    }

    $options = $activity["options"];
    for ($option_idx = 0; $option_idx < count($options); $option_idx++) {
        $option = $options[$option_idx];
        $option_id = $option["option_id"];
        $required = $option["required"];
        if ($required == 1 && is_null($option_values[$option_id])) {
            return array("code"=> -1,"msg"=> "option(#".$option_id.") not found");
        }
    }
    
    dbconnect();
    mysql_select_db("capubbs");
    $con = null;

    // season_activity_join
    {
        $username = mysql_real_escape_string($username);
        $statement = "select join_id, post_fid from season_activity_join where activity_id=$activity_id and username='$username'";
        $result = mysql_query($statement);
        $row = mysql_fetch_array($result);
        $join_id = $row["join_id"];
        $post_fid = $row["post_fid"];
    }

    // season_join_option_value
    {
        for ($option_idx = 0; $option_idx < count($options); $option_idx++) {
            $option = $options[$option_idx];
            $option_id = $option["option_id"];
            $required = $option["required"];
            if (!is_null($option_values[$option_id])) {
                $value = $option_values[$option_id];
                $value = mysql_real_escape_string($value);
                // UPDATE `capubbs`.`season_join_option_value` SET `value` = '1123123' WHERE (`id` = '3');

                $statement = "update season_join_option_value set value = '$value'
                    where (join_id = $join_id and option_id = $option_id)";
                mysql_query($statement);
            }
        }
    }

    // posts
    {
        $text = "";
        for ($option_idx = 0; $option_idx < count($options); $option_idx++) {
            $text = $text."<div>";
            $option = $options[$option_idx];
            $option_id = $option["option_id"];
            $option_name = $option["option_name"];
            $type_id = $option["type_id"];
            $required = $option["required"];
            $text = $text.$option_name."：";
            if (!is_null($option_values[$option_id])) {
                $value = $option_values[$option_id];
                
                switch ($option["type_id"]) {
                    case 1:
                        $text = $text.$value;
                        break;
                    case 6:
                        $text = $text.$value;
                        break;
                }
            } else {
                $text = $text."未知";
            }
            $text = $text."</div>";
        }

	    @$token=$_COOKIE['token'];
        $time = time();
        $statement="select username,star,rights,lastpost from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        $res=mysql_fetch_array($results);
        if ($res[0] != $username) {
            return array("code"=> -1,"msg"=> "user error");    
        }
        $statement="select locked,author,title from threads where bid=$bid && tid=$tid";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            return array("code"=> -1,"msg"=> "主题不存在！");
        }
        $res=mysql_fetch_array($results);
        $locked=intval($res[0]);
        $tidauthor=$res[1];
        $tidtitle=$res[2];

        if ($locked==1) {
            return array("code"=> -1,"msg"=> "主题已锁定。");
        }
        $replytime=date('Y-m-d H:i:s');
        $title=html_entity_decode($title);
        $text=html_entity_decode($text);
        $title=mysql_real_escape_string($title);
        $text=mysql_real_escape_string($text);
        $type=@$_REQUEST['type'];

        $statement = "select pid from posts where fid=$post_fid";
        $results=mysql_query($statement);
        $row=mysql_fetch_array($results);
        $pid = $row["pid"];

        $text=search_replace_exec_at_2($con,$text,$bid,$tid,$pid,$username,$title);
        $attachs = "";
	    $ip = $_SERVER["REMOTE_ADDR"];

        $type=$_REQUEST['type'];
        $statement="update posts set title='$title', author='$username', text='$text', ishtml='YES', sig=$sig, ip='$ip', type='$type', attachs='$attachs', updatetime=$time where bid=$bid && tid=$tid && pid=$pid";
        mysql_query($statement);

        $statement="select pid from posts where bid=$bid && tid=$tid order by pid desc";
        $res=mysql_query($statement);
        $number=mysql_num_rows($res);
        if (intval($pid)==intval($number)) {
            $statement="update threads set replyer='$username' where bid=$bid && pid=$pid";
            mysql_query($statement);
        }
    }

    $ret["code"] = 0;
    $ret["msg"] = "success";
    // $ret["debug"] = $debug;
    // $ret["post"] = $_POST;
    // $ret["activity"] = $activity;
    return $ret;
}

function join_activity_by_content($bid, $tid, $username, $option_values, $title, $sig) {
    if (empty($bid) || empty($tid) || empty($username) || empty($option_values)) {
        return array("code"=> -1,"msg"=> "param empty");    
    }
    $activity = getActivity($bid, $tid);
    $activity_id = $activity["activity_id"];
    if (empty($activity)) {
        return array("code"=> -1,"msg"=> "activity not found");
    }

    if (get_joint($username, $activity_id)) {
        return array("code"=> -1,"msg"=> "已报名");
    }

    $options = $activity["options"];
    for ($option_idx = 0; $option_idx < count($options); $option_idx++) {
        $option = $options[$option_idx];
        $option_id = $option["option_id"];
        $required = $option["required"];
        if ($required == 1 && is_null($option_values[$option_id])) {
            return array("code"=> -1,"msg"=> "option(#".$option_id.") not found");
        }
    }

    
    dbconnect();
    mysql_select_db("capubbs");
    $con = null;
    // posts
    {
        $text = "";
        for ($option_idx = 0; $option_idx < count($options); $option_idx++) {
            $text = $text."<div>";
            $option = $options[$option_idx];
            $option_id = $option["option_id"];
            $option_name = $option["option_name"];
            $type_id = $option["type_id"];
            $required = $option["required"];
            $text = $text.$option_name."：";
            if (!is_null($option_values[$option_id])) {
                $value = $option_values[$option_id];
                
                switch ($option["type_id"]) {
                    case 1:
                        $text = $text.$value;
                        break;
                    case 6:
                        $text = $text.$value;
                        break;
                }
            } else {
                $text = $text."未知";
            }
            $text = $text."</div>";
        }

	    @$token=$_COOKIE['token'];
        $time = time();
        $statement="select username,star,rights,lastpost from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
        $results=mysql_query($statement);
        $res=mysql_fetch_array($results);
        if ($res[0] != $username) {
            return array("code"=> -1,"msg"=> "user error");    
        }
        $statement="select pid from posts where bid=$bid && tid=$tid order by pid desc";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            return array("code"=> -1,"msg"=> "主题不存在！");
        }
        $res=mysql_fetch_array($results);
        $pid=intval($res[0])+1;
        $statement="select locked,author,title from threads where bid=$bid && tid=$tid";
        $results=mysql_query($statement);
        if (mysql_num_rows($results)==0) {
            return array("code"=> -1,"msg"=> "主题不存在！");
        }
        $res=mysql_fetch_array($results);
        $locked=intval($res[0]);
        $tidauthor=$res[1];
        $tidtitle=$res[2];

        if ($locked==1) {
            return array("code"=> -1,"msg"=> "主题已锁定。");
        }
        $replytime=date('Y-m-d H:i:s');
        $title=html_entity_decode($title);
        $text=html_entity_decode($text);
        $title=mysql_real_escape_string($title);
        $type=@$_REQUEST['type'];
        $text=mysql_real_escape_string($text);

        $text=search_replace_exec_at_2($con,$text,$bid,$tid,$pid,$username,$title);
        $attachs = "";
	    $ip = $_SERVER["REMOTE_ADDR"];
        $statement="insert into posts (bid,tid,pid,title,author,text,ishtml,attachs,replytime,updatetime,sig,ip,type,lzl) values ($bid,$tid,$pid,'$title','$username','$text','YES','$attachs',$time,$time,$sig,'$ip','$type',0)";
        mysql_query($statement);
        if(mysql_error()){
            return array("code"=> -1,"msg"=> ">error:".mysql_error());
        }
        $fid = mysql_insert_id();
        // if($attachs){
        //     $statement="update attachments set ref=ref+1 where id in (".join(",",explode(" ", $attachs)).")";
        //     mysql_query($statement);
        // }
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
    }

    // season_activity_join
    {
        $username = mysql_real_escape_string($username);
        $statement = "insert into season_activity_join (activity_id, username, post_fid) values
            ($activity_id, '$username', $fid)";
        mysql_query($statement);
        $join_id = mysql_insert_id();
    }

    // season_join_option_value
    {
        for ($option_idx = 0; $option_idx < count($options); $option_idx++) {
            $option = $options[$option_idx];
            $option_id = $option["option_id"];
            $required = $option["required"];
            if (!is_null($option_values[$option_id])) {
                $value = $option_values[$option_id];
                $value = mysql_real_escape_string($value);
                
                $statement = "insert into season_join_option_value (join_id, option_id, value) values
                    ($join_id, $option_id, '$value')";
                mysql_query($statement);
            }
        }
    }

    $ret["code"] = 0;
    $ret["msg"] = "success";
    // $ret["post"] = $_POST;
    // $ret["activity"] = $activity;
    return $ret;
}

function insertmsg($con,$from,$to,$text,$bid,$tid,$pid,$ruser,$rmsg) {
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