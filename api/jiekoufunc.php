<?php
/**
 * jiekoufunc.php — Direct-callable business functions for CAPUBBS.
 *
 * Replaces the HTTP cURL → XML → parse roundtrip of jiekouapi.php with
 * direct PHP function calls that return arrays.  Each returned array
 * corresponds to the <info> blocks that callers (mainfunc, request) expect.
 *
 * PHP 5.6 & PHP 8 compatible.  MySQL 5.7 / 8.0 / 9.0+ compatible.
 */

require_once __DIR__.'/../lib.php';
require_once __DIR__.'/lib/helpers.php';
require_once __DIR__.'/lib/db.php';
require_once __DIR__.'/lib/Mailer.php';
require_once __DIR__.'/lib/ApiError.php';
require_once __DIR__.'/../src/Bootstrap.php';

$GLOBALS['validtime'] = 60 * 60 * 24 * 7;   // 7 days
$GLOBALS['attachroot'] = __DIR__ . "/../bbs/attachment/";
$GLOBALS['_jiekoufunc_nowuser'] = null;

// ============================================================================
//  Utility functions
// ============================================================================

/**
 * 验证 bid 是否存在于 boardinfo 表中。
 * 使用静态缓存避免同一请求中重复查询数据库。
 *
 * @param mysqli $con  数据库连接
 * @param int   $bid  版块 ID
 * @return bool        true = 存在于 boardinfo（或 bid <= 0 为特殊值放行）
 */
function jiekoufunc_is_valid_bid($con, $bid) {
    $bid = intval($bid);
    if ($bid <= 0) return true;  // bid=0（全部版块）和 bid=-1（搜索全站）是特殊值
    static $valid_bids = null;
    if ($valid_bids === null) {
        $valid_bids = array();
        $result = mysqli_query($con, "select bid from boardinfo where bid!=0");
        while ($row = mysqli_fetch_row($result)) {
            $valid_bids[intval($row[0])] = true;
        }
    }
    return isset($valid_bids[$bid]);
}

// ============================================================================
//  Business functions — Read-only
// ============================================================================

function jiekoufunc_bbsinfo($con, $bid, $name) {
    $askforall = 1;
    if ($bid != 0) {
        $askforall = 0;
        $statement = "select * from boardinfo where bid=$bid";
    } else {
        $statement = "select * from boardinfo where bid!=0 order by bid";
    }
    $results = mysqli_query($con, $statement);
    $infos = array();
    while ($res = mysqli_fetch_array($results)) {
        $info = array();
        foreach ($res as $key => $value) {
            if (is_long($key)) continue;
            if ($key == "key" || $key == "msg") continue;
            if ($key == "bid") $bid = $value;
            $info[$key] = $value;
        }
        if ($askforall == 0) {
            $date = date("Y-m-d");
            $time1 = strtotime("$date 00:00:00");
            $time2 = strtotime("$date 23:59:59");
            $statement = "select
                (select count(*) from threads where bid=$bid) as topics,
                (select count(*) from threads where bid=$bid && extr=1) as extr,
                (select count(*) from threads where bid=$bid && postdate='$date') as newpost,
                (select count(*) from posts where bid=$bid && replytime>=$time1 && replytime<=$time2) as newreply";
            $resultt = mysqli_query($con, $statement);
            $counts = mysqli_fetch_row($resultt);
            $info['topics'] = $counts[0];
            $info['extr'] = $counts[1];
            $info['newpost'] = $counts[2];
            $info['newreply'] = $counts[3];
        }
        $infos[] = $info;
    }
    return $infos;
}

function jiekoufunc_getuser($con, $token) {
    return capubbs_user_service($con)->legacyGetUser($token);
}

function jiekoufunc_userexists($con, $params) {
    $user_raw = isset($params['user']) ? $params['user'] : '';
    if (strstr($user_raw, "'") != "") {
        return array(array('code' => '2'));
    }
    $user = mysqli_real_escape_string($con, $user_raw);
    $statement = "select * from userinfo where username='$user' limit 1";
    if (mysqli_num_rows(mysqli_query($con, $statement)) == 0) {
        return array(array('code' => '0'));
    } else {
        return array(array('code' => '1'));
    }
}

function jiekoufunc_user_profile($con, $params) {
    return capubbs_user_service($con)->legacyUserProfile($params);
}

function jiekoufunc_hot($con, $token, $params) {
    $hotnum = 10;
    if (isset($params['hotnum']) && $params['hotnum'])
        $hotnum = $params['hotnum'];
    $time = time();
    $infos = array();

    $statement = "select username from userinfo where token='$token' && $time<=tokentime+{$GLOBALS['validtime']}";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) {
        $infos[] = array('nowuser' => '');
    } else {
        $res = mysqli_fetch_array($results);
        $infos[] = array('nowuser' => $res[0]);
    }

    $results = mysqli_query($con, "
        select threads.bid,threads.tid,title,author,replyer,click,reply,extr,top,locked,timestamp,postdate,
        case
            when thread_global_top.bid is null then 0
            else 1
        end as global_top
        from threads left join thread_global_top on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid
        where thread_global_top.bid is null
        order by timestamp desc
        limit 0,$hotnum");
    while ($res = mysqli_fetch_array($results)) {
        $info = array();
        foreach ($res as $key => $value) {
            if (is_long($key)) continue;
            $info[$key] = $value;
        }
        $infos[] = $info;
    }
    return $infos;
}

function jiekoufunc_global_top($con, $token) {
    $time = time();
    $infos = array();

    $statement = "select username from userinfo where token='$token' && $time<=tokentime+{$GLOBALS['validtime']}";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) {
        $infos[] = array('nowuser' => '');
    } else {
        $res = mysqli_fetch_array($results);
        $infos[] = array('nowuser' => $res[0]);
    }

    $results = mysqli_query($con, "
        select threads.bid,threads.tid,title,author,replyer,click,reply,extr,top,locked,timestamp,postdate,
        case when thread_global_top.bid is null then 0 else 1 end as global_top
        from threads left join thread_global_top on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid
        where thread_global_top.bid is not null
        order by timestamp desc");

    while ($res = mysqli_fetch_array($results)) {
        $info = array();
        foreach ($res as $key => $value) {
            if (is_long($key)) continue;
            $info[$key] = $value;
        }
        $infos[] = $info;
    }
    return $infos;
}

function jiekoufunc_tidinfo($con, $bid, $tid) {
    return capubbs_thread_read_service($con)->legacyGetTidInfo($bid, $tid);
}

function jiekoufunc_recentpost($con, $view, $limit_raw = '') {
    return capubbs_thread_read_service($con)->legacyRecentPost($view, $limit_raw);
}

function jiekoufunc_recentreply($con, $view, $limit_raw = '') {
    return capubbs_thread_read_service($con)->legacyRecentReply($view, $limit_raw);
}

function jiekoufunc_rights($con, $bid, $token) {
    return capubbs_permission_service($con)->getLegacyRightsRow($bid, $token);
}

function jiekoufunc_getpages($con, $bid, $tid) {
    return capubbs_thread_read_service($con)->legacyGetPages($bid, $tid);
}

function jiekoufunc_getlznum($con, $bid, $tid) {
    return capubbs_thread_read_service($con)->legacyGetLzNum($bid, $tid);
}

function jiekoufunc_getnum($con) {
    $time = time();
    $year = date("Y", $time);
    $month = date("m", $time);
    $day = date("d", $time);

    $statement = "select * from sign where year=$year && month=$month && day=$day order by hour, minute, second";
    $results = mysqli_query($con, $statement);
    $sign_num = mysqli_num_rows($results);

    $statement = "select username from userinfo where $time<=tokentime+600";
    $result = mysqli_query($con, $statement);
    $online_num = mysqli_num_rows($result);

    $statement = "select field1,field2 from mainpage where id=-2";
    $result = mysqli_query($con, $statement);
    $res = mysqli_fetch_row($result);
    $maxnum = intval($res[0]);
    $thattime = intval($res[1]);

    if ($online_num > $maxnum) {
        $maxnum = $online_num;
        $thattime = $time;
        $statement = "update mainpage set field1='$maxnum', field2='$thattime' where id=-2";
        mysqli_query($con, $statement);
    }

    return array(array(
        'sign' => strval($sign_num),
        'online' => strval($online_num),
        'maxnum' => strval($maxnum),
        'time' => date("Y-m-d", $thattime)
    ));
}

function jiekoufunc_sign_today($con, $params) {
    $date = isset($params['view']) ? $params['view'] : '';
    $time = strtotime($date . " 00:00:00");
    if ($time == false || $time == -1) $time = time();
    $year = date("Y", $time);
    $month = date("m", $time);
    $day = date("d", $time);
    $statement = "select username from capubbs.sign where year=$year && month=$month && day=$day order by hour, minute, second";
    $todays = mysqli_query($con, $statement);
    $infos = array();
    while (($res = mysqli_fetch_row($todays)) != null) {
        $infos[] = array('username' => $res[0]);
    }
    return $infos;
}

function jiekoufunc_sign_year($con) {
    $time = time();
    $year = date("Y", $time);
    $statement = "select * from capubbs.sign where year=$year order by month, day";
    $results = mysqli_query($con, $statement);
    $datas = array();
    while (($res = mysqli_fetch_array($results)) != null) {
        $m = intval($res['month']);
        if ($m < 10) $m = "0" . $m;
        $date = $res['year'] . "-" . $m;
        $d = intval($res['day']);
        if (!isset($datas[$date])) $datas[$date] = array();
        if (!isset($datas[$date][$d])) $datas[$date][$d] = 0;
        $datas[$date][$d] = intval($datas[$date][$d]) + 1;
    }
    $infos = array();
    foreach ($datas as $key => $value) {
        $info = array('month' => $key);
        $y = intval(substr($key, 0, 4));
        $m = intval(substr($key, 5, 2));
        $data_items = array();
        for ($i = 1; $i <= jiekoufunc_getdays($y, $m); $i++) {
            $x = 0;
            if (isset($value[$i])) $x = $value[$i];
            $data_items[] = array('day' => $i, 'number' => $x);
        }
        $info['data'] = $data_items;
        $infos[] = $info;
    }
    return $infos;
}

