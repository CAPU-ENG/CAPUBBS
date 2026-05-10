<?php
require_once "../../lib/mainfunc.php";
require_once "activityService.php";
require_once '../../../lib.php';

$GLOBALS['validtime']=1800;
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo json_encode(array("code"=> -1,"msg"=> "error"));
    exit();
}

$con = dbconnect_mysqli();
mysqli_select_db($con, "capubbs");

if (!isset($_POST["data"]) || !is_array($_POST["data"])) {
    echo json_encode(array("code"=> -1,"msg"=> "invalid request"));
    exit();
}

$user = getuser();
$username = $user['username'];
$data = $_POST["data"];
if (!isset($data["bid"], $data["tid"], $data["action"])) {
    echo json_encode(array("code"=> -1,"msg"=> "missing parameters"));
    exit();
}
$bid = $data["bid"];
$tid = $data["tid"];
$title = isset($data["title"]) ? $data["title"] : '';
$action = $data["action"];
$option_values = isset($data["option_values"]) ? $data["option_values"] : array();
$sig = isset($option_values["sign"]) ? $option_values["sign"] : 0;


$activity = getActivity($bid, $tid);
$activity_id = $activity["activity_id"];
if (empty($activity)) {
    echo json_encode(array("code"=> -1,"msg"=> "activity not found"));
    exit();
}
$statement="select locked,author,title from threads where bid=$bid && tid=$tid";
$results=mysqli_query($con, $statement);
if (mysqli_num_rows($results)==0) {
    echo json_encode(array("code"=> -1,"msg"=> "主题不存在"));
    exit;
}
$res=mysqli_fetch_array($results);
$locked=intval($res[0]);
$tidauthor=$res[1];
$tidtitle=$res[2];

if ($locked==1) {
    echo json_encode(array("code"=> -1,"msg"=> "主题已锁定"));
    exit;
}