function jiekoufunc_sign_user($con) {
    $statement = "select username,sign from capubbs.userinfo order by sign desc,username limit 0,100";
    $results = mysqli_query($con, $statement);
    $infos = array();
    $i = 1;
    $j = 1;
    $last = 0;
    while (($res = mysqli_fetch_row($results)) != null) {
        $username = $res[0];
        $sign = intval($res[1]);
        if ($sign != $last) $j = $i;
        $infos[] = array('number' => strval($j), 'username' => $username, 'times' => strval($sign));
        $last = $sign;
        $i++;
    }
    return $infos;
}

function jiekoufunc_viewonline($con) {
    $nowtime = time();
    $statement = "select username, nowboard, tokentime, lastip, onlinetype, logininfo from userinfo where $nowtime<=tokentime+600";
    $result = mysqli_query($con, $statement);
    $infos = array();
    while ($res = mysqli_fetch_array($result)) {
        $info = array();
        foreach ($res as $key => $value) {
            if (is_long($key)) continue;
            $info[$key] = $value;
        }
        $infos[] = $info;
    }
    return $infos;
}

function jiekoufunc_attachinfo($con, $id, $token) {
    $statement = "select * from attachments where id=$id limit 1";
    $result = mysqli_query($con, $statement);
    $ainfo = mysqli_fetch_array($result);
    $user = jiekoufunc_token2user($con, $token);
    $isAuthor = false;
    if ($user) {
        $username = $user['username'];
        if ($username == $ainfo['uploader']) {
            $isAuthor = true;
        }
    }
    if ($ainfo) {
        $info = array('exist' => 'YES', 'isAuthor' => jiekoufunc_packBool($isAuthor));
        foreach ($ainfo as $key => $value) {
            if (is_long($key)) continue;
            $info[$key] = $value;
        }
        return array($info);
    } else {
        return array(array('exist' => 'NO'));
    }
}

function jiekoufunc_unusedattachinfo($con, $token) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(array('code' => '1'));
    }
    $username = $user['username'];
    $statement = "select * from attachments where uploader='$username' and ref=0";
    $result = mysqli_query($con, $statement);
    $infos = array();
    $infos[] = array('code' => '0');
    while ($ainfo = mysqli_fetch_array($result)) {
        $info = array();
        foreach ($ainfo as $key => $value) {
            if (is_long($key)) continue;
            $info[$key] = $value;
        }
        $infos[] = $info;
    }
    return $infos;
}

function jiekoufunc_searchByKeyword($con, $keyword, $token, $type, $bid, $params) {
    $keyword = mysqli_real_escape_string($con, $keyword);
    $starttime = isset($params['starttime']) ? mysqli_real_escape_string($con, $params['starttime']) : '';
    $endtime = isset($params['endtime']) ? mysqli_real_escape_string($con, $params['endtime']) : '';
    $author = isset($params['author']) ? mysqli_real_escape_string($con, $params['author']) : '';
    $start = strtotime($starttime . " 00:00:00");
    $end = strtotime($endtime . " 23:59:59");
    if ($start == false || $start == -1) {
        $start = strtotime("2001-01-01 00:00:00");
    }
    if ($end == false || $end == -1) {
        $end = time();
    }
    if ($bid == -1)
        $bid_str = "  ";
    else
        $bid_str = " bid=$bid and ";
    if ($type == "thread") {
        if ($author == "")
            $statement = "select title,bid,tid,author,replytime from posts where $bid_str replytime>=$start && replytime<=$end and pid=1 and title like '%$keyword%' order by replytime desc limit 100";
        else
            $statement = "select title,bid,tid,author,replytime from posts where $bid_str replytime>=$start && replytime<=$end and pid=1 and author='$author' and title like '%$keyword%' order by replytime desc limit 100";
    } elseif ($type == "post") {
        if ($author == "")
            $statement = "select title,bid,tid,pid,author,updatetime from posts where $bid_str updatetime>=$start && updatetime<=$end and text like '%$keyword%' order by updatetime desc limit 100";
        else
            $statement = "select title,bid,tid,pid,author,updatetime from posts where $bid_str updatetime>=$start && updatetime<=$end and author='$author' and text like '%$keyword%' order by updatetime desc limit 100";
    } else {
        return jiekoufunc_report('6', '缺少搜索类型参数（thread 或 post）');
    }
    return jiekoufunc_view_bbs_array($con, $statement);
}

function jiekoufunc_editpreview($con, $token, $bid, $tid, $pid) {
    return capubbs_post_service($con)->legacyEditPreview($token, $bid, $tid, $pid);
}

function jiekoufunc_currentUserInfo($con, $token) {
    return capubbs_user_service($con)->legacyCurrentUserInfo($token);
}

function jiekoufunc_msg($con, $token, $type, $params) {
    return capubbs_message_service($con)->legacyList($token, $type, $params);
}

// ============================================================================
//  Business functions — Authentication
// ============================================================================

function jiekoufunc_login($con, $username_raw, $password, $ip, $params) {
    return capubbs_auth_service($con)->legacyLogin($username_raw, $password, $ip, $params);
}

function jiekoufunc_auto_sign($con, $username) {
    $time = time();
    $year = date("Y", $time);
    $month = date("m", $time);
    $day = date("d", $time);
    $statement = "select * from capubbs.sign where year=$year && month=$month && day=$day && username='$username'";
    $result = mysqli_query($con, $statement);
    if (mysqli_num_rows($result) == 0) {
        $hour = date("H", $time);
        $minute = date("i", $time);
        $second = date("s", $time);
        $week = date("N", $time);
        $statement = "insert into capubbs.sign values ($year,$month,$day,$hour,$minute,$second,$week,'$username')";
        mysqli_query($con, $statement);
        $statement = "update capubbs.userinfo set sign=sign+1 where username='$username'";
        mysqli_query($con, $statement);
    }
}

function jiekoufunc_logout($con, $token, $ip) {
    return capubbs_auth_service($con)->legacyLogout($token, $ip);
}

function jiekoufunc_register($con, $ip, $params) {
    $username_raw = isset($params['username']) ? $params['username'] : '';
    if (empty(trim($username_raw))) {
        return array(array('code' => '1', 'msg' => '用户名不能为空。'));
    }
    $username = mysqli_real_escape_string($con, $username_raw);
    $statement = "select * from userinfo where username='$username'";
    if (mysqli_num_rows(mysqli_query($con, $statement)) > 0) {
        return array(array('code' => '1', 'msg' => '用户已存在。'));
    }

    $password = isset($params['password']) ? mysqli_real_escape_string($con, $params['password']) : '';
    if (isset($params['md5']) && $params['md5'] == "yes") $password = md5($password);
    $sex = isset($params['sex']) ? mysqli_real_escape_string($con, $params['sex']) : '';
    $icon = isset($params['icon']) ? mysqli_real_escape_string($con, $params['icon']) : '';
    $qq_val = isset($params['qq']) ? intval($params['qq']) : 0;
    $mail_raw = isset($params['mail']) ? $params['mail'] : '';
    $intro_raw = isset($params['intro']) ? $params['intro'] : '';
    $place_raw = isset($params['place']) ? $params['place'] : '';
    $hobby_raw = isset($params['hobby']) ? $params['hobby'] : '';
    $sig1_raw = isset($params['sig1']) ? sanitize_xml($params['sig1']) : '';
    $sig2_raw = isset($params['sig2']) ? sanitize_xml($params['sig2']) : '';
    $sig3_raw = isset($params['sig3']) ? sanitize_xml($params['sig3']) : '';
    $sig1_type_raw = isset($params['sig1_type']) ? $params['sig1_type'] : 'null';
    $sig2_type_raw = isset($params['sig2_type']) ? $params['sig2_type'] : 'null';
    $sig3_type_raw = isset($params['sig3_type']) ? $params['sig3_type'] : 'null';
    $time = time();
    $date = date("Y-m-d");
    $token = md5($username . $time);
    $sig1 = mysqli_real_escape_string($con, $sig1_raw);
    $sig2 = mysqli_real_escape_string($con, $sig2_raw);
    $sig3 = mysqli_real_escape_string($con, $sig3_raw);
    $sig1_type = mysqli_real_escape_string($con, $sig1_type_raw);
    $sig2_type = mysqli_real_escape_string($con, $sig2_type_raw);
    $sig3_type = mysqli_real_escape_string($con, $sig3_type_raw);
    $place = mysqli_real_escape_string($con, sanitize_xml($place_raw));
    $hobby = mysqli_real_escape_string($con, sanitize_xml($hobby_raw));
    $intro = mysqli_real_escape_string($con, sanitize_xml($intro_raw));
    $mail = mysqli_real_escape_string($con, sanitize_xml(trim($mail_raw)));

    // PKU 邮箱域名校验 + 验证码校验（受开关控制）
    if (CAPUBBS_ENABLE_EMAIL_VERIFY) {
        if (!jiekoufunc_is_pku_email(trim($mail_raw))) {
            return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN),
                'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn（学号为10位数字）。'));
        }

        $verify_code = isset($params['verify_code']) ? $params['verify_code'] : '';
        if (empty($verify_code)) {
            return array(array('code' => strval(ApiError::MISSING_FIELD),
                'msg' => '请先验证邮箱，输入邮件中的验证码。'));
        }

        $code_esc = mysqli_real_escape_string($con, $verify_code);
        // $mail 已在 line ~711 被 escape，这里直接用于 SQL 查询
        $mail_esc = $mail;
        $vresult = mysqli_fetch_array(mysqli_query($con,
            "SELECT * FROM email_verification
             WHERE email='$mail_esc' AND code='$code_esc' AND type='register'
             AND used=0 ORDER BY id DESC LIMIT 1"));

        if (!$vresult) {
            return array(array('code' => strval(ApiError::VERIFY_CODE_INVALID),
                'msg' => '验证码无效，请重新获取。'));
        }

        if (intval($vresult['expires_at']) < time()) {
            return array(array('code' => strval(ApiError::VERIFY_CODE_EXPIRED),
                'msg' => '验证码已过期，请重新获取。'));
        }

        // 标记验证码为已使用
        mysqli_query($con, "UPDATE email_verification SET used=1 WHERE id=" . intval($vresult['id']));
    }

    $onlinetype = isset($params['onlinetype']) ? mysqli_real_escape_string($con, $params['onlinetype']) : '';
    $browser = isset($params['browser']) ? mysqli_real_escape_string($con, $params['browser']) : '';
    $system_val = isset($params['system']) ? mysqli_real_escape_string($con, $params['system']) : '';
    $logininfo = "";
    if ($onlinetype == "web") $logininfo = $browser;
    if ($onlinetype == "android" || $onlinetype == "ios") $logininfo = $system_val;

    $verified_val = (CAPUBBS_ENABLE_EMAIL_VERIFY) ? 1 : 0;
    $statement = "insert into userinfo values ('$username','$password','$token',$time,'$sex','$icon','$intro','$sig1','$sig2','$sig3','$hobby','$qq_val','$mail'," .
        "'$place','$date','$date','$ip',1,0,0,0,0,0,0,0,0,NULL,NULL,'$onlinetype','$logininfo',null,null,null,null,null,null,null,$verified_val,0)";
    mysqli_query($con, $statement);
    $error = mysqli_errno($con);
    if ($error != 0) {
        return array(array('code' => strval($error), 'msg' => mysqli_error($con)));
    }
    $sig_type_vals = array(1 => $sig1_type, 2 => $sig2_type, 3 => $sig3_type);
    $sig_vals = array(1 => $sig1, 2 => $sig2, 3 => $sig3);
    $upsert_err = upsert_user_sigs($con, $username, $sig_vals, $sig_type_vals);
    if ($upsert_err !== null) {
        return array(array('code' => '1', 'msg' => '保存签名档失败: ' . $upsert_err));
    }
    return array(array('code' => '0', 'username' => $username, 'token' => $token));
}

require_once __DIR__ . '/jiekoufunc_thread.php';

function jiekoufunc_sendmsg($con, $token, $to, $text) {
    return capubbs_message_service($con)->legacySend($token, $to, $text);
}

function jiekoufunc_boardcast($con, $token, $text) {
    return capubbs_message_service($con)->legacyBroadcast($token, $text);
}

function jiekoufunc_news($con, $token, $params) {
    $a = jiekoufunc_getrights($con, 0, $token);
    if (intval($a[3]) < 1) {
        return array(array('code' => '-1', 'msg' => '您的权限不足！'));
    }
    $method = isset($params['method']) ? $params['method'] : '';
    if ($method == "delete") {
        $newstime = isset($params['time']) ? mysqli_real_escape_string($con, $params['time']) : '';
        mysqli_query($con, "delete from capubbs.mainpage where id=1 && field3='$newstime'");
        mysqli_query($con, "alter table capubbs.mainpage order by number");
        return array(array('code' => '0'));
    } elseif ($method == "add") {
        $title = isset($params['text']) ? mysqli_real_escape_string($con, $params['text']) : '';
        $url_raw = isset($params['url']) ? $params['url'] : '';
        $url = mysqli_real_escape_string($con, $url_raw);
        if (strlen($title) == 0) {
            return array(array('code' => '-1', 'msg' => '您未填写公告内容！'));
        }
        if (strlen($url) == 0) {
            $url = "javascript:void(0)";
        }
        $newstime = time();
        mysqli_query($con, "insert into capubbs.mainpage values (null,1,'$title','$url','$newstime','','')");
        mysqli_query($con, "alter table capubbs.mainpage order by number");
        return array(array('code' => '0'));
    } else {
        return array(array('code' => '-1', 'msg' => '错误操作！'));
    }
}

function jiekoufunc_attach($con, $token, $path, $filename) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) return jiekoufunc_report('3', "unauthorized");
    $user_name = mysqli_real_escape_string($con, $user['username']);
    if (strstr($path, "'") != "") {
        return jiekoufunc_report('1', "illegal");
    }
    $filename = str_replace("&", "&amp;", $filename);
    $filename = mysqli_real_escape_string($con, $filename);
    $fullpath = $GLOBALS['attachroot'] . $path;
    if (!file_exists($fullpath)) {
        return jiekoufunc_report('2', "error: file not found");
    }
    $size = (int)filesize($fullpath);
    $statement = "insert into attachments (name,path,size,uploader,price,auth,time) values('$filename','$path',$size,'$user_name',0,0," . time() . ")";
    mysqli_query($con, $statement);
    if (!mysqli_error($con)) return jiekoufunc_report('0', mysqli_insert_id($con));
    else return jiekoufunc_report('2', "error:" . mysqli_error($con));
}

function jiekoufunc_attachdl($con, $token, $id) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) return jiekoufunc_report('3', "unauthorized");
    if (!jiekoufunc_islegal($id)) {
        return jiekoufunc_report('1', "illegal");
    }
    $statement = "select * from attachments where id=$id limit 1";
    $result = mysqli_query($con, $statement);
    $ainfo = mysqli_fetch_array($result);
    if (!$ainfo) return jiekoufunc_report('6', "attachment not found");
    $statement = "update attachments set count=count+1 where id=$id limit 1";
    mysqli_query($con, $statement);
    return array(array('code' => '0', 'aid' => strval($id), 'path' => $ainfo['path'], 'name' => $ainfo['name']));
}

function jiekoufunc_delattach($con, $token, $id) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
    }
    $username = $user['username'];
    $statement = "select * from attachments where id=$id limit 1";
    $result = mysqli_query($con, $statement);
    $ainfo = mysqli_fetch_array($result);
    if (!$ainfo) {
        return array(array('code' => '6', 'msg' => '找不到该附件'));
    }
    if ($ainfo['uploader'] != $username) {
        return array(array('code' => '2', 'msg' => '无权删除'));
    }
    if ($ainfo['path']) {
        if (!file_exists($GLOBALS['attachroot'] . $ainfo['path']) || true) {
            $statement = "update attachments set uploader=concat(uploader, '|删除') where id=$id limit 1";
            mysqli_query($con, $statement);
            if (!mysqli_error($con)) {
                return array(array('code' => '0'));
            } else {
                return array(array('code' => '3', 'msg' => mysqli_error($con)));
            }
        } else {
            return array(array('code' => '4', 'msg' => '无法删除附件'));
        }
    } else {
        return array(array('code' => '5', 'msg' => '数据库错误'));
    }
}

function jiekoufunc_updatetokentime($con, $token, $ip) {
    return capubbs_auth_service($con)->legacyTouchSession($token, $ip);
}

function jiekoufunc_edituser($con, $token, $ip, $params) {
    $time = time();
    $a = jiekoufunc_token2user($con, $token);
    if (!$a) {
        return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
    }
    $username = $a['username'];
    $username_esc = mysqli_real_escape_string($con, $username);
    $sig1 = isset($params['sig1']) ? mysqli_real_escape_string($con, sanitize_xml($params['sig1'])) : '';
    $sig2 = isset($params['sig2']) ? mysqli_real_escape_string($con, sanitize_xml($params['sig2'])) : '';
    $sig3 = isset($params['sig3']) ? mysqli_real_escape_string($con, sanitize_xml($params['sig3'])) : '';
    $intro = isset($params['intro']) ? mysqli_real_escape_string($con, sanitize_xml($params['intro'])) : '';
    $mail = isset($params['mail']) ? mysqli_real_escape_string($con, sanitize_xml($params['mail'])) : '';
    $email_visible = isset($params['email_visible']) ? intval($params['email_visible']) : (isset($a['email_visible']) ? intval($a['email_visible']) : 0);
    $place = isset($params['place']) ? mysqli_real_escape_string($con, sanitize_xml($params['place'])) : '';
    $hobby = isset($params['hobby']) ? mysqli_real_escape_string($con, sanitize_xml($params['hobby'])) : '';
    $qq = isset($params['qq']) ? mysqli_real_escape_string($con, sanitize_xml($params['qq'])) : '';
    $icon = isset($params['icon']) ? mysqli_real_escape_string($con, sanitize_xml($params['icon'])) : '';
    $sex = isset($params['sex']) ? mysqli_real_escape_string($con, sanitize_xml($params['sex'])) : '';

    // 邮箱变更不再通过此表单提交，仅当 mail 与当前值相同时保留
    $current_mail = $a['mail'];
    if ($mail !== $current_mail) {
        $mail = $current_mail; // 跳过邮箱变更（通过验证流程完成）
    }

    $statement = "update userinfo set tokentime=$time, sex='$sex'," .
                 "lastip='$ip', icon='$icon', mail='$mail', email_visible=$email_visible, qq='$qq', intro='$intro', place='$place'," .
                 "hobby='$hobby', sig1='$sig1', sig2='$sig2', sig3='$sig3' where username='$username_esc'";
    mysqli_query($con, $statement);
    if (mysqli_error($con)) {
        return array(array('code' => '1', 'error' => mysqli_error($con)));
    }
    $sig1_type = isset($params['sig1_type']) ? $params['sig1_type'] : 'null';
    $sig2_type = isset($params['sig2_type']) ? $params['sig2_type'] : 'null';
    $sig3_type = isset($params['sig3_type']) ? $params['sig3_type'] : 'null';
    $sig_type_vals = array(1 => $sig1_type, 2 => $sig2_type, 3 => $sig3_type);
    $sig_vals = array(1 => $sig1, 2 => $sig2, 3 => $sig3);
    $upsert_err = upsert_user_sigs($con, $username_esc, $sig_vals, $sig_type_vals);
    if ($upsert_err !== null) {
        return array(array('code' => '1', 'error' => '保存签名档失败: ' . $upsert_err));
    }
    return array(array('code' => '0', 'username' => $username));
}