if ($action == "join") {
    $ret = join_activity_by_content($bid, $tid, $username, $option_values, $title, $sig);
    if (!$ret) {
        echo json_encode(array("code"=> -1,"msg"=> "error"));
    } else {
        echo json_encode($ret);
    }
    exit();
} else if ($action == "modify") {
    $ret = modify_join_activity_by_content($bid, $tid, $username, $option_values, $title, $sig);
    if (!$ret) {
        echo json_encode(array("code"=> -1,"msg"=> "error"));
    } else {
        echo json_encode($ret);
    }
    exit();
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
    
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    // season_activity_join
    {
        $username = mysqli_real_escape_string($con, $username);
        $statement = "select join_id, post_fid from season_activity_join where activity_id=$activity_id and username='$username'";
        $result = mysqli_query($con, $statement);
        $row = mysqli_fetch_array($result);
        $join_id = $row["join_id"];
        $post_fid = $row["post_fid"];

        $cancel_num = ($cancel) ? 1 : 0 ;
        $statement = "update season_activity_join set cancel=$cancel_num where (activity_id=$activity_id and username='$username')";
        mysqli_query($con, $statement);
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
            if ($option["hiden"] == 1) {
                $text = $text."已隐藏";
            } else if (!is_null($option_values[$option_id])) {
                $value = $option_values[$option_id];
                
                switch ($option["type_id"]) {
                    case 1:
                        $value = intval($value);
                        $statement = "select case_name from season_option_case where case_id=$value";
                        $result = mysqli_query($con, $statement);
                        $row = mysqli_fetch_array($result);
                        $real_value = $row["case_name"];
                        $text = $text.htmlspecialchars($real_value);
                        break;
                    case 3:
                        $case_ids = explode(",", $value);
                        $names = array();
                        foreach ($case_ids as $cid) {
                            foreach ($option["cases"] as $c) {
                                if ($c["case_id"] == intval($cid)) {
                                    $names[] = $c["case_name"];
                                    break;
                                }
                            }
                        }
                        $real_value = implode("、", $names);
                        $text = $text.htmlspecialchars($real_value);
                        break;
                    case 6:
                        $text = $text.htmlspecialchars($value);
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
        $results=mysqli_query($con, $statement);
        $res=mysqli_fetch_array($results);
        if ($res[0] != $username) {
            return array("code"=> -1,"msg"=> "user error");    
        }
        $statement="select locked,author,title from threads where bid=$bid && tid=$tid";
        $results=mysqli_query($con, $statement);
        if (mysqli_num_rows($results)==0) {
            return array("code"=> -1,"msg"=> "主题不存在！");
        }
        $res=mysqli_fetch_array($results);
        $locked=intval($res[0]);
        $tidauthor=$res[1];
        $tidtitle=$res[2];

        if ($locked==1) {
            return array("code"=> -1,"msg"=> "主题已锁定。");
        }
        $title=html_entity_decode($title);
        // $text=html_entity_decode($text);
        $title=mysqli_real_escape_string($con, $title);
        $text=mysqli_real_escape_string($con, $text);
        $type=@$_REQUEST['type'];

        $statement = "select pid from posts where fid=$post_fid";
        $results=mysqli_query($con, $statement);
        $row=mysqli_fetch_array($results);
        $pid = $row["pid"];

        $text=search_replace_exec_at_2($con,$text,$bid,$tid,$pid,$username,$title);
	    $ip = $_SERVER["REMOTE_ADDR"];

        $type=@$_REQUEST['type'];
        $sig=intval(@$_REQUEST['sig']);
        // $statement="update posts set title='$title', author='$username', text='$text', ishtml='YES', sig=$sig, ip='$ip', type='$type', updatetime=$time where bid=$bid && tid=$tid && pid=$pid";
        $statement="update posts set author='$username', text='$text', ishtml='YES', sig=$sig, ip='$ip', type='$type', updatetime=$time where bid=$bid && tid=$tid && pid=$pid";
        mysqli_query($con, $statement);
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
        if ($required == 1 && (is_null($option_values[$option_id]) || $option_values[$option_id] === "")) {
            return array("code"=> -1,"msg"=> "option(#".$option_id.") not found");
        }
    }
    
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    // season_activity_join
    {
        $username = mysqli_real_escape_string($con, $username);
        $statement = "select join_id, post_fid from season_activity_join where activity_id=$activity_id and username='$username'";
        $result = mysqli_query($con, $statement);
        $row = mysqli_fetch_array($result);
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
                $value = mysqli_real_escape_string($con, $value);
                // UPDATE `capubbs`.`season_join_option_value` SET `value` = '1123123' WHERE (`id` = '3');

                $statement = "update season_join_option_value set value = '$value'
                    where (join_id = $join_id and option_id = $option_id)";
                mysqli_query($con, $statement);
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
            if ($option["hiden"] == 1) {
                $text = $text."已隐藏";
            } else if (!is_null($option_values[$option_id])) {
                $value = $option_values[$option_id];
                
                switch ($option["type_id"]) {
                    case 1:
                        $value = intval($value);
                        $statement = "select case_name from season_option_case where case_id=$value";
                        $result = mysqli_query($con, $statement);
                        $row = mysqli_fetch_array($result);
                        $real_value = $row["case_name"];
                        $text = $text.htmlspecialchars($real_value);
                        break;
                    case 3:
                        $case_ids = explode(",", $value);
                        $names = array();
                        foreach ($case_ids as $cid) {
                            foreach ($option["cases"] as $c) {
                                if ($c["case_id"] == intval($cid)) {
                                    $names[] = $c["case_name"];
                                    break;
                                }
                            }
                        }
                        $real_value = implode("、", $names);
                        $text = $text.htmlspecialchars($real_value);
                        break;
                    case 6:
                        $text = $text.htmlspecialchars($value);
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
        $results=mysqli_query($con, $statement);
        $res=mysqli_fetch_array($results);
        if ($res[0] != $username) {
            return array("code"=> -1,"msg"=> "user error");    
        }
        $statement="select locked,author,title from threads where bid=$bid && tid=$tid";
        $results=mysqli_query($con, $statement);
        if (mysqli_num_rows($results)==0) {
            return array("code"=> -1,"msg"=> "主题不存在！");
        }
        $res=mysqli_fetch_array($results);
        $locked=intval($res[0]);
        $tidauthor=$res[1];
        $tidtitle=$res[2];

        if ($locked==1) {
            return array("code"=> -1,"msg"=> "主题已锁定。");
        }
        $title=html_entity_decode($title);
        // $text=html_entity_decode($text);
        $title=mysqli_real_escape_string($con, $title);
        $text=mysqli_real_escape_string($con, $text);
        $type=@$_REQUEST['type'];

        $statement = "select pid from posts where fid=$post_fid";
        $results=mysqli_query($con, $statement);
        $row=mysqli_fetch_array($results);
        $pid = $row["pid"];

        $text=search_replace_exec_at_2($con,$text,$bid,$tid,$pid,$username,$title);
	    $ip = $_SERVER["REMOTE_ADDR"];

        $type=@$_REQUEST['type'];
        $statement="update posts set title='$title', author='$username', text='$text', ishtml='YES', sig=$sig, ip='$ip', type='$type', updatetime=$time where bid=$bid && tid=$tid && pid=$pid";
        mysqli_query($con, $statement);
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

    
    $filePath = "/tmp/capu_log";
    $log_data = "$username $bid $tid\n";
    $log_data = $log_data.implode(",", $option_values)."\n";
    $log_data = $log_data.json_encode($option_values)."\n";
    file_put_contents($filePath, $log_data, FILE_APPEND);

    // season_activity_join
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");

    $username = mysqli_real_escape_string($con, $username);

    @$token=$_COOKIE['token'];
    $time = time();
    $statement="select username,star,rights,lastpost from userinfo where token='$token' && $time-tokentime<={$GLOBALS['validtime']}";
    $results=mysqli_query($con, $statement);
    $res=mysqli_fetch_array($results);
    if ($res[0] != $username) {
        file_put_contents($filePath, "[13] $username $bid $tid\n", FILE_APPEND);
        return array("code"=> -1,"msg"=> "user error 13 "." ".$res[0]." ".$username);
    }
    file_put_contents($filePath, "[0] $username $bid $tid\n", FILE_APPEND);

    $statement = "insert into season_activity_join (activity_id, username, post_fid) values
        ($activity_id, '$username', -1)";
    $result = mysqli_query($con, $statement);
    if (!$result) {
        file_put_contents($filePath, "[1] $username $bid $tid\n", FILE_APPEND);
        return array("code"=> -1,"msg"=> "已报名或报名失败");
    }
    $join_id = mysqli_insert_id($con);

    $options = $activity["options"];
    for ($option_idx = 0; $option_idx < count($options); $option_idx++) {
        $option = $options[$option_idx];
        $option_id = $option["option_id"];
        $required = $option["required"];
        if ($required == 1 && (is_null($option_values[$option_id]) || $option_values[$option_id] === "")) {
            file_put_contents($filePath, "[2] $username $bid $tid\n", FILE_APPEND);
            return array("code"=> -1,"msg"=> "option(#".$option_id.") not found");
        }
    }

    file_put_contents($filePath, "[3] $username $bid $tid\n", FILE_APPEND);
    
    $con = dbconnect_mysqli();
    mysqli_select_db($con, "capubbs");
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
            if ($option["hiden"] == 1) {
                $text = $text."已隐藏";
            } else if (!is_null($option_values[$option_id])) {
                $value = $option_values[$option_id];
                
                switch ($option["type_id"]) {
                    case 1:
                        $value = intval($value);
                        $statement = "select case_name from season_option_case where case_id=$value";
                        $result = mysqli_query($con, $statement);
                        $row = mysqli_fetch_array($result);
                        $real_value = $row["case_name"];
                        $text = $text.htmlspecialchars($real_value);
                        break;
                    case 3:
                        $case_ids = explode(",", $value);
                        $names = array();
                        foreach ($case_ids as $cid) {
                            foreach ($option["cases"] as $c) {
                                if ($c["case_id"] == intval($cid)) {
                                    $names[] = $c["case_name"];
                                    break;
                                }
                            }
                        }
                        $real_value = implode("、", $names);
                        $text = $text.htmlspecialchars($real_value);
                        break;
                    case 6:
                        $text = $text.htmlspecialchars($value);
                        break;
                }
            } else {
                $text = $text."未知";
            }
            $text = $text."</div>";
        }
        file_put_contents($filePath, "[4] $username $bid $tid\n", FILE_APPEND);


        file_put_contents($filePath, "[5] $username $bid $tid\n", FILE_APPEND);
        
        $statement="select pid from posts where bid=$bid && tid=$tid order by pid desc";
        $results=mysqli_query($con, $statement);
        if (mysqli_num_rows($results)==0) {
            file_put_contents($filePath, "[14] $username $bid $tid\n", FILE_APPEND);
            return array("code"=> -1,"msg"=> "主题不存在！");
        }
        $res=mysqli_fetch_array($results);
        $pid=intval($res[0])+1;
        file_put_contents($filePath, "[6] $username $bid $tid\n", FILE_APPEND);
        $statement="select locked,author,title from threads where bid=$bid && tid=$tid";
        $results=mysqli_query($con, $statement);
        if (mysqli_num_rows($results)==0) {
            file_put_contents($filePath, "[15] $username $bid $tid\n", FILE_APPEND);
            return array("code"=> -1,"msg"=> "主题不存在！");
        }
        $res=mysqli_fetch_array($results);
        $locked=intval($res[0]);
        $tidauthor=$res[1];
        $tidtitle=$res[2];
        file_put_contents($filePath, "[7] $username $bid $tid\n", FILE_APPEND);

        if ($locked==1) {
            file_put_contents($filePath, "[16] $username $bid $tid\n", FILE_APPEND);
            return array("code"=> -1,"msg"=> "主题已锁定。");
        }
        $title=html_entity_decode($title);
        // $text=html_entity_decode($text);
        $title=mysqli_real_escape_string($con, $title);
        $type=@$_REQUEST['type'];
        $text=mysqli_real_escape_string($con, $text);

        file_put_contents($filePath, "[8] $username $bid $tid\n", FILE_APPEND);
        $text=search_replace_exec_at_2($con,$text,$bid,$tid,$pid,$username,$title);
        $attachs = "";
	    $ip = $_SERVER["REMOTE_ADDR"];
        $statement="insert into posts (bid,tid,pid,title,author,text,ishtml,attachs,replytime,updatetime,sig,ip,type,lzl) values ($bid,$tid,$pid,'$title','$username','$text','YES','$attachs',$time,$time,$sig,'$ip','$type',0)";
        mysqli_query($con, $statement);
        if(mysqli_error($con)){
            return array("code"=> -1,"msg"=> ">error:".mysqli_error($con));
        }
        $fid = mysqli_insert_id($con);

        file_put_contents($filePath, "[9] $username $bid $tid\n", FILE_APPEND);
        $statement="update threads set reply=reply+1, replyer='$username', timestamp=$time where bid=$bid && tid=$tid";
        mysqli_query($con, $statement);
        if ($bid!=4)
            $statement="update userinfo set reply=reply+1, lastpost=$time, tokentime=$time where username='$username'";
        else
            $statement="update userinfo set water=water+1, lastpost=$time, tokentime=$time where username='$username'";
        mysqli_query($con, $statement);
        updatestar($con,$username);
        if($tidauthor!=$username)
            insertmsg($con,"system", $tidauthor,"reply",$bid, $tid, $pid,$username,$tidtitle);
        file_put_contents($filePath, "[10] $username $bid $tid\n", FILE_APPEND);

    }

    // season_activity_join
    $username = mysqli_real_escape_string($con, $username);
    $statement = "update season_activity_join set post_fid=$fid where join_id=$join_id";
    mysqli_query($con, $statement);

    // season_join_option_value
    {
        file_put_contents($filePath, "[11] $username $bid $tid\n", FILE_APPEND);

        for ($option_idx = 0; $option_idx < count($options); $option_idx++) {
            $option = $options[$option_idx];
            $option_id = $option["option_id"];
            $required = $option["required"];
            if (!is_null($option_values[$option_id])) {
                $value = $option_values[$option_id];
                $value = mysqli_real_escape_string($con, $value);
                
                $statement = "insert into season_join_option_value (join_id, option_id, value) values
                    ($join_id, $option_id, '$value')";
                mysqli_query($con, $statement);
            }
        }
    }

    $ret["code"] = 0;
    $ret["msg"] = "success";
    file_put_contents($filePath, "[12] $username $bid $tid\n", FILE_APPEND);

    return $ret;
}

function insertmsg($con,$from,$to,$text,$bid,$tid,$pid,$ruser,$rmsg) {
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