function jiekoufunc_changepsd($con, $token, $params) {
    $nowtime = time();
    $statement = "select password from userinfo where token='$token' and $nowtime<=tokentime+{$GLOBALS['validtime']} limit 1";
    $result = mysqli_query($con, $statement);
    $result = mysqli_fetch_array($result);
    if (!$result) {
        return jiekoufunc_report('1', "会话超时，请重新<a href='../login'>登录</a>");
    }
    $oldpsd = isset($params['old']) ? $params['old'] : '';
    if (strtoupper($result['password']) != strtoupper($oldpsd)) {
        return jiekoufunc_report('2', '旧密码不正确，请重新输入');
    }
    $newpsd_raw = isset($params['new']) ? $params['new'] : '';
    $newpsd = mysqli_real_escape_string($con, $newpsd_raw);
    $newpsd = strtoupper($newpsd);

    $newtoken = md5($oldpsd . $nowtime);
    $statement = "update userinfo set password='$newpsd',token='$newtoken' where token='$token' limit 1";
    if (mysqli_query($con, $statement)) {
        return jiekoufunc_report('0', $newtoken);
    } else {
        return jiekoufunc_report('3', mysqli_error($con));
    }
}

function jiekoufunc_admin_reset_password($con, $token, $params) {
    $nowtime = time();
    if (!$token) {
        return jiekoufunc_report('1', '尚未登录');
    }
    $statement = "select username, rights from userinfo where token='$token' and $nowtime<=tokentime+{$GLOBALS['validtime']} limit 1";
    $result = mysqli_query($con, $statement);
    $caller = mysqli_fetch_array($result);
    if (!$caller) {
        return jiekoufunc_report('1', '会话超时，请重新登录');
    }
    if (intval($caller[1]) < 10) {
        return jiekoufunc_report('2', '权限不足：仅限 rights >= 10 的管理员操作');
    }

    $target_username = isset($params['target_username']) ? trim($params['target_username']) : '';
    if ($target_username === '') {
        return jiekoufunc_report('3', '参数错误：缺少目标用户名');
    }
    $safe_username = mysqli_real_escape_string($con, $target_username);

    $new_password = strtoupper(md5('123456'));
    $safe_password = mysqli_real_escape_string($con, $new_password);

    $new_token = md5($target_username . $nowtime);
    $safe_token = mysqli_real_escape_string($con, $new_token);

    $statement = "update userinfo set password='$safe_password', token='$safe_token', tokentime='$nowtime' where username='$safe_username' limit 1";
    error_log($statement);
    if (mysqli_query($con, $statement)) {
        if (mysqli_affected_rows($con) > 0) {
            return jiekoufunc_report('0', '密码已重置为 123456');
        } else {
            return jiekoufunc_report('4', '用户不存在');
        }
    } else {
        return jiekoufunc_report('5', mysqli_error($con));
    }
}

// ============================================================================
//  Favorite operations
// ============================================================================

function jiekoufunc_favorite_add($con, $token, $bid, $tid) {
    return capubbs_favorite_service($con)->legacyAdd($token, $bid, $tid);
}

function jiekoufunc_favorite_remove($con, $token, $bid, $tid) {
    return capubbs_favorite_service($con)->legacyRemove($token, $bid, $tid);
}

function jiekoufunc_favorite_list($con, $token, $params) {
    return capubbs_favorite_service($con)->legacyList($token, $params);
}

function jiekoufunc_favorite_sort($con, $token, $bid, $tid, $params) {
    return capubbs_favorite_service($con)->legacySort($token, $bid, $tid, $params);
}

function jiekoufunc_favorite_count($con, $bid, $tid) {
    return capubbs_favorite_service($con)->legacyCount($bid, $tid);
}

function jiekoufunc_favorite_check($con, $token, $bid, $tid) {
    return capubbs_favorite_service($con)->legacyCheck($token, $bid, $tid);
}

function jiekoufunc_calendar($con) {
    $statement = "select * from capubbs.calendar";
    $results = mysqli_query($con, $statement);
    $infos = array();
    while ($res = mysqli_fetch_array($results)) {
        $infos[] = $res;
    }
    return $infos;
}

// ============================================================================
//  Trash / restore / edit-history system
// ============================================================================

// Get list of board IDs that a user moderates.
function _jiekoufunc_get_moderator_bids($con, $username) {
    $bids = array();
    $stmt = "select bid from boardinfo
             where m1='$username' or m2='$username' or m3='$username' or m4='$username'";
    $res = mysqli_query($con, $stmt);
    while ($row = mysqli_fetch_row($res)) {
        $bids[] = intval($row[0]);
    }
    return $bids;
}

// List trash items (deleted posts/threads). Board mods see their boards; admins (rights>=2) see all.
function jiekoufunc_trash_list($con, $token, $bid, $page, $limit, $type) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '尚未登录。');
    }
    $username = $user[0];
    $rights = intval($user[2]);
    $is_admin = ($rights >= 2);

    $page = max(1, intval($page ?: 1));
    $limit = max(1, min(100, intval($limit ?: 20)));
    $offset = ($page - 1) * $limit;

    // Build shared WHERE clause (same columns across both tables)
    $where = '';
    if ($bid > 0) {
        $where = "where bid=$bid";
    }
    if (!$is_admin) {
        $my_bids = _jiekoufunc_get_moderator_bids($con, $username);
        if (empty($my_bids)) $my_bids = array(-1);
        $bid_list = implode(',', $my_bids);
        $where .= ($where ? ' and' : 'where') . " bid in ($bid_list)";
    }

    // Build UNION ALL subqueries with common columns
    $parts = array();
    if ($type == 'all' || $type == 'post') {
        $parts[] = "select trash_id, bid, tid, pid, fid, title, text, author, deleter, deletetime, 'post' as trash_type from trash_posts $where";
    }
    if ($type == 'all' || $type == 'thread') {
        $parts[] = "select trash_id, bid, tid, 0 as pid, 0 as fid, title, '' as text, author, deleter, deletetime, 'thread' as trash_type from trash_threads $where";
    }

    if (empty($parts)) {
        return array(array('code' => '0', 'msg' => '回收站为空', 'items' => '0'));
    }

    $union = implode(' union all ', $parts);
    $stmt = "select * from ($union) as t order by deletetime desc limit $offset, $limit";
    $res = mysqli_query($con, $stmt);

    $out = array();
    while ($row = mysqli_fetch_array($res)) {
        $item = array();
        foreach ($row as $key => $value) {
            if (is_long($key)) continue;
            $item[$key] = is_null($value) ? '' : strval($value);
        }
        $out[] = $item;
    }

    if (empty($out)) {
        return array(array('code' => '0', 'msg' => '回收站为空', 'items' => '0'));
    }

    return $out;
}

// Restore a deleted post or thread from trash.
function jiekoufunc_trash_restore($con, $token, $type, $bid, $tid, $pid, $trash_id) {
    $time = time();
    $a = jiekoufunc_getrights($con, $bid, $token);

    if ($a[0] <= 0) {
        return jiekoufunc_report('5', '权限不足！仅版主或管理员可恢复帖子。');
    }
    $username = $a[1];
    $ip = $a[2];

    if ($type == 'thread') {
        // ========== Restore entire thread ==========
        $stmt = "select * from trash_threads where trash_id=$trash_id and bid=$bid and tid=$tid";
        $res = mysqli_query($con, $stmt);
        if (mysqli_num_rows($res) == 0) {
            return jiekoufunc_report('3', '回收站中未找到该主题。');
        }
        $thread = mysqli_fetch_array($res);

        // Check for tid conflict
        $stmt_chk = "select tid from threads where bid=$bid and tid=$tid";
        if (mysqli_num_rows(mysqli_query($con, $stmt_chk)) != 0) {
            return jiekoufunc_report('4', '目标版块已存在相同 tid 的主题。');
        }

        // Restore threads row
        $th_title = mysqli_real_escape_string($con, $thread['title']);
        $th_author = mysqli_real_escape_string($con, $thread['author']);
        $th_replyer = isset($thread['replyer']) ? "'" . mysqli_real_escape_string($con, $thread['replyer']) . "'" : "NULL";
        $th_click = intval($thread['click']);
        $th_reply = intval($thread['reply']);
        $th_guest = intval($thread['guesture']);
        $th_extr = intval($thread['extr']);
        $th_top = intval($thread['top']);
        $th_locked = intval($thread['locked']);
        $th_ts = intval($thread['timestamp']);
        $th_pd = isset($thread['postdate']) ? "'" . mysqli_real_escape_string($con, $thread['postdate']) . "'" : "NULL";

        $stmt_ins = "insert into threads
            (bid, tid, title, author, replyer, click, reply, guesture,
             extr, top, locked, timestamp, postdate)
            values ($bid, $tid, '$th_title', '$th_author', $th_replyer,
                    $th_click, $th_reply, $th_guest, $th_extr, $th_top,
                    $th_locked, $th_ts, $th_pd)";
        mysqli_query($con, $stmt_ins);

        // Restore all posts under this thread
        $stmt_posts = "select * from trash_posts where bid=$bid and tid=$tid order by pid";
        $res_posts = mysqli_query($con, $stmt_posts);
        $restored_count = 0;
        while ($row = mysqli_fetch_array($res_posts)) {
            $p_fid = intval($row['fid']);
            $p_pid = intval($row['pid']);
            $p_title = mysqli_real_escape_string($con, $row['title']);
            $p_author = mysqli_real_escape_string($con, $row['author']);
            $p_text = mysqli_real_escape_string($con, $row['text']);
            $p_ishtml = mysqli_real_escape_string($con, $row['ishtml']);
            $p_attachs = mysqli_real_escape_string($con, $row['attachs']);
            $p_rtime = intval($row['replytime']);
            $p_utime = intval($row['updatetime']);
            $p_sig = intval($row['sig']);
            $p_type = mysqli_real_escape_string($con, $row['type']);
            $p_ip = mysqli_real_escape_string($con, $row['ip']);
            $p_lzl = intval($row['lzl']);

            $stmt_ins_p = "insert ignore into posts
                (bid, tid, pid, fid, title, author, text, ishtml, attachs,
                 replytime, updatetime, sig, type, ip, lzl)
                values ($bid, $tid, $p_pid, $p_fid,
                        '$p_title', '$p_author', '$p_text', '$p_ishtml', '$p_attachs',
                        $p_rtime, $p_utime, $p_sig, '$p_type', '$p_ip', $p_lzl)";
            mysqli_query($con, $stmt_ins_p);
            if (mysqli_affected_rows($con) > 0) $restored_count++;
        }

        $statement = "delete from trash_posts where bid=$bid and tid=$tid";
        mysqli_query($con, $statement);
        $statement = "delete from trash_threads where trash_id=$trash_id";
        mysqli_query($con, $statement);

        return array(array(
            'code' => '0', 'msg' => 'ok', 'restored' => strval($restored_count)
        ));
    }

    if ($type == 'post') {
        // ========== Restore single post ==========
        $stmt = "select * from trash_posts where trash_id=$trash_id and bid=$bid and tid=$tid and pid=$pid";
        $res = mysqli_query($con, $stmt);
        if (mysqli_num_rows($res) == 0) {
            return jiekoufunc_report('3', '回收站中未找到该帖子。');
        }
        $row = mysqli_fetch_array($res);

        // Check parent thread exists
        $stmt_th = "select reply from threads where bid=$bid and tid=$tid";
        $res_th = mysqli_query($con, $stmt_th);
        if (mysqli_num_rows($res_th) == 0) {
            return jiekoufunc_report('4', '父主题不存在，无法恢复回帖。请先恢复主题。');
        }
        $th = mysqli_fetch_row($res_th);
        $current_reply = intval($th[0]);

        // Determine restore pid by replytime to preserve original post order.
        // Using stored pid directly is unsafe: if pid=3 was deleted twice, both
        // trash entries carry pid=3 but belong at different positions.
        $my_rtime = intval($row['replytime']);
        $stmt_max = "select max(pid) from posts where bid=$bid and tid=$tid";
        $res_max = mysqli_query($con, $stmt_max);
        $max_pid = intval(mysqli_fetch_row($res_max)[0]);
        $restore_pid = 1;
        if ($max_pid > 0) {
            $stmt_pos = "select pid, replytime from posts where bid=$bid and tid=$tid order by pid asc";
            $res_pos = mysqli_query($con, $stmt_pos);
            while ($post_pos = mysqli_fetch_array($res_pos)) {
                if ($my_rtime < intval($post_pos['replytime'])) break;
                $restore_pid = intval($post_pos['pid']) + 1;
            }
        }
        if ($restore_pid > $max_pid + 1) $restore_pid = $max_pid + 1;
        if ($restore_pid <= 0) $restore_pid = 1;

        // Shift subsequent posts
        if ($restore_pid <= $max_pid) {
            $statement = "update posts set pid=pid+1 where bid=$bid && tid=$tid && pid>=$restore_pid";
            mysqli_query($con, $statement);
        }

        $p_fid = intval($row['fid']);
        $p_title = mysqli_real_escape_string($con, $row['title']);
        $p_author = mysqli_real_escape_string($con, $row['author']);
        $p_text = mysqli_real_escape_string($con, $row['text']);
        $p_ishtml = mysqli_real_escape_string($con, $row['ishtml']);
        $p_attachs = mysqli_real_escape_string($con, $row['attachs']);
        $p_rtime = intval($row['replytime']);
        $p_utime = intval($row['updatetime']);
        $p_sig = intval($row['sig']);
        $p_type = mysqli_real_escape_string($con, $row['type']);
        $p_ip = mysqli_real_escape_string($con, $row['ip']);
        $p_lzl = intval($row['lzl']);

        $stmt_ins = "insert ignore into posts
            (bid, tid, pid, fid, title, author, text, ishtml, attachs,
             replytime, updatetime, sig, type, ip, lzl)
            values ($bid, $tid, $restore_pid, $p_fid,
                    '$p_title', '$p_author', '$p_text', '$p_ishtml', '$p_attachs',
                    $p_rtime, $p_utime, $p_sig, '$p_type', '$p_ip', $p_lzl)";
        mysqli_query($con, $stmt_ins);

        // Update thread metadata
        $new_reply = $current_reply + 1;
        if ($restore_pid == 1) {
            $statement = "update threads set title='$p_title', author='$p_author', reply=$new_reply where bid=$bid && tid=$tid";
            mysqli_query($con, $statement);
        } else {
            $statement = "update threads set reply=$new_reply where bid=$bid && tid=$tid";
            mysqli_query($con, $statement);
        }

        $statement = "delete from trash_posts where trash_id=$trash_id";
        mysqli_query($con, $statement);

        return array(array(
            'code' => '0', 'msg' => 'ok', 'restored' => '1', 'new_pid' => strval($restore_pid)
        ));
    }

    return jiekoufunc_report('14', 'type 参数无效，请使用 post 或 thread。');
}

// Permanently delete a trash item (admin only).
function jiekoufunc_trash_delete($con, $token, $type, $bid, $tid, $pid, $trash_id) {
    $a = jiekoufunc_getrights($con, $bid, $token);
    if ($a[0] < 2) {
        return jiekoufunc_report('5', '权限不足！仅管理员可永久删除。');
    }

    if ($type == 'thread') {
        $statement = "delete from trash_posts where bid=$bid and tid=$tid";
        mysqli_query($con, $statement);
        $statement = "delete from trash_threads where trash_id=$trash_id";
        mysqli_query($con, $statement);
        return jiekoufunc_report('0', '');
    }

    if ($type == 'post') {
        $statement = "delete from trash_posts where trash_id=" . intval($trash_id);
        mysqli_query($con, $statement);
        return jiekoufunc_report('0', '');
    }

    return jiekoufunc_report('14', 'type 参数无效。');
}

// Batch clean old trash items (admin only).
function jiekoufunc_trash_clean($con, $token, $days) {
    $a = jiekoufunc_getrights($con, 0, $token);
    if ($a[0] < 2) {
        return jiekoufunc_report('5', '权限不足！仅管理员可执行批量清理。');
    }

    $days = max(1, intval($days ?: 90));
    $cutoff = time() - $days * 86400;

    $statement = "delete from trash_posts where deletetime < $cutoff";
    mysqli_query($con, $statement);
    $cnt_posts = mysqli_affected_rows($con);
    $statement = "delete from trash_threads where deletetime < $cutoff";
    mysqli_query($con, $statement);
    $cnt_threads = mysqli_affected_rows($con);

    return array(array(
        'code' => '0',
        'msg' => 'ok',
        'deleted_posts' => strval($cnt_posts + $cnt_threads)
    ));
}

// ============================================================================
//  Edit history
// ============================================================================

function jiekoufunc_edit_history($con, $token, $fid, $version_id) {
    $a = jiekoufunc_getrights($con, 0, $token);
    if ($a[0] == -1) {
        return jiekoufunc_report('1', '超时，请重新登录。');
    }
    $username = $a[1];

    // 检查是否有自己的编辑记录
    $stmt = "select max(version_id) from post_edit_history
             where fid=$fid and edit_by='$username'";
    $res = mysqli_query($con, $stmt);
    $row = mysqli_fetch_row($res);
    $max_own_id = ($row[0] !== null) ? intval($row[0]) : 0;

    // 判断是否当前作者
    $stmt = "select author from posts where fid=$fid";
    $res = mysqli_query($con, $stmt);
    $is_current_author = (mysqli_num_rows($res) > 0 && mysqli_fetch_row($res)[0] == $username);

    // 既没有编辑记录也不是当前作者 → 拒绝
    if ($max_own_id == 0 && !$is_current_author) {
        return jiekoufunc_report('5', '权限不足！');
    }
    // 当前作者但没有任何编辑记录 → 返回空
    if ($max_own_id == 0 && $is_current_author) {
        return array(array('code' => '0', 'msg' => '无编辑历史', 'count' => '0'));
    }

    // 构建可见范围：自己的记录 + 非当前作者时补一条"接管版本"
    if ($is_current_author) {
        $visible = "edit_by='$username'";
    } else {
        // 找到自己最后一次编辑之后、别人第一次编辑的那条记录（接管版本）
        $stmt = "select min(version_id) from post_edit_history
                 where fid=$fid and edit_by!='$username' and version_id > $max_own_id";
        $res = mysqli_query($con, $stmt);
        $row = mysqli_fetch_row($res);
        $next_id = ($row[0] !== null) ? intval($row[0]) : 0;
        if ($next_id > 0) {
            $visible = "(edit_by='$username' or version_id=$next_id)";
        } else {
            $visible = "edit_by='$username'";
        }
    }

    // 单版本查询
    if ($version_id > 0) {
        $stmt = "select * from post_edit_history
                 where version_id=$version_id and fid=$fid and $visible";
        $res = mysqli_query($con, $stmt);
        if (mysqli_num_rows($res) == 0) {
            return jiekoufunc_report('3', '版本不存在。');
        }
        $row = mysqli_fetch_array($res);

        return array(array(
            'code' => '0',
            'version_id' => strval($version_id),
            'text' => $row['text'],
            'edit_time' => strval($row['edit_time']),
            'edit_by' => $row['edit_by'],
            'parent_id' => strval($row['parent_id'] ?: '0'),
            'source' => $row['source'],
            'author' => $row['author'] ?: '',
            'fid' => strval($row['fid']),
            'bid' => strval($row['bid']),
            'tid' => strval($row['tid']),
            'pid' => strval($row['pid'])
        ));
    }

    // 版本列表
    $stmt = "select version_id, fid, bid, tid, pid, parent_id, source,
                    edit_time, edit_by, edit_ip
             from post_edit_history
             where fid=$fid and $visible
             order by version_id asc";
    $res = mysqli_query($con, $stmt);

    if (mysqli_num_rows($res) == 0) {
        return array(array('code' => '0', 'msg' => '无编辑历史', 'count' => '0'));
    }

    $out = array();
    $out[] = array('code' => '0', 'count' => strval(mysqli_num_rows($res)));
    while ($row = mysqli_fetch_array($res)) {
        $item = array();
        foreach ($row as $key => $value) {
            if (is_long($key)) continue;
            $item[$key] = is_null($value) ? '' : strval($value);
        }
        $out[] = $item;
    }

    return $out;
}

function jiekoufunc_restore_version($con, $token, $fid, $version_id) {
    $time = time();
    $a = jiekoufunc_getrights($con, 0, $token);
    if ($a[0] == -1) {
        return jiekoufunc_report('1', '超时，请重新登录。');
    }
    $username = $a[1];
    $ip = $a[2];

    // 获取目标历史版本（必须 fid 匹配，防止跨帖子恢复）
    $stmt = "select * from post_edit_history where version_id=$version_id and fid=$fid";
    $res = mysqli_query($con, $stmt);
    if (mysqli_num_rows($res) == 0) {
        return jiekoufunc_report('3', '版本不存在。');
    }
    $hist = mysqli_fetch_array($res);
    $target_text = $hist['text'];
    $target_author = $hist['author'];
    $his_bid = $hist['bid'];
    $his_tid = $hist['tid'];
    $his_pid = $hist['pid'];

    // 检查帖子是否仍存在（用 fid 定位，比 bid/tid/pid 更可靠）
    $stmt_post = "select * from posts where fid=$fid";
    $res_post = mysqli_query($con, $stmt_post);
    if (mysqli_num_rows($res_post) == 0) {
        return jiekoufunc_report('4', '目标帖子当前不存在（可能已被删除）。请先从回收站恢复。');
    }
    $cur = mysqli_fetch_array($res_post);
    $cur_author = $cur['author'];
    $cur_text = mysqli_real_escape_string($con, $cur['text']);
    $cur_author_esc = mysqli_real_escape_string($con, $cur_author);
    $cur_bid = intval($cur['bid']);
    $cur_tid = intval($cur['tid']);
    $cur_pid = intval($cur['pid']);

    // 权限判断：仅当前作者可恢复
    if ($username != $cur_author) {
        return jiekoufunc_report('5', '权限不足！仅帖子作者可恢复。');
    }

    // 确定恢复后的作者：优先使用历史记录中的 author（编辑前的作者）
    $restored_author = ($target_author && $target_author != '') ? $target_author : $cur_author;
    $restored_author_esc = mysqli_real_escape_string($con, $restored_author);

    // 查找当前头版本
    $stmt_head = "select version_id from post_edit_history
                  where fid=$fid order by version_id desc limit 1";
    $res_head = mysqli_query($con, $stmt_head);
    $head_id = (mysqli_num_rows($res_head) > 0)
        ? intval(mysqli_fetch_row($res_head)[0]) : 'NULL';

    // 步骤 1：快照当前内容（source=snapshot，防止丢失）
    $stmt_snap = "insert into post_edit_history
        (fid, bid, tid, pid, parent_id, text, author, source, edit_time, edit_by, edit_ip)
        values ($fid, $cur_bid, $cur_tid, $cur_pid, $head_id,
                '$cur_text', '$cur_author_esc', 'snapshot', $time, '$username', '$ip')";
    mysqli_query($con, $stmt_snap);

    // 步骤 2：插入恢复标记（source=restore，parent_id 指向被恢复的版本，形成分支）
    $esc_target = mysqli_real_escape_string($con, $target_text);
    $stmt_rest = "insert into post_edit_history
        (fid, bid, tid, pid, parent_id, text, author, source, edit_time, edit_by, edit_ip)
        values ($fid, $cur_bid, $cur_tid, $cur_pid, $version_id,
                '$esc_target', '$restored_author_esc', 'restore', $time, '$username', '$ip')";
    mysqli_query($con, $stmt_rest);

    // 步骤 3：用目标版本覆盖 posts（同时恢复作者）
    $stmt_upd = "update posts set text='$esc_target', author='$restored_author_esc', updatetime=$time
                 where fid=$fid";
    mysqli_query($con, $stmt_upd);

    // 如果恢复的是首帖，同步更新 threads.author
    if ($cur_pid == 1) {
        $stmt_th = "update threads set author='$restored_author_esc'
                    where bid=$cur_bid and tid=$cur_tid";
        mysqli_query($con, $stmt_th);
    }

    return array(array(
        'code' => '0',
        'msg' => 'ok',
        'restored_from_version' => strval($version_id),
        'restored_author' => $restored_author
    ));
}

// ============================================================================
//  Business functions — Thread listing
// ============================================================================

/**
 * Return the N most recently posted threads.
 *
 * @param $con    mysqli connection
 * @param $params array with optional keys: limit (default 10, max 100), bid (0=all)
 */
function jiekoufunc_recent_threads($con, $params) {
    $limit = isset($params['limit']) ? intval($params['limit']) : 10;
    if ($limit <= 0) $limit = 10;
    if ($limit > 100) $limit = 100;
    $bid = isset($params['bid']) ? intval($params['bid']) : 0;

    $bid_where = ($bid > 0) ? "AND t.bid = $bid" : "";

    $sql = "SELECT t.bid, t.tid, t.title, t.author, t.replyer,
                   t.click, t.reply, t.timestamp, t.postdate, t.extr, t.top, t.locked
            FROM threads t
            WHERE 1 = 1 $bid_where
            ORDER BY t.timestamp DESC
            LIMIT $limit";

    return jiekoufunc_view_bbs_array($con, $sql);
}

/**
 * Return the N hottest threads, with multiple heat-calculation methods.
 *
 * Supported methods (params['method']):
 *   reply_count    — pure reply count
 *   recent_activity — reply count within the time window
 *   engagement     — replies + unique participants + clicks
 *   hacker_news    — gravity-based decay: replies / (hours + 2)^1.5
 *   composite      — weighted mix of replies, 24h activity, and clicks (default)
 *
 * @param $con    mysqli connection
 * @param $params array with optional keys:
 *                limit   (default 10, max 100)
 *                bid     (0=all boards)
 *                method  (default 'composite')
 *                days    (time window in days, default 7)
 *                min_replies (minimum reply count threshold, default 0)
 */
function jiekoufunc_hot_threads($con, $params) {
    $limit = isset($params['limit']) ? intval($params['limit']) : 10;
    $bid = isset($params['bid']) ? intval($params['bid']) : 0;
    $method = isset($params['method']) ? $params['method'] : 'composite';
    $days = isset($params['days']) ? intval($params['days']) : 7;
    $min_replies = isset($params['min_replies']) ? intval($params['min_replies']) : 0;

    if ($limit <= 0) $limit = 10;
    if ($limit > 100) $limit = 100;
    if ($days <= 0) $days = 7;

    $cutoff = time() - ($days * 86400);
    $bid_where = ($bid > 0) ? "AND t.bid = $bid" : "";

    // Total LZL count per thread (sum of lzl counters across all posts)
    $lzl_total = "(SELECT COALESCE(SUM(p2.lzl), 0) FROM posts p2 WHERE p2.bid = t.bid AND p2.tid = t.tid)";
    // Total replies + LZL (used for scoring and threshold)
    $total_eng = "(t.reply + $lzl_total)";
    $reply_min = ($min_replies > 0) ? "AND $total_eng >= $min_replies" : "";

    switch ($method) {
        case 'reply_count':
            $sql = "SELECT t.bid, t.tid, t.title, t.author, t.replyer,
                           t.click, t.reply, t.timestamp, t.postdate,
                           t.extr, t.top, t.locked,
                           $total_eng AS score
                    FROM threads t
                    WHERE t.timestamp >= $cutoff $bid_where $reply_min
                    ORDER BY score DESC
                    LIMIT $limit";
            break;

        case 'recent_activity':
            // Recent posts + recent LZL within the time window.
            // LZL is stored in the `lzl` table with a `time` column.
            $lzl_recent = "(SELECT COUNT(*) FROM lzl
                            WHERE fid IN (SELECT fid FROM posts WHERE bid = t.bid AND tid = t.tid)
                            AND time >= $cutoff)";
            $sql = "SELECT t.bid, t.tid, t.title, t.author, t.replyer,
                           t.click, t.reply, t.timestamp, t.postdate,
                           t.extr, t.top, t.locked,
                           (COUNT(p.fid) + COALESCE($lzl_recent, 0)) AS score
                    FROM threads t
                    LEFT JOIN posts p ON t.bid = p.bid AND t.tid = p.tid
                                      AND p.replytime >= $cutoff
                    WHERE t.timestamp >= $cutoff $bid_where $reply_min
                    GROUP BY t.bid, t.tid
                    ORDER BY score DESC
                    LIMIT $limit";
            break;

        case 'engagement':
            // Total engagement: replies + LZL + unique participants + clicks
            $sql = "SELECT t.bid, t.tid, t.title, t.author, t.replyer,
                           t.click, t.reply, t.timestamp, t.postdate,
                           t.extr, t.top, t.locked,
                           ($total_eng * 1.0
                            + COUNT(DISTINCT p.author) * 2.0
                            + t.click * 0.1) AS score
                    FROM threads t
                    LEFT JOIN posts p ON t.bid = p.bid AND t.tid = p.tid
                    WHERE t.timestamp >= $cutoff $bid_where $reply_min
                    GROUP BY t.bid, t.tid
                    ORDER BY score DESC
                    LIMIT $limit";
            break;

        case 'hacker_news':
            $now = time();
            $sql = "SELECT t.bid, t.tid, t.title, t.author, t.replyer,
                           t.click, t.reply, t.timestamp, t.postdate,
                           t.extr, t.top, t.locked,
                           ($total_eng) / POW(GREATEST(($now - t.timestamp) / 3600 + 2, 1), 1.5) AS score
                    FROM threads t
                    WHERE 1 = 1 $bid_where $reply_min
                    ORDER BY score DESC
                    LIMIT $limit";
            break;

        case 'composite':
        default:
            // Weighted mix: total engagement + 24h activity + clicks
            $one_day_ago = time() - 86400;
            $lzl_24h = "(SELECT COALESCE(COUNT(*), 0) FROM lzl
                         WHERE fid IN (SELECT fid FROM posts WHERE bid = t.bid AND tid = t.tid)
                         AND time >= $one_day_ago)";
            $sql = "SELECT t.bid, t.tid, t.title, t.author, t.replyer,
                           t.click, t.reply, t.timestamp, t.postdate,
                           t.extr, t.top, t.locked,
                           ($total_eng * 0.6
                            + (SELECT COUNT(*) FROM posts p
                               WHERE p.bid = t.bid AND p.tid = t.tid
                               AND p.replytime >= $one_day_ago) * 2.0
                            + COALESCE($lzl_24h, 0) * 2.0
                            + t.click * 0.01) AS score
                    FROM threads t
                    WHERE t.timestamp >= $cutoff $bid_where $reply_min
                    ORDER BY score DESC
                    LIMIT $limit";
            break;
    }

    return jiekoufunc_view_bbs_array($con, $sql);
}

// ============================================================================
//  Email verification — Helper functions
// ============================================================================

function jiekoufunc_is_pku_email($email) {
    // 学号 = 10 位数字，域名 = *.pku.edu.cn 或 bjmu.edu.cn
    if (preg_match('/^\d{10}@(.+\.)*pku\.edu\.cn$/i', $email)) return true;
    if (preg_match('/^\d{10}@bjmu\.edu\.cn$/i', $email)) return true;
    return false;
}

function jiekoufunc_is_muted($con, $username, $bid = 0) {
    if (!CAPUBBS_ENABLE_POST_CONTROL) return false;

    $username_esc = mysqli_real_escape_string($con, $username);
    $result = mysqli_fetch_array(mysqli_query($con,
        "SELECT verified, post, reply, mail FROM userinfo WHERE username='$username_esc'"));
    if (!$result) return false;

    // bid=28 板块允许未验证邮箱且发帖/回帖数不足的用户发言
    if (intval($result['verified']) === 0) {
        if ((intval($result['post']) + intval($result['reply'])) <= 20) {
            if (intval($bid) !== 28) {
                return '邮箱未验证';
            }
        }
    }

    if (CAPUBBS_ENABLE_EMAIL_MUTE) {
        $mail = $result['mail'];
        if ($mail) {
            $mail_esc = mysqli_real_escape_string($con, $mail);
            $mute_check = mysqli_fetch_array(mysqli_query($con,
                "SELECT COUNT(*) as cnt FROM email_mutes WHERE email='$mail_esc' AND active=1"));
            if ($mute_check && intval($mute_check['cnt']) > 0) {
                return '邮箱已被管理员禁言';
            }
        }
    }

    return false;
}

function jiekoufunc_can_send_code($con, $username, $email, $type) {
    $username_esc = mysqli_real_escape_string($con, $username);
    $email_esc = mysqli_real_escape_string($con, $email);
    $one_min_ago = time() - 60;
    $result = mysqli_fetch_array(mysqli_query($con,
        "SELECT COUNT(*) as cnt FROM email_verification
         WHERE username='$username_esc' AND email='$email_esc' AND type='$type'
         AND created_at > $one_min_ago"));
    return ($result && intval($result['cnt']) === 0);
}

function jiekoufunc_invalidate_codes($con, $username, $email, $type) {
    $username_esc = mysqli_real_escape_string($con, $username);
    $email_esc = mysqli_real_escape_string($con, $email);
    mysqli_query($con,
        "UPDATE email_verification SET used=1
         WHERE username='$username_esc' AND email='$email_esc' AND type='$type' AND used=0");
}

// ============================================================================
//  Email verification — API handlers
// ============================================================================

function jiekoufunc_sendRegisterCode($con, $params) {
    if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
        return array(array('code' => strval(ApiError::FEATURE_DISABLED),
            'msg' => '邮箱验证功能已被管理员关闭。'));
    }

    $email = isset($params['email']) ? trim($params['email']) : '';
    if (empty($email)) {
        return array(array('code' => strval(ApiError::MISSING_FIELD),
            'msg' => '请输入邮箱地址。'));
    }

    if (!jiekoufunc_is_pku_email($email)) {
        return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN),
            'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn（学号为10位数字）。'));
    }

    $email_esc = mysqli_real_escape_string($con, $email);

    $one_min_ago = time() - 60;
    $rate_check = mysqli_fetch_array(mysqli_query($con,
        "SELECT COUNT(*) as cnt FROM email_verification
         WHERE email='$email_esc' AND type='register' AND created_at > $one_min_ago"));
    if ($rate_check && intval($rate_check['cnt']) > 0) {
        return array(array('code' => strval(ApiError::VERIFY_RATE_LIMITED),
            'msg' => '发送过于频繁，请1分钟后再试。'));
    }

    // 标记旧的同邮箱注册验证码为已使用
    mysqli_query($con,
        "UPDATE email_verification SET used=1
         WHERE email='$email_esc' AND type='register' AND used=0");

    $code = Mailer::generateCode();
    $now = time();
    $expires = $now + CAPUBBS_VERIFY_CODE_EXPIRE * 60;

    mysqli_query($con,
        "INSERT INTO email_verification (username, email, code, type, created_at, expires_at)
         VALUES ('', '$email_esc', '$code', 'register', $now, $expires)");

    $result = Mailer::sendVerifyCode($email, $code);
    if (!$result['success']) {
        return jiekoufunc_report('8', '邮件发送失败: ' . $result['message']);
    }

    return array(array('code' => '0', 'msg' => '验证码已发送，请检查邮箱。'));
}

function jiekoufunc_sendVerifyCode($con, $token, $params) {
    if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
        return array(array('code' => strval(ApiError::FEATURE_DISABLED),
            'msg' => '邮箱验证功能已被管理员关闭。'));
    }

    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }
    $username = $user['username'];

    $type = isset($params['type']) ? $params['type'] : 'verify_existing';
    if (!in_array($type, array('register', 'change_email', 'verify_existing'))) {
        return jiekoufunc_report('14', '无效的验证类型。');
    }

    if ($type === 'change_email') {
        $target_email = isset($params['new_email']) ? $params['new_email'] : '';
        if (empty($target_email)) {
            return jiekoufunc_report('3', '缺少新邮箱地址。');
        }
        if ($target_email === $user['mail']) {
            return jiekoufunc_report('3', '新邮箱与当前邮箱相同，无需更换。');
        }
    } else {
        $username_esc = mysqli_real_escape_string($con, $username);
        $res = mysqli_fetch_array(mysqli_query($con,
            "SELECT mail FROM userinfo WHERE username='$username_esc'"));
        $target_email = $res ? $res['mail'] : '';
        if (empty($target_email)) {
            return jiekoufunc_report('3', '您尚未设置邮箱，请先在编辑资料页面设置邮箱。');
        }
    }

    if (!jiekoufunc_is_pku_email($target_email)) {
        return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN),
            'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn。'));
    }

    if (!jiekoufunc_can_send_code($con, $username, $target_email, $type)) {
        return array(array('code' => strval(ApiError::VERIFY_RATE_LIMITED),
            'msg' => '发送过于频繁，请1分钟后再试。'));
    }

    jiekoufunc_invalidate_codes($con, $username, $target_email, $type);

    $code = Mailer::generateCode();
    $now = time();
    $expires = $now + CAPUBBS_VERIFY_CODE_EXPIRE * 60;
    $username_esc = mysqli_real_escape_string($con, $username);
    $email_esc = mysqli_real_escape_string($con, $target_email);

    mysqli_query($con,
        "INSERT INTO email_verification (username, email, code, type, created_at, expires_at)
         VALUES ('$username_esc', '$email_esc', '$code', '$type', $now, $expires)");

    $result = Mailer::sendVerifyCode($target_email, $code);
    if (!$result['success']) {
        return jiekoufunc_report('8', '邮件发送失败: ' . $result['message']);
    }

    return array(array('code' => '0', 'msg' => '验证码已发送，请检查邮箱。'));
}

function jiekoufunc_verifyEmail($con, $token, $params) {
    if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
        return array(array('code' => strval(ApiError::FEATURE_DISABLED),
            'msg' => '邮箱验证功能已被管理员关闭。'));
    }

    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }
    $username = $user['username'];

    $code = isset($params['code']) ? $params['code'] : '';
    $type = isset($params['type']) ? $params['type'] : 'verify_existing';
    if (empty($code)) {
        return jiekoufunc_report('3', '缺少验证码。');
    }

    $username_esc = mysqli_real_escape_string($con, $username);
    $code_esc = mysqli_real_escape_string($con, $code);
    $result = mysqli_fetch_array(mysqli_query($con,
        "SELECT * FROM email_verification
         WHERE username='$username_esc' AND code='$code_esc' AND type='$type'
         AND used=0 ORDER BY id DESC LIMIT 1"));

    if (!$result) {
        return array(array('code' => strval(ApiError::VERIFY_CODE_INVALID),
            'msg' => '验证码无效。'));
    }

    if (intval($result['expires_at']) < time()) {
        return array(array('code' => strval(ApiError::VERIFY_CODE_EXPIRED),
            'msg' => '验证码已过期，请重新发送。'));
    }

    $verification_id = intval($result['id']);
    $verified_email = $result['email'];
    mysqli_query($con, "UPDATE email_verification SET used=1 WHERE id=$verification_id");

    if ($type === 'change_email') {
        $email_esc = mysqli_real_escape_string($con, $verified_email);
        mysqli_query($con,
            "UPDATE userinfo SET mail='$email_esc', verified=1 WHERE username='$username_esc'");
    } else {
        mysqli_query($con,
            "UPDATE userinfo SET verified=1 WHERE username='$username_esc'");
    }

    return array(array('code' => '0', 'msg' => '邮箱验证成功。'));
}

function jiekoufunc_sendResetPasswordCode($con, $params) {
    if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
        return array(array('code' => strval(ApiError::FEATURE_DISABLED),
            'msg' => '邮箱验证功能已被管理员关闭。'));
    }

    $email = isset($params['email']) ? $params['email'] : '';
    if (empty($email)) {
        return jiekoufunc_report('3', '请输入邮箱地址。');
    }

    if (!jiekoufunc_is_pku_email($email)) {
        return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN),
            'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn。'));
    }

    $email_esc = mysqli_real_escape_string($con, $email);
    $res = mysqli_fetch_array(mysqli_query($con,
        "SELECT username FROM userinfo WHERE mail='$email_esc' AND verified=1 LIMIT 1"));

    // 不管邮箱是否匹配，统一返回成功，避免邮箱枚举
    if (!$res) {
        return array(array('code' => '0', 'msg' => '验证码已发送，请检查邮箱。'));
    }
    $username = $res['username'];

    $type = 'reset_password';
    if (!jiekoufunc_can_send_code($con, $username, $email, $type)) {
        return array(array('code' => strval(ApiError::VERIFY_RATE_LIMITED),
            'msg' => '发送过于频繁，请1分钟后再试。'));
    }

    jiekoufunc_invalidate_codes($con, $username, $email, $type);

    $code = Mailer::generateCode();
    $now = time();
    $expires = $now + CAPUBBS_VERIFY_CODE_EXPIRE * 60;
    $username_esc = mysqli_real_escape_string($con, $username);

    mysqli_query($con,
        "INSERT INTO email_verification (username, email, code, type, created_at, expires_at)
         VALUES ('$username_esc', '$email_esc', '$code', '$type', $now, $expires)");

    $result = Mailer::sendVerifyCode($email, $code);
    if (!$result['success']) {
        return jiekoufunc_report('8', '邮件发送失败: ' . $result['message']);
    }

    return array(array('code' => '0', 'msg' => '验证码已发送，请检查邮箱。'));
}

function jiekoufunc_resetPasswordByEmail($con, $params) {
    if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
        return array(array('code' => strval(ApiError::FEATURE_DISABLED),
            'msg' => '邮箱验证功能已被管理员关闭。'));
    }

    $email = isset($params['email']) ? $params['email'] : '';
    $code = isset($params['code']) ? $params['code'] : '';
    if (empty($email) || empty($code)) {
        return jiekoufunc_report('3', '缺少参数。');
    }

    if (!jiekoufunc_is_pku_email($email)) {
        return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN),
            'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn。'));
    }

    $email_esc = mysqli_real_escape_string($con, $email);
    $code_esc = mysqli_real_escape_string($con, $code);
    $result = mysqli_fetch_array(mysqli_query($con,
        "SELECT * FROM email_verification
         WHERE email='$email_esc' AND code='$code_esc' AND type='reset_password'
         AND used=0 ORDER BY id DESC LIMIT 1"));

    if (!$result) {
        return array(array('code' => strval(ApiError::VERIFY_CODE_INVALID),
            'msg' => '验证码无效。'));
    }

    if (intval($result['expires_at']) < time()) {
        return array(array('code' => strval(ApiError::VERIFY_CODE_EXPIRED),
            'msg' => '验证码已过期，请重新发送。'));
    }

    $verification_id = intval($result['id']);
    $username = $result['username'];
    mysqli_query($con, "UPDATE email_verification SET used=1 WHERE id=$verification_id");

    $username_esc = mysqli_real_escape_string($con, $username);
    $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    $newPassword = '';
    for ($i = 0; $i < 8; $i++) {
        $newPassword .= $chars[mt_rand(0, strlen($chars) - 1)];
    }
    $newPasswordHash = md5($newPassword);
    mysqli_query($con,
        "UPDATE userinfo SET password='$newPasswordHash', tokentime=0 WHERE username='$username_esc'");

    Mailer::sendPasswordResetNotice($email, $username, $newPassword);

    return array(array('code' => '0', 'msg' => '密码已重置，新密码已发送至您的邮箱，请登录后尽快修改。'));
}

function jiekoufunc_muteEmail($con, $token, $params) {
    if (!CAPUBBS_ENABLE_EMAIL_MUTE) {
        return array(array('code' => strval(ApiError::FEATURE_DISABLED),
            'msg' => '邮箱禁言功能已被管理员关闭。'));
    }

    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }
    $operator = $user['username'];

    $email = isset($params['email']) ? $params['email'] : '';
    if (empty($email)) {
        return jiekoufunc_report('3', '缺少邮箱地址。');
    }

    if (!jiekoufunc_is_pku_email($email)) {
        return array(array('code' => strval(ApiError::INVALID_EMAIL_DOMAIN),
            'msg' => '仅支持 学号@*.pku.edu.cn 或 学号@bjmu.edu.cn。'));
    }

    $email_esc = mysqli_real_escape_string($con, $email);
    $check = mysqli_fetch_array(mysqli_query($con,
        "SELECT id, active FROM email_mutes WHERE email='$email_esc' LIMIT 1"));
    if ($check) {
        if (intval($check['active']) === 1) {
            return array(array('code' => strval(ApiError::EMAIL_ALREADY_MUTED),
                'msg' => '该邮箱已被禁言。'));
        }
        // 之前禁言过但已解除，重新激活
        $mute_id = intval($check['id']);
        $reason = isset($params['reason']) ? mysqli_real_escape_string($con, $params['reason']) : '';
        $operator_esc = mysqli_real_escape_string($con, $operator);
        $now = time();
        mysqli_query($con,
            "UPDATE email_mutes SET muted_by='$operator_esc', reason='$reason', created_at=$now, active=1 WHERE id=$mute_id");
        return array(array('code' => '0', 'msg' => '已禁言邮箱 ' . $email));
    }

    $reason = isset($params['reason']) ? mysqli_real_escape_string($con, $params['reason']) : '';
    $operator_esc = mysqli_real_escape_string($con, $operator);
    $now = time();
    mysqli_query($con,
        "INSERT INTO email_mutes (email, muted_by, reason, created_at)
         VALUES ('$email_esc', '$operator_esc', '$reason', $now)");

    return array(array('code' => '0', 'msg' => '已禁言邮箱 ' . $email));
}

function jiekoufunc_unmuteEmail($con, $token, $params) {
    if (!CAPUBBS_ENABLE_EMAIL_MUTE) {
        return array(array('code' => strval(ApiError::FEATURE_DISABLED),
            'msg' => '邮箱禁言功能已被管理员关闭。'));
    }

    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }

    $email = isset($params['email']) ? $params['email'] : '';
    if (empty($email)) {
        return jiekoufunc_report('3', '缺少邮箱地址。');
    }

    $email_esc = mysqli_real_escape_string($con, $email);
    mysqli_query($con, "UPDATE email_mutes SET active=0 WHERE email='$email_esc' AND active=1");
    if (mysqli_affected_rows($con) === 0) {
        return array(array('code' => strval(ApiError::EMAIL_NOT_MUTED),
            'msg' => '该邮箱未被禁言。'));
    }

    return array(array('code' => '0', 'msg' => '已取消禁言邮箱 ' . $email));
}

function jiekoufunc_listEmailMutes($con, $token) {
    if (!CAPUBBS_ENABLE_EMAIL_MUTE) {
        return array(array('code' => strval(ApiError::FEATURE_DISABLED),
            'msg' => '邮箱禁言功能已被管理员关闭。'));
    }

    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '会话超时，请重新登录。');
    }

    $result = mysqli_query($con, "SELECT * FROM email_mutes WHERE active=1 ORDER BY created_at DESC");
    $infos = array();
    while ($res = mysqli_fetch_array($result)) {
        $info = array();
        foreach ($res as $key => $value) {
            if (is_long($key)) continue;
            $info[$key] = $value;
        }
        $infos[] = $info;
    }
    return $infos;
}

function jiekoufunc_toggleEmailVisible($con, $token, $params) {
    $a = jiekoufunc_token2user($con, $token);
    if (!$a) {
        return array(array('code' => '1', 'msg' => '会话超时，请重新登录。'));
    }
    $username = $a['username'];
    $username_esc = mysqli_real_escape_string($con, $username);
    $email_visible = isset($params['email_visible']) ? intval($params['email_visible']) : 0;

    $statement = "update userinfo set email_visible=$email_visible where username='$username_esc'";
    mysqli_query($con, $statement);
    if (mysqli_error($con)) {
        return array(array('code' => '1', 'error' => mysqli_error($con)));
    }
    return array(array('code' => '0'));
}

function jiekoufunc_verifiedCount($con) {
    if (!CAPUBBS_ENABLE_EMAIL_VERIFY) {
        return array(array('count' => '0'));
    }
    $result = mysqli_fetch_array(mysqli_query($con, "SELECT COUNT(*) as cnt FROM userinfo WHERE verified=1"));
    $count = intval($result['cnt']);
    return array(array('count' => strval($count)));
}
