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

$GLOBALS['validtime']  = 60 * 60 * 24 * 7;   // 7 days
$GLOBALS['attachroot'] = __DIR__ . "/../bbs/attachment/";
$GLOBALS['_jiekoufunc_nowuser'] = null;

// ============================================================================
//  DB helper functions
// ============================================================================

function jiekoufunc_token2user($con, $token) {
    $nowtime = time();
    if (!$token) return null;
    if (strstr($token, "'") != "") {
        return null;
    }
    $statement = "select username,score,star from userinfo where token='$token' && $nowtime<=tokentime+{$GLOBALS['validtime']}";
    $result = mysqli_query($con, $statement);
    return mysqli_fetch_array($result);
}

function jiekoufunc_getrights($con, $bid, $token) {
    $time = time();
    $statement = "select username, rights, lastip from userinfo where token='$token' && $time<=tokentime+{$GLOBALS['validtime']}";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0)
        return array(-1, "", "", 0);
    $res = mysqli_fetch_array($results);
    $username = $res[0];
    $rights = intval($res[1]);
    $ip = $res[2];

    if ($rights >= 3) {
        return array(2, $username, $ip, $rights);
    }

    $able = 0;
    if ($bid > 0) {
        $statement = "select m1,m2,m3,m4 from boardinfo where bid=$bid";
        $results = mysqli_query($con, $statement);
        $res = mysqli_fetch_array($results);
        for ($i = 0; $i <= 3; $i++) {
            if ($res[$i] == $username) $able = 1;
        }
    }
    return array($able, $username, $ip, $rights);
}

function jiekoufunc__userexists($con, $user) {
    if (strstr($user, "'") != "") return false;
    $statement = "select * from userinfo where username='$user' limit 1";
    if (mysqli_num_rows(mysqli_query($con, $statement)) == 0) {
        return false;
    } else {
        return true;
    }
}

function jiekoufunc_insertmsg($con, $from, $to, $text, $bid, $tid, $pid, $ruser, $rmsg) {
    $time = time();
    $from = mysqli_real_escape_string($con, $from);
    $to = mysqli_real_escape_string($con, $to);
    $text = mysqli_real_escape_string($con, $text);
    $ruser = mysqli_real_escape_string($con, $ruser);
    $rmsg = mysqli_real_escape_string($con, $rmsg);
    $statement = "insert into messages (sender,receiver,text,time,rbid,rtid,rpid,ruser,rmsg) values('$from','$to','$text',$time,$bid,$tid,$pid,'$ruser','$rmsg')";
    if (mysqli_query($con, $statement)) {
        $statement = "update userinfo set newmsg=newmsg+1 where username='$to' limit 1";
        mysqli_query($con, $statement);
        return true;
    } else {
        return false;
    }
}

function jiekoufunc_updatestar($con, $username) {
    $statement = "select post,reply,other2 from userinfo where username='$username'";
    $results = mysqli_query($con, $statement);
    $res = mysqli_fetch_array($results);
    $post = intval($res['post']);
    $reply = intval($res['reply']);
    $total = $post + $reply;
    $star = 1;
    if ($total < 20) $star = 1;
    elseif ($total < 109) $star = 2;
    elseif ($total < 317) $star = 3;
    elseif ($total < 675) $star = 4;
    elseif ($total < 1278) $star = 5;
    elseif ($total < 2303) $star = 6;
    elseif ($total < 3550) $star = 7;
    elseif ($total < 4885) $star = 8;
    else $star = 9;
    $ss = intval(isset($res['other2']) ? $res['other2'] : 0);
    if ($ss != "" && $ss >= 1 && $ss <= 9) $star = $ss;
    $statement = "update userinfo set star=$star where username='$username'";
    mysqli_query($con, $statement);
}

function jiekoufunc_search_replace_exec_at($con, $text, $bid, $tid, $pid, $username, $tidtitle) {
    $matches = array();
    preg_match_all("#\[at\](.+?)\[\/at\]#", $text, $matches, PREG_SET_ORDER);
    foreach ($matches as $one) {
        $str = $one[1];
        if (jiekoufunc__userexists($con, $str)) {
            jiekoufunc_insertmsg($con, "system", $str, "at", $bid, $tid, $pid, $username, $tidtitle);
        }
    }
    preg_match_all("#\[quote=(.+?)\](.+?)\[\/quote\]#", $text, $matches, PREG_SET_ORDER);
    foreach ($matches as $one) {
        $str = $one[1];
        if (jiekoufunc__userexists($con, $str)) {
            jiekoufunc_insertmsg($con, "system", $str, "quote", $bid, $tid, $pid, $username, $tidtitle);
        }
    }
    return $text;
}

function jiekoufunc__delattach($con, $id) {
    $statement = "select * from attachments where id=$id limit 1";
    $result = mysqli_query($con, $statement);
    $ainfo = mysqli_fetch_array($result);
    if (!$ainfo) {
        return false;
    }
    if ($ainfo['path']) {
        if (!file_exists($GLOBALS['attachroot'] . $ainfo['path']) || true) {
            $statement = "update attachments set uploader=concat(uploader, '|删除') where id=$id limit 1";
            mysqli_query($con, $statement);
            if (!mysqli_error($con)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// ============================================================================
//  Output-formatting helpers
// ============================================================================

/**
 * Return an error info block (replaces old report() which echoed + exited).
 */
function jiekoufunc_report($code, $msg) {
    return array(array('code' => strval($code), 'msg' => $msg));
}

/**
 * Run a SQL statement and return all rows as an array of assoc arrays.
 * Replaces the old view_bbs() which echoed XML.
 */
function jiekoufunc_view_bbs_array($con, $statement) {
    $results = mysqli_query($con, $statement);
    $infos = array();
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

/**
 * Fetch user profile as array. Replaces the old view_user() which echoed XML.
 */
function jiekoufunc_view_user_array($con, $username) {
    static $cache = array();
    $username = mysqli_real_escape_string($con, $username);
    if (isset($cache[$username])) {
        return $cache[$username];
    }
    $statement = "select * from userinfo where username='$username'";
    $results = mysqli_query($con, $statement);
    $infos = array();
    while ($res = mysqli_fetch_array($results)) {
        $info = array();
        foreach ($res as $key => $value) {
            if (is_long($key)) continue;
            if ($key == "password") continue;
            if ($key == "token") continue;
            if ($key == "tokentime") continue;
            if ($key == "lastpost") continue;
            if ($key == "nowboard") continue;
            $info[$key] = $value;
        }
        enrich_user_sigs($con, $username, $info);
        $infos[] = $info;
    }
    $cache[$username] = $infos;
    return $infos;
}

// ============================================================================
//  Validation helpers
// ============================================================================

/**
 * Validate token and perform auto daily sign-in.
 * Returns username (string or null). Extracted from jiekouapi.php preamble.
 */
function jiekoufunc_validate_token_and_sign($con, $token, $ip) {
    $time = time();
    $nowtime = $time;
    $token = mysqli_real_escape_string($con, $token);
    $statement = "select username,star,rights,lastpost from userinfo where token='$token' && $time<=tokentime+{$GLOBALS['validtime']}";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) > 0) {
        $res = mysqli_fetch_array($results);
        $username = is_array($res) ? $res[0] : null;
    } else {
        $username = null;
    }

    if ($username) {
        $today = date("Y-m-d");

        if ($ip != "")
            $statement = "update userinfo set tokentime=$nowtime, token='$token', lastip='$ip',lastdate='$today' where username='$username'";
        else
            $statement = "update userinfo set tokentime=$nowtime, token='$token', lastdate='$today' where username='$username'";

        mysqli_query($con, $statement);

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
    return $username;
}

/**
 * Check delay time between posts. Returns null on success, error array on failure.
 */
function jiekoufunc_checkDelayTime($time, $star, $rights, $lastpost, $ip) {
    $inschool = true;
    $delta = 180;
    if ($inschool || $rights >= 1 || $star >= 3)
        $delta = 15;
    if ($time - $lastpost >= 0 && $time - $lastpost <= $delta) {
        if ($inschool)
            $msg = '两次发表/回复的时间间隔不能少于15秒';
        else
            $msg = '您的ip位于校外，两次发表/回复的时间间隔不能少于3分钟';
        return array(array('code' => '2', 'msg' => $msg . '！'));
    }
    return null; // OK
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
    $nowtime = time();
    if ($token == "") {
        return array(array('username' => '', 'rights' => '0'));
    }
    $statement = "select username,rights from userinfo where token='$token' && $nowtime<=tokentime+{$GLOBALS['validtime']}";
    $result = mysqli_query($con, $statement);
    if (mysqli_num_rows($result) == 0) {
        return array(array('username' => '', 'rights' => '0'));
    }
    $res = mysqli_fetch_row($result);
    return array(array('username' => $res[0], 'rights' => $res[1]));
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
    $statement = "select * from threads where bid=$bid && tid=$tid";
    return jiekoufunc_view_bbs_array($con, $statement);
}

function jiekoufunc_recentpost($con, $view, $limit_raw = '') {
    $view = mysqli_real_escape_string($con, $view);
    $limit_val = _parse_limit($limit_raw, 10);
    $limit_clause = ($limit_val === null) ? '' : " limit 0,$limit_val";
    $results = mysqli_query($con, "select bid,tid,pid,title,author,replytime as timestamp from posts where author='$view' and pid=1 order by replytime desc$limit_clause");
    $infos = array();
    $infos[] = array('nowuser' => '');
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

function jiekoufunc_recentreply($con, $view, $limit_raw = '') {
    $view = mysqli_real_escape_string($con, $view);
    $limit_val = _parse_limit($limit_raw, 10);
    $limit_clause = ($limit_val === null) ? '' : " limit 0,$limit_val";
    $results = mysqli_query($con, "select title, bid, tid, pid, updatetime from posts where author='$view' order by updatetime desc$limit_clause");
    $infos = array();
    $infos[] = array('nowuser' => '');
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

function jiekoufunc_rights($con, $bid, $token) {
    $a = jiekoufunc_getrights($con, $bid, $token);
    return array(array('username' => $a[1], 'code' => strval($a[0])));
}

function jiekoufunc_getpages($con, $bid, $tid) {
    if ($tid == 0) {
        $statement = "select count(*) from threads where bid=$bid";
        $results = mysqli_query($con, $statement);
        $res = mysqli_fetch_row($results);
        $num = intval($res[0]);
        $pages = ceil($num / 25);
    } else {
        $statement = "select reply from threads where bid=$bid && tid=$tid";
        $results = mysqli_query($con, $statement);
        $res = mysqli_fetch_row($results);
        $num = intval($res[0]);
        $pages = ceil(($num + 1) / 12);
    }
    return array(array('code' => '0', 'pages' => strval($pages)));
}

function jiekoufunc_getlznum($con, $bid, $tid) {
    $author = "";
    $statement = "select author from threads where bid=$bid && tid=$tid";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) != 0) {
        $result = mysqli_fetch_row($results);
        $author = mysqli_real_escape_string($con, $result[0]);
    }
    if ($author == "") {
        return array(array('num' => '0'));
    }
    $statement = "select pid from posts where bid=$bid && tid=$tid && author='$author'";
    $results = mysqli_query($con, $statement);
    $num = mysqli_num_rows($results);
    return array(array('num' => strval($num)));
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
        'sign'   => strval($sign_num),
        'online' => strval($online_num),
        'maxnum' => strval($maxnum),
        'time'   => date("Y-m-d", $thattime)
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
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '尚未登录');
    }
    $statement = "select * from posts where bid=$bid and tid=$tid and pid=$pid limit 1";
    $result = mysqli_query($con, $statement);
    $info = mysqli_fetch_array($result);
    if (!$info) {
        return jiekoufunc_report('4', '贴子不存在');
    }
    if ($info['author'] != $user['username']) {
        $rights = jiekoufunc_getrights($con, $bid, $token);
        if ($rights[0] < 1) {
            return jiekoufunc_report('2', '无权编辑');
        }
    }
    $infos = array();
    $infos[] = array('code' => '0');
    // user info
    $user_info = array();
    foreach ($user as $key => $value) {
        if (is_long($key)) continue;
        if ($key == "password") continue;
        if ($key == "token") continue;
        if ($key == "tokentime") continue;
        if ($key == "lastpost") continue;
        if ($key == "nowboard") continue;
        $user_info[$key] = $value;
    }
    $infos[] = $user_info;
    // post info
    $post_info = array();
    foreach ($info as $key => $value) {
        if (is_long($key)) continue;
        $post_info[$key] = $value;
    }
    $infos[] = $post_info;
    return $infos;
}

function jiekoufunc_currentUserInfo($con, $token) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(array());
    }
    return jiekoufunc_view_user_array($con, $user['username']);
}

function jiekoufunc_msg($con, $token, $type, $params) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(array('code' => '1', 'msg' => '尚未登录'));
    }
    $username = mysqli_real_escape_string($con, $user['username']);
    $p = isset($params['p']) ? $params['p'] : '';

    $result = mysqli_fetch_array(mysqli_query($con, "select count(1) as c from messages where receiver='$username' and sender='system' and hasread=0"));
    $sysmsg = $result['c'];
    $result = mysqli_fetch_array(mysqli_query($con, "select count(1) as c from messages where receiver='$username' and sender='system'"));
    $systotal = $result['c'];
    if (isset($params['to']) && $params['to']) {
        $to = $params['to'];
        $statement = "select count(1) as c from messages where receiver='$username' and sender!='system' and sender!='$to' and hasread=0";
    } else {
        $statement = "select count(1) as c from messages where receiver='$username' and sender!='system' and hasread=0";
    }
    $result = mysqli_fetch_array(mysqli_query($con, $statement));
    $prvmsg = $result['c'];

    $infos = array();
    $infos[] = array('code' => '0', 'sysmsg' => strval($sysmsg), 'prvmsg' => strval($prvmsg), 'systotal' => strval($systotal));

    if ($type == "system") {
        if ($p < 1) $p = 1;
        $limit = 10;
        $start = $limit * ($p - 1);
        $result = mysqli_query($con, "select * from messages where receiver='$username' and sender='system' order by hasread,time desc limit $start,$limit");
        while (($one = mysqli_fetch_array($result)) != null) {
            $username2 = $one['ruser'];
            $msgtype = $one['text'];
            $title = $one['rmsg'];
            if ($msgtype != "reply" && $msgtype != "at" && $msgtype != "replylzl" && $msgtype != "replylzlreply" && $msgtype != "quote") {
                $title = $msgtype;
                $msgtype = "plain";
            }
            $rpid = intval($one['rpid']);
            $page = ceil($rpid / 12);
            $url = "/bbs/content/?bid=" . $one['rbid'] . "&tid=" . $one['rtid'] . "&p=$page#$rpid";
            $msgtime = $one['time'];
            $hasread = $one['hasread'];
            $infos[] = array(
                'username' => $username2, 'type' => $msgtype, 'title' => $title,
                'url' => $url, 'time' => strval($msgtime), 'hasread' => strval($hasread)
            );
        }
        mysqli_query($con, "update messages set hasread=1 where receiver='$username' and sender='system' and hasread=0");
    } elseif ($type == "private") {
        $ans = array();
        $senders = array();
        $result = mysqli_query($con, "select sender,group_concat(time order by time desc),group_concat(hasread) from messages where receiver='$username' and sender!='system' group by sender order by hasread,time desc");
        while ($one = mysqli_fetch_array($result)) {
            array_push($ans, $one);
            array_push($senders, $one[0]);
        }
        $senderarea = "(";
        for ($i = 0; $i < count($senders); $i++) {
            $senderarea = $senderarea . "'" . $senders[$i] . "',";
        }
        $senderarea = substr($senderarea, 0, strlen($senderarea) - 1) . ")";
        if (count($senders) == 0) {
            $statement = "select receiver,group_concat(time order by time desc) from messages where sender='$username' group by receiver order by hasread,time desc";
        } else {
            $statement = "select receiver,group_concat(time order by time desc) from messages where sender='$username' and receiver not in $senderarea group by receiver order by hasread,time desc";
        }
        $result = mysqli_query($con, $statement);
        while ($one = mysqli_fetch_array($result)) {
            $ans[] = $one;
        }
        for ($i = 0; $i < count($ans); $i++) {
            $times = $ans[$i][1];
            $times = explode(",", $times);
            $ans[$i][1] = $times[0];
        }
        usort($ans, "jiekoufunc_comp");
        for ($i = 0; $i < count($ans); $i++) {
            $one = $ans[$i];
            $sender = $one[0];
            if (empty($one[2]) && $one[2] !== "0") {
                $hasread = "";
            } else {
                $hasread = $one[2];
            }
            $number = substr_count($hasread, "0");
            $textresult = mysqli_fetch_array(mysqli_query($con, "select text,time from messages where (receiver='$username' and sender='$sender') or (receiver='$sender' and sender='$username') order by time desc limit 1"));
            $text = $textresult[0];
            $msgtime = $textresult[1];
            $shrink = isset($params['shrink']) ? $params['shrink'] : '';
            if ($shrink != "no" && mb_strlen($text, "utf-8") > 30) {
                $text = mb_substr($text, 0, 30, "utf-8") . "......";
            }
            $tresult = mysqli_fetch_array(mysqli_query($con, "select count(1) as c from messages where (receiver='$username' and sender='$sender') or (receiver='$sender' and sender='$username')"));
            $totalnum = $tresult['c'];
            $infos[] = array(
                'username' => $sender, 'text' => $text, 'time' => strval($msgtime),
                'number' => strval($number), 'totalnum' => strval($totalnum)
            );
        }
    } elseif ($type == "chat") {
        $to = isset($params['to']) ? $params['to'] : '';
        $result = mysqli_query($con, "select * from messages where (receiver='$username' and sender='$to') or (sender='$username' and receiver='$to') order by time");
        while ($one = mysqli_fetch_array($result)) {
            $atype = $one['sender'] == $username ? "send" : "get";
            $text = $one['text'];
            $msgtime = $one['time'];
            $infos[] = array('type' => $atype, 'text' => $text, 'time' => strval($msgtime));
        }
        mysqli_query($con, "update messages set hasread=1 where receiver='$username' and sender='$to' and hasread=0");
    }
    $result = mysqli_fetch_array(mysqli_query($con, "select count(1) as c from messages where hasread=0 and receiver='$username'"));
    $num = $result['c'];
    mysqli_query($con, "update userinfo set newmsg=$num where username='$username' limit 1");
    return $infos;
}

// ============================================================================
//  Business functions — Authentication
// ============================================================================

function jiekoufunc_login($con, $username_raw, $password, $ip, $params) {
    if (isset($params['md5']) && $params['md5'] == "yes") $password = md5($password);
    $username = mysqli_real_escape_string($con, $username_raw);
    $statement = "select password from userinfo where username='$username'";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) {
        return array(array('code' => '1', 'msg' => '用户不存在。'));
    }
    $res = mysqli_fetch_array($results);
    $psd = $res[0];
    if (strtoupper($psd) != strtoupper($password)) {
        return array(array('code' => '2', 'msg' => '密码错误。'));
    }
    $nowtime = time();
    $statement = "select token from userinfo where username='$username' && $nowtime<=tokentime+{$GLOBALS['validtime']}";
    $results = mysqli_query($con, $statement);
    $token = md5($username . $nowtime);
    if (mysqli_num_rows($results) != 0) {
        $res2 = mysqli_fetch_array($results);
        if (!is_null($res2[0]) && $res2[0] != '') {
            $token = $res2[0];
        }
    }
    $today = date("Y-m-d");
    $onlinetype = isset($params['onlinetype']) ? mysqli_real_escape_string($con, $params['onlinetype']) : '';
    $browser = isset($params['browser']) ? mysqli_real_escape_string($con, $params['browser']) : '';
    $system_str = isset($params['system']) ? mysqli_real_escape_string($con, $params['system']) : '';
    $logininfo = "";
    if ($onlinetype == "web") $logininfo = $browser;
    if ($onlinetype == "android" || $onlinetype == "ios") $logininfo = $system_str;

    if ($ip != "")
        $statement = "update userinfo set tokentime=$nowtime, token='$token', nowboard=null, lastip='$ip',lastdate='$today',onlinetype='$onlinetype',logininfo='$logininfo' where username='$username'";
    else
        $statement = "update userinfo set tokentime=$nowtime, token='$token', nowboard=null, lastdate='$today',onlinetype='$onlinetype',logininfo='$logininfo' where username='$username'";
    mysqli_query($con, $statement);

    jiekoufunc_auto_sign($con, $username);

    return array(array('code' => '0', 'username' => $username, 'token' => $token));
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
    $today = date("Y-m-d");
    $statement = "update userinfo set nowboard=null, lastip='$ip',lastdate='$today' where token='$token'";
    mysqli_query($con, $statement);
    return array(array('code' => '0'));
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
    $mail = mysqli_real_escape_string($con, sanitize_xml($mail_raw));

    $onlinetype = isset($params['onlinetype']) ? mysqli_real_escape_string($con, $params['onlinetype']) : '';
    $browser = isset($params['browser']) ? mysqli_real_escape_string($con, $params['browser']) : '';
    $system_val = isset($params['system']) ? mysqli_real_escape_string($con, $params['system']) : '';
    $logininfo = "";
    if ($onlinetype == "web") $logininfo = $browser;
    if ($onlinetype == "android" || $onlinetype == "ios") $logininfo = $system_val;

    $statement = "insert into userinfo values ('$username','$password','$token',$time,'$sex','$icon','$intro','$sig1','$sig2','$sig3','$hobby','$qq_val','$mail'," .
                 "'$place','$date','$date','$ip',1,0,0,0,0,0,0,0,0,NULL,NULL,'$onlinetype','$logininfo',null,null,null,null,null,null,null)";
    mysqli_query($con, $statement);
    $error = mysqli_errno($con);
    if ($error != 0) {
        return array(array('code' => strval($error), 'msg' => mysqli_error($con)));
    }
    // Also insert into user_sig table
    $sig_type_vals = array(1 => $sig1_type, 2 => $sig2_type, 3 => $sig3_type);
    $sig_vals = array(1 => $sig1, 2 => $sig2, 3 => $sig3);
    $upsert_err = upsert_user_sigs($con, $username, $sig_vals, $sig_type_vals);
    if ($upsert_err !== null) {
        return array(array('code' => '1', 'msg' => '保存签名档失败: ' . $upsert_err));
    }
    return array(array('code' => '0', 'username' => $username, 'token' => $token));
}

// ============================================================================
//  Business functions — Content writing
// ============================================================================

function jiekoufunc_post($con, $token, $bid, $ip, $attachs, $params) {
    $time = time();
    $pid = 1;
    $statement = "select username,star,rights,lastpost from userinfo where token='$token' && $time<=tokentime+{$GLOBALS['validtime']}";
    $results = mysqli_query($con, $statement);
    $res = mysqli_fetch_array($results);
    $username = $res[0];
    $star = intval($res[1]);
    $rights = intval($res[2]);
    $lastpost = intval($res[3]);
    $delay_err = jiekoufunc_checkDelayTime($time, $star, $rights, $lastpost, $ip);
    if ($delay_err !== null) return $delay_err;

    $statement = "select max(tid) as m from (select tid from threads where bid=$bid union select tid from trash_threads where bid=$bid) as t";
    $tid = intval(mysqli_fetch_row(mysqli_query($con, $statement))[0]) + 1;
    $title = isset($params['title']) ? $params['title'] : '';
    if (mb_strlen($title, 'utf-8') >= 43)
        $title = mb_substr($title, 0, 40, 'utf-8') . "...";
    $text = isset($params['text']) ? $params['text'] : '';
    $type = isset($params['type']) ? mysqli_real_escape_string($con, $params['type']) : '';
    $attachs_esc = mysqli_real_escape_string($con, $attachs);
    $sig = isset($params['sig']) ? intval($params['sig']) : 0;
    $posttime = date('Y-m-d');
    $title = html_entity_decode($title);
    $text = html_entity_decode($text);
    $title = mysqli_real_escape_string($con, $title);
    $text = mysqli_real_escape_string($con, $text);
    $text = jiekoufunc_search_replace_exec_at($con, $text, $bid, $tid, 1, $username, $title);
    $statement = "insert into threads values ($bid,$tid,'$title','$username',null,0,0,1,0,0,0,$time,'$posttime')";
    mysqli_query($con, $statement);
    $statement = "insert into posts (bid,tid,pid,title,author,text,ishtml,attachs,replytime,updatetime,sig,ip,type,lzl) values ($bid,$tid,1,'$title','$username','$text','YES','$attachs_esc',$time,$time,$sig,'$ip','$type',0)";
    mysqli_query($con, $statement);
    $fid = mysqli_insert_id($con);
    if ($bid != 4)
        $statement = "update userinfo set post=post+1, lastpost=$time, tokentime=$time where username='$username'";
    else
        $statement = "update userinfo set water=water+1, lastpost=$time, tokentime=$time where username='$username'";
    mysqli_query($con, $statement);
    jiekoufunc_updatestar($con, $username);
    return array(array('code' => '0', 'bid' => strval($bid), 'tid' => strval($tid), 'pid' => strval($pid), 'fid' => strval($fid)));
}

function jiekoufunc_reply($con, $token, $bid, $tid, $ip, $attachs, $params) {
    $time = time();
    $statement = "select username,star,rights,lastpost from userinfo where token='$token' && $time<=tokentime+{$GLOBALS['validtime']}";
    $results = mysqli_query($con, $statement);
    $res = mysqli_fetch_array($results);
    $username = $res[0];
    $star = intval($res[1]);
    $rights = intval($res[2]);
    $lastpost = intval($res[3]);
    $delay_err = jiekoufunc_checkDelayTime($time, $star, $rights, $lastpost, $ip);
    if ($delay_err !== null) return $delay_err;

    $statement = "select activity_id, bid, tid, season_id, name, leader_username
        from season_threads_activity
        where bid=$bid and tid=$tid";
    $result_activity = mysqli_query($con, $statement);
    if (mysqli_num_rows($result_activity) != 0) {
        return array(array('code' => '3', 'msg' => '禁止直接回复报名帖！'));
    }

    $statement = "select pid from posts where bid=$bid && tid=$tid order by pid desc";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) {
        return array(array('code' => '3', 'msg' => '主题不存在！'));
    }
    $res = mysqli_fetch_array($results);
    $pid = intval($res[0]) + 1;
    $statement = "select locked,author,title from threads where bid=$bid && tid=$tid";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) {
        return array(array('code' => '3', 'msg' => '主题不存在！'));
    }
    $res = mysqli_fetch_array($results);
    $locked = intval($res[0]);
    $tidauthor = $res[1];
    $tidtitle = $res[2];

    if ($locked == 1) {
        return array(array('code' => '4', 'msg' => '主题已锁定。'));
    }
    $title = isset($params['title']) ? $params['title'] : '';
    $text = isset($params['text']) ? $params['text'] : '';
    $sig = isset($params['sig']) ? intval($params['sig']) : 0;
    $title = html_entity_decode($title);
    $text = html_entity_decode($text);
    $title = mysqli_real_escape_string($con, $title);
    $type = isset($params['type']) ? mysqli_real_escape_string($con, $params['type']) : '';
    $attachs_esc = mysqli_real_escape_string($con, $attachs);
    $text = mysqli_real_escape_string($con, $text);

    $text = jiekoufunc_search_replace_exec_at($con, $text, $bid, $tid, $pid, $username, $title);

    $statement = "insert into posts (bid,tid,pid,title,author,text,ishtml,attachs,replytime,updatetime,sig,ip,type,lzl) values ($bid,$tid,$pid,'$title','$username','$text','YES','$attachs_esc',$time,$time,$sig,'$ip','$type',0)";
    mysqli_query($con, $statement);
    $fid = mysqli_insert_id($con);
    if (mysqli_error($con)) {
        return array(array('code' => '8', 'msg' => 'error:' . mysqli_error($con)));
    }
    if ($attachs) {
        $attach_ids = array_filter(explode(" ", $attachs), 'strlen');
        if (!empty($attach_ids)) {
            $statement = "update attachments set ref=ref+1 where id in (" . join(",", $attach_ids) . ")";
            mysqli_query($con, $statement);
        }
    }
    $statement = "update threads set reply=reply+1, replyer='$username', timestamp=$time where bid=$bid && tid=$tid";
    mysqli_query($con, $statement);
    if ($bid != 4)
        $statement = "update userinfo set reply=reply+1, lastpost=$time, tokentime=$time where username='$username'";
    else
        $statement = "update userinfo set water=water+1, lastpost=$time, tokentime=$time where username='$username'";
    mysqli_query($con, $statement);
    jiekoufunc_updatestar($con, $username);
    if ($tidauthor != $username)
        jiekoufunc_insertmsg($con, "system", $tidauthor, "reply", $bid, $tid, $pid, $username, $tidtitle);

    return array(array('code' => '0', 'bid' => strval($bid), 'tid' => strval($tid), 'pid' => strval($pid), 'fid' => strval($fid)));
}

function jiekoufunc_edit($con, $token, $bid, $tid, $pid, $ip, $attachs, $params) {
    $time = time();
    $a = jiekoufunc_getrights($con, $bid, $token);
    if ($a[0] == -1) {
        return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
    }
    $statement = "select author, fid, text from posts where bid=$bid and tid=$tid and pid=$pid";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) {
        return array(array('code' => '3', 'msg' => '主题不存在！'));
    }
    $res = mysqli_fetch_array($results);
    $author = $res[0];
    $fid_edit = intval($res['fid']);
    $old_text = $res['text'];
    $username = $a[1];
    if ($a[0] == 0 && $username != $author) {
        return array(array('code' => '5', 'msg' => '权限不足！'));
    }

    $statement = "select locked from threads where bid=$bid && tid=$tid";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) {
        return array(array('code' => '3', 'msg' => '主题不存在！'));
    }
    $res = mysqli_fetch_array($results);
    $locked = intval($res[0]);
    if ($locked == 1) {
        return array(array('code' => '4', 'msg' => '主题已锁定。'));
    }

    $statement = "select activity_id, bid, tid, season_id, name, leader_username
        from season_threads_activity
        where bid=$bid and tid=$tid";
    $result_activity = mysqli_query($con, $statement);
    if (mysqli_num_rows($result_activity) != 0) {
        $res_act = mysqli_fetch_array($result_activity);
        if ($res_act["leader_username"] != $username || $pid != 1) {
            return array(array('code' => '5', 'msg' => '禁止编辑报名帖！'));
        }
    }

    // 保存编辑历史：将当前内容作为新版本插入版本链
    $old_text_esc = mysqli_real_escape_string($con, $old_text);

    // 查找当前头版本（最近一条历史记录）
    $stmt_head = "select version_id from post_edit_history
                  where fid=$fid_edit order by version_id desc limit 1";
    $res_head = mysqli_query($con, $stmt_head);
    $parent_id = (mysqli_num_rows($res_head) > 0)
        ? intval(mysqli_fetch_row($res_head)[0]) : 'NULL';

    $stmt_hist = "insert into post_edit_history
        (fid, bid, tid, pid, parent_id, text, author, source, edit_time, edit_by, edit_ip)
        values ($fid_edit, $bid, $tid, $pid, $parent_id,
                '$old_text_esc', '$author', 'edit', $time, '$username', '$ip')";
    mysqli_query($con, $stmt_hist);

    $title = isset($params['title']) ? $params['title'] : '';
    $text = isset($params['text']) ? $params['text'] : '';
    $type = isset($params['type']) ? mysqli_real_escape_string($con, $params['type']) : '';
    $attachs_esc = mysqli_real_escape_string($con, $attachs);
    $sig = isset($params['sig']) ? intval($params['sig']) : 0;
    $title = html_entity_decode($title);
    $text = html_entity_decode($text);
    $title = mysqli_real_escape_string($con, $title);
    $text = mysqli_real_escape_string($con, $text);
    $statement = "update posts set title='$title', author='$username', text='$text', ishtml='YES', sig=$sig, ip='$ip', type='$type', attachs='$attachs_esc', updatetime=$time where bid=$bid && tid=$tid && pid=$pid";
    mysqli_query($con, $statement);
    if (intval($pid) == 1) {
        $statement = "update threads set title='$title', author='$username' where bid=$bid && tid=$tid";
        mysqli_query($con, $statement);
    }
    $statement = "select pid from posts where bid=$bid && tid=$tid order by pid desc";
    $res = mysqli_query($con, $statement);
    $number = mysqli_num_rows($res);
    if (intval($pid) == intval($number)) {
        $statement = "update threads set replyer='$username' where bid=$bid && tid=$tid";
        mysqli_query($con, $statement);
    }
    return array(array('code' => '0', 'bid' => strval($bid), 'tid' => strval($tid), 'pid' => strval($pid)));
}

function jiekoufunc_threads_action($con, $token, $bid, $tid, $action) {
    $a = jiekoufunc_getrights($con, $bid, $token);
    if ($a[0] == -1) {
        return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
    }
    if ($a[0] == 0) {
        return array(array('code' => '5', 'msg' => '权限不足！'));
    }
    $statement = "select * from threads where bid=$bid && tid=$tid";
    if (mysqli_num_rows(mysqli_query($con, $statement)) == 0) {
        return array(array('code' => '3', 'msg' => '主题不存在！'));
    }
    if ($action == "lock")
        $statement = "update threads set locked=1-locked where bid=$bid && tid=$tid";
    elseif ($action == "top")
        $statement = "update threads set top=1-top where bid=$bid && tid=$tid";
    elseif ($action == "extr")
        $statement = "update threads set extr=1-extr where bid=$bid && tid=$tid";
    elseif ($action == "global_top_action") {
        $statement = "select bid, tid from thread_global_top where bid=$bid and tid=$tid";
        $results = mysqli_query($con, $statement);
        if (mysqli_num_rows($results) == 0) {
            $statement = "insert into thread_global_top (bid,tid) values ($bid,$tid)";
        } else {
            $statement = "delete from thread_global_top where bid=$bid and tid=$tid";
        }
        mysqli_query($con, $statement);
        return array(array('code' => '0'));
    }
    mysqli_query($con, $statement);
    if (mysqli_error($con)) {
        return array(array('code' => '2', 'error' => mysqli_error($con)));
    } else {
        if ($action == "extr") {
            $statement = "select author,extr from threads where bid=$bid && tid=$tid";
            $results = mysqli_query($con, $statement);
            $res = mysqli_fetch_row($results);
            $extr = intval($res[1]);
            $author = $res[0];
            if ($extr == 1) {
                $statement = "update userinfo set extr=extr+1 where username='$author'";
            } else {
                $statement = "update userinfo set extr=extr-1 where username='$author'";
            }
            mysqli_query($con, $statement);
        }
    }
    return array(array('code' => '0'));
}

function jiekoufunc_delete($con, $token, $bid, $tid, $pid) {
    $time = time();
    $a = jiekoufunc_getrights($con, $bid, $token);

    if ($a[0] == -1) {
        return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
    }
    $username = $a[1];
    $ip = $a[2];

    if ($pid == 0) {
        // ========== Delete entire thread ==========
        $statement = "select author, reply, title, replyer, click, guesture,
                             extr, top, locked, timestamp, postdate
                      from threads where bid=$bid && tid=$tid";
        $results = mysqli_query($con, $statement);
        if (mysqli_num_rows($results) == 0) {
            return array(array('code' => '3', 'msg' => '主题不存在！'));
        }
        $thread = mysqli_fetch_array($results);
        $author = $thread['author'];
        $replynum = intval($thread['reply']);
        if ($a[0] == 0 && ($username != $author || $replynum != 0)) {
            return array(array('code' => '5', 'msg' => '权限不足！'));
        }

        $statement = "select activity_id from season_threads_activity where bid=$bid and tid=$tid";
        $result = mysqli_query($con, $statement);
        if (mysqli_num_rows($result) != 0) {
            $row = mysqli_fetch_array($result);
            $activity_id = $row["activity_id"];

            $statement = "delete from season_threads_activity where bid=$bid and tid=$tid";
            mysqli_query($con, $statement);
            $statement = "delete from season_join_option_value where join_id in (select join_id from season_activity_join where activity_id=$activity_id)";
            mysqli_query($con, $statement);
            $statement = "delete from season_activity_join where activity_id=$activity_id";
            mysqli_query($con, $statement);
            $statement = "delete from season_option_case where option_id in (select id from season_activity_option where activity_id=$activity_id)";
            mysqli_query($con, $statement);
            $statement = "delete from season_activity_option where activity_id=$activity_id";
            mysqli_query($con, $statement);
            $statement = "delete from activity_join_remind where activity_id=$activity_id";
            mysqli_query($con, $statement);
            $statement = "delete from thread_global_top where bid=$bid and tid=$tid";
            mysqli_query($con, $statement);
        }

        // Save thread metadata to trash_threads
        $t_title    = mysqli_real_escape_string($con, isset($thread['title']) ? $thread['title'] : '');
        $t_author   = mysqli_real_escape_string($con, isset($thread['author']) ? $thread['author'] : '');
        $t_replyer  = isset($thread['replyer']) ? "'" . mysqli_real_escape_string($con, $thread['replyer']) . "'" : "NULL";
        $t_click    = intval(isset($thread['click'])    ? $thread['click']    : 0);
        $t_guesture = intval(isset($thread['guesture']) ? $thread['guesture'] : 0);
        $t_extr     = intval(isset($thread['extr'])     ? $thread['extr']     : 0);
        $t_top      = intval(isset($thread['top'])      ? $thread['top']      : 0);
        $t_locked   = intval(isset($thread['locked'])   ? $thread['locked']   : 0);
        $t_ts       = intval(isset($thread['timestamp']) ? $thread['timestamp'] : 0);
        $t_pd       = isset($thread['postdate']) ? "'" . mysqli_real_escape_string($con, $thread['postdate']) . "'" : "NULL";

        $stmt_th = "insert into trash_threads
            (bid, tid, title, author, replyer, click, reply, guesture,
             extr, top, locked, timestamp, postdate, deleter, deletetime, deleteip)
            values ($bid, $tid, '$t_title', '$t_author', $t_replyer, $t_click,
                    $replynum, $t_guesture, $t_extr, $t_top, $t_locked,
                    $t_ts, $t_pd, '$username', $time, '$ip')";
        mysqli_query($con, $stmt_th);

        // Save each post to trash_posts with ALL fields
        $stmt_posts = "select * from posts where bid=$bid && tid=$tid order by pid";
        $res_posts = mysqli_query($con, $stmt_posts);
        while ($row = mysqli_fetch_array($res_posts)) {
            $p_fid     = $row['fid'];
            $p_pid     = $row['pid'];
            $p_title   = mysqli_real_escape_string($con, $row['title']);
            $p_author  = mysqli_real_escape_string($con, $row['author']);
            $p_text    = mysqli_real_escape_string($con, $row['text']);
            $p_ishtml  = mysqli_real_escape_string($con, $row['ishtml']);
            $p_attachs = mysqli_real_escape_string($con, $row['attachs']);
            $p_rtime   = $row['replytime'];
            $p_utime   = $row['updatetime'];
            $p_sig     = intval($row['sig']);
            $p_type    = mysqli_real_escape_string($con, $row['type']);
            $p_ip      = mysqli_real_escape_string($con, $row['ip']);
            $p_lzl     = intval($row['lzl']);

            $stmt_ins = "insert into trash_posts
                (bid, tid, pid, fid, title, author, text, ishtml, attachs,
                 replytime, updatetime, sig, type, ip, lzl,
                 deleter, deletetime, deleteip)
                values ($bid, $tid, $p_pid, $p_fid,
                        '$p_title', '$p_author', '$p_text', '$p_ishtml', '$p_attachs',
                        $p_rtime, $p_utime, $p_sig, '$p_type', '$p_ip', $p_lzl,
                        '$username', $time, '$ip')";
            mysqli_query($con, $stmt_ins);
        }

        $statement = "delete from posts where bid=$bid && tid=$tid";
        mysqli_query($con, $statement);
        $statement = "delete from threads where bid=$bid && tid=$tid";
        mysqli_query($con, $statement);

        return array(array('code' => '0'));
    }

    // ========== Delete single post ==========
    $statement = "select pid from posts where bid=$bid && tid=$tid order by pid desc";
    $results = mysqli_query($con, $statement);
    $res = mysqli_fetch_array($results);
    $number = intval($res[0]);
    $pid = intval($pid);
    if ($pid <= 0 || $pid > $number) {
        return array(array('code' => '3', 'msg' => '帖子不存在！'));
    }
    if ($number == 1) {
        return jiekoufunc_delete($con, $token, $bid, $tid, 0);
    }

    $statement = "select * from posts where bid=$bid && tid=$tid && pid=$pid";
    $results = mysqli_query($con, $statement);
    $row = mysqli_fetch_array($results);

    $p_fid_val = $row['fid'];
    $p_fid     = intval($row['fid']);
    $p_title   = mysqli_real_escape_string($con, $row['title']);
    $p_author  = $row['author'];
    $p_text    = mysqli_real_escape_string($con, $row['text']);
    $p_ishtml  = mysqli_real_escape_string($con, $row['ishtml']);
    $p_attachs = mysqli_real_escape_string($con, $row['attachs']);
    $p_rtime   = $row['replytime'];
    $p_utime   = $row['updatetime'];
    $p_sig     = intval($row['sig']);
    $p_type    = mysqli_real_escape_string($con, $row['type']);
    $p_ip      = mysqli_real_escape_string($con, $row['ip']);
    $p_lzl     = intval($row['lzl']);

    if ($a[0] == 0 && $username != $p_author) {
        return array(array('code' => '5', 'msg' => '权限不足！'));
    }

    // Save to trash_posts with ALL fields
    $stmt_ins = "insert into trash_posts
        (bid, tid, pid, fid, title, author, text, ishtml, attachs,
         replytime, updatetime, sig, type, ip, lzl,
         deleter, deletetime, deleteip)
        values ($bid, $tid, $pid, $p_fid,
                '$p_title', '$p_author', '$p_text', '$p_ishtml', '$p_attachs',
                $p_rtime, $p_utime, $p_sig, '$p_type', '$p_ip', $p_lzl,
                '$username', $time, '$ip')";
    mysqli_query($con, $stmt_ins);

    // Clean up activity join records
    $stmt_join = "select join_id from season_activity_join where post_fid=$p_fid_val";
    $res_join = mysqli_query($con, $stmt_join);
    if (mysqli_num_rows($res_join) != 0) {
        $rj = mysqli_fetch_array($res_join);
        $jid = $rj["join_id"];
        $statement = "delete from season_join_option_value where join_id=$jid";
        mysqli_query($con, $statement);
        $statement = "delete from season_activity_join where join_id=$jid";
        mysqli_query($con, $statement);
    }

    $statement = "delete from posts where bid=$bid && tid=$tid && pid=$pid";
    mysqli_query($con, $statement);
    $statement = "update posts set pid=pid-1 where bid=$bid && tid=$tid && pid>$pid";
    mysqli_query($con, $statement);

    $new_reply = $number - 2;
    if ($pid == 1) {
        $statement = "select title, author from posts where bid=$bid && tid=$tid && pid=1";
        $r2 = mysqli_query($con, $statement);
        $rf = mysqli_fetch_array($r2);
        $nt = mysqli_real_escape_string($con, $rf[0]);
        $na = $rf[1];
        $statement = "update threads set title='$nt', author='$na', reply=$new_reply where bid=$bid && tid=$tid";
        mysqli_query($con, $statement);
        return array(array('code' => '0'));
    }
    if ($pid == $number) {
        $newpid = $pid - 1;
        $statement = "select author,updatetime from posts where bid=$bid && tid=$tid && pid=$newpid";
        $r2 = mysqli_query($con, $statement);
        $rf = mysqli_fetch_row($r2);
        $na = $rf[0];
        $nu = $rf[1];
        if ($newpid != 1) {
            $statement = "update threads set replyer='$na',timestamp=$nu, reply=$new_reply where bid=$bid && tid=$tid";
            mysqli_query($con, $statement);
        } else {
            $statement = "update threads set replyer=null,timestamp=$nu, reply=$new_reply where bid=$bid && tid=$tid";
            mysqli_query($con, $statement);
        }
        return array(array('code' => '0'));
    }
    $statement = "update threads set reply=$new_reply where bid=$bid && tid=$tid";
    mysqli_query($con, $statement);
    return array(array('code' => '0'));
}

function jiekoufunc_move($con, $token, $bid, $tid, $to) {
    $a = jiekoufunc_getrights($con, $bid, $token);
    if ($a[0] != 2) {
        return array(array('code' => '5', 'msg' => '权限不足！'));
    }
    $statement = "select max(tid) as m from (select tid from threads where bid=$to union select tid from trash_threads where bid=$to) as t";
    $totid = intval(mysqli_fetch_row(mysqli_query($con, $statement))[0]) + 1;
    $statement = "select tid from threads where bid=$bid && tid=$tid";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) {
        return array(array('code' => '3', 'msg' => '主题不存在！'));
    }
    $statement = "update threads set bid=$to, tid=$totid where bid=$bid && tid=$tid";
    mysqli_query($con, $statement);
    $statement = "update posts set bid=$to, tid=$totid where bid=$bid && tid=$tid";
    mysqli_query($con, $statement);
    return array(array('code' => '0', 'bid' => strval($to), 'tid' => strval($totid)));
}

function jiekoufunc_lzl($con, $method, $fid, $token, $ip, $params) {
    if ($method == "ask") {
        $statement = "select * from lzl where fid=$fid && visible=1 order by id";
        $results = mysqli_query($con, $statement);
        $infos = array();
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

    if ($method == "post") {
        $time = time();
        $statement = "select username,star,rights,lastpost from userinfo where token='$token' && $time<=tokentime+{$GLOBALS['validtime']}";
        $results = mysqli_query($con, $statement);
        $res = mysqli_fetch_row($results);
        $username = $res[0];
        $star = intval($res[1]);
        $rights = intval($res[2]);
        $lastpost = intval($res[3]);
        $delay_err = jiekoufunc_checkDelayTime($time, $star, $rights, $lastpost, $ip);
        if ($delay_err !== null) return $delay_err;

        $text = isset($params['text']) ? $params['text'] : '';

        $statement = "select author from lzl where fid=$fid";
        $result_lzl = mysqli_query($con, $statement);
        if (mysqli_num_rows($result_lzl) >= 100) {
            return array(array('code' => '10', 'msg' => '楼中楼数目已经达到上限。'));
        }

        $statement = "select bid,tid,pid,author from posts where fid=$fid limit 1";
        $result = mysqli_query($con, $statement);
        $info = mysqli_fetch_array($result);
        $lzl_bid = $info['bid'];
        $lzl_tid = $info['tid'];
        $lzl_pid = $info['pid'];
        $pidauthor = $info['author'];

        $statement = "select author,title,locked from threads where bid=$lzl_bid && tid=$lzl_tid";
        $result = mysqli_query($con, $statement);
        $tinfo = mysqli_fetch_array($result);
        $tidauthor = $tinfo['author'];
        $tidtitle = $tinfo['title'];
        $lock = intval($tinfo['locked']);
        if ($lock == 1) {
            return array(array('code' => '3', 'msg' => '帖子已锁定。'));
        }

        if (mb_strlen($text, 'utf-8') >= 503) $text = mb_substr($text, 0, 500, 'utf-8') . "...";

        $text_mysqli_escaped = mysqli_real_escape_string($con, $text);

        $statement = "insert into lzl (fid,author,text,time) values ($fid, '$username', '$text_mysqli_escaped', " . time() . ")";
        mysqli_query($con, $statement);
        $error = mysqli_errno($con);
        if ($error == 0) {
            $statement = "update posts set lzl=lzl+1 where fid=$fid";
            mysqli_query($con, $statement);
            $statement = "update userinfo set lastpost=$time, tokentime=$time where username='$username'";
            mysqli_query($con, $statement);

            if ($pidauthor != $username) jiekoufunc_insertmsg($con, "system", $pidauthor, "replylzl", $lzl_bid, $lzl_tid, $lzl_pid, $username, $tidtitle);
            if ($tidauthor != $username && $tidauthor != $pidauthor) jiekoufunc_insertmsg($con, "system", $tidauthor, "reply", $lzl_bid, $lzl_tid, $lzl_pid, $username, $tidtitle);
            $matches = array();
            if (preg_match('/^回复 @(.*)(:|：).*/s', $text, $matches)) {
                $replied = $matches[1];
                if ($replied != $pidauthor && $replied != $tidauthor) jiekoufunc_insertmsg($con, "system", $replied, "replylzlreply", $lzl_bid, $lzl_tid, $lzl_pid, $username, $tidtitle);
            }
            return array(array('code' => '0'));
        } else {
            return array(array('code' => '2', 'msg' => mysqli_error($con)));
        }
    }

    if ($method == "delete") {
        $lzlid = isset($params['lzlid']) ? intval($params['lzlid']) : (isset($params['id']) ? intval($params['id']) : 0);
        if ($lzlid <= 0) {
            return array(array('code' => '3', 'msg' => '帖子不存在！'));
        }
        $time = time();
        $statement = "select username, rights from userinfo where token='$token' && $time<=tokentime+{$GLOBALS['validtime']}";
        $results = mysqli_query($con, $statement);
        if (mysqli_num_rows($results) == 0) {
            return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
        }
        $res = mysqli_fetch_array($results);
        $username = $res[0];
        $rights = intval($res[1]);

        $statement = "select author from lzl where id=$lzlid";
        $results = mysqli_query($con, $statement);
        if (mysqli_num_rows($results) == 0) {
            return array(array('code' => '3', 'msg' => '帖子不存在！'));
        }
        $res = mysqli_fetch_row($results);
        $lzl_author = $res[0];

        $statement = "select bid from posts where fid=$fid";
        $results = mysqli_query($con, $statement);
        if (mysqli_num_rows($results) == 0) {
            return array(array('code' => '3', 'msg' => '帖子不存在！'));
        }
        $res = mysqli_fetch_array($results);
        $lzl_bid = $res[0];
        $statement = "select m1,m2,m3,m4 from boardinfo where bid=$lzl_bid";
        $results2 = mysqli_query($con, $statement);
        $res2 = mysqli_fetch_array($results2);
        $able = 0;
        for ($i2 = 0; $i2 <= 3; $i2++) if ($res2[$i2] == $username) $able = 1;
        if (($rights + $able < 3) && $lzl_author != $username) {
            return array(array('code' => '5', 'msg' => '权限不足！'));
        }

        $statement = "update lzl set visible=0 where id=$lzlid limit 1";
        mysqli_query($con, $statement);
        $statement = "update posts set lzl=lzl-1 where fid=$fid";
        mysqli_query($con, $statement);
        return array(array('code' => '0'));
    }
    return array(array('code' => '14', 'msg' => '未知lzl操作'));
}

function jiekoufunc_sendmsg($con, $token, $to, $text) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return jiekoufunc_report('1', '尚未登录');
    }
    $sender = $user['username'];
    $text = mysqli_real_escape_string($con, $text);
    $to_esc = mysqli_real_escape_string($con, $to);
    $statement = "select username from userinfo where username='$to_esc'";
    if (!mysqli_fetch_array(mysqli_query($con, $statement))) {
        return jiekoufunc_report('3', '留言的对象不存在！');
    }
    if (jiekoufunc_insertmsg($con, $sender, $to_esc, $text, 0, 0, 0, "", "")) {
        return jiekoufunc_report('0', 'success');
    } else {
        return jiekoufunc_report('4', 'Database Error');
    }
}

function jiekoufunc_boardcast($con, $token, $text) {
    $rights = jiekoufunc_getrights($con, 1, $token);
    $rights_val = intval($rights[3]);
    if ($rights_val != 4) {
        return array(array('code' => '1', 'msg' => '权限不足'));
    }
    $statement = "select username from userinfo";
    $results = mysqli_query($con, $statement);
    $text = mysqli_real_escape_string($con, $text);
    while ($res = mysqli_fetch_row($results)) {
        $user = $res[0];
        $tmptext = "尊敬的 " . $user . " 用户您好，" . $text;
        jiekoufunc_insertmsg($con, "admin", $user, $tmptext, 0, 0, 0, "", "");
    }
    return array(array('code' => '0'));
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
    $size = (int) filesize($fullpath);
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
    $ip_esc = mysqli_real_escape_string($con, $ip);
    $time = time();
    $statement = "select username from userinfo where token='$token' && $time<=tokentime+{$GLOBALS['validtime']}";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) {
        return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
    }
    $res = mysqli_fetch_array($results);
    $username = $res[0];
    if ($ip != "") $statement = "update userinfo set tokentime=$time, lastip='$ip_esc' where username='$username'";
    else $statement = "update userinfo set tokentime=$time where username='$username'";
    mysqli_query($con, $statement);
    return array(array('code' => '0', 'username' => $username));
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
    $place = isset($params['place']) ? mysqli_real_escape_string($con, sanitize_xml($params['place'])) : '';
    $hobby = isset($params['hobby']) ? mysqli_real_escape_string($con, sanitize_xml($params['hobby'])) : '';
    $qq = isset($params['qq']) ? mysqli_real_escape_string($con, sanitize_xml($params['qq'])) : '';
    $icon = isset($params['icon']) ? mysqli_real_escape_string($con, sanitize_xml($params['icon'])) : '';
    $sex = isset($params['sex']) ? mysqli_real_escape_string($con, sanitize_xml($params['sex'])) : '';
    $statement = "update userinfo set tokentime=$time, sex='$sex'," .
                 "lastip='$ip', icon='$icon', mail='$mail', qq='$qq', intro='$intro', place='$place'," .
                 "hobby='$hobby', sig1='$sig1', sig2='$sig2', sig3='$sig3' where username='$username_esc'";
    mysqli_query($con, $statement);
    if (mysqli_error($con)) {
        return array(array('code' => '1', 'error' => mysqli_error($con)));
    }
    // Also upsert into user_sig table for each signature
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
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(array('code' => '-2', 'msg' => '请先登录'));
    }
    $username = mysqli_real_escape_string($con, $user['username']);
    $now = time();
    $statement = "insert into favorites (username, bid, tid, timestamp, last_read_time) values ('$username', $bid, $tid, $now, $now)";
    if (mysqli_query($con, $statement)) {
        return array(array('code' => '0', 'msg' => '收藏成功'));
    }
    if (mysqli_errno($con) == 1062) {
        return array(array('code' => '1', 'msg' => '已经收藏过了'));
    }
    return array(array('code' => '2', 'msg' => mysqli_error($con)));
}

function jiekoufunc_favorite_remove($con, $token, $bid, $tid) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(array('code' => '-2', 'msg' => '请先登录'));
    }
    $username = mysqli_real_escape_string($con, $user['username']);
    mysqli_query($con, "delete from favorites where username='$username' and bid=$bid and tid=$tid");
    return array(array('code' => '0', 'msg' => '已取消收藏'));
}

function jiekoufunc_favorite_list($con, $token, $params) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(array('code' => '-2', 'msg' => '请先登录'));
    }
    $username = mysqli_real_escape_string($con, $user['username']);
    $sort = isset($params['sort']) ? $params['sort'] : 'time';
    $limit_raw = isset($params['limit']) ? $params['limit'] : '';
    $limit_val = _parse_limit($limit_raw, 50);
    $limit_clause = ($limit_val === null) ? '' : " limit 0,$limit_val";

    if ($sort == 'custom') {
        $order = "order by f.sort_order, f.timestamp desc";
    } else {
        $order = "order by f.timestamp desc";
    }

    $statement = "select f.id, f.bid, f.tid, f.timestamp as fav_timestamp, f.sort_order,
        t.title, t.author, t.click, t.reply, t.timestamp, t.postdate
        from favorites f
        left join threads t on f.bid=t.bid and f.tid=t.tid
        where f.username='$username'
        $order$limit_clause";

    $results = mysqli_query($con, $statement);
    $infos = array();
    $infos[] = array('code' => '0');
    while ($res = mysqli_fetch_array($results, MYSQLI_ASSOC)) {
        $info = array();
        foreach ($res as $key => $value) {
            if (is_long($key)) continue;
            $info[$key] = $value;
        }
        $info['deleted'] = ($res['title'] === null) ? '1' : '0';
        $infos[] = $info;
    }
    return $infos;
}

function jiekoufunc_favorite_sort($con, $token, $bid, $tid, $params) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(array('code' => '-2', 'msg' => '请先登录'));
    }
    $username = mysqli_real_escape_string($con, $user['username']);
    $sort_order = isset($params['sort_order']) ? intval($params['sort_order']) : 0;
    mysqli_query($con, "update favorites set sort_order=$sort_order where username='$username' and bid=$bid and tid=$tid");
    return array(array('code' => '0'));
}

function jiekoufunc_favorite_count($con, $bid, $tid) {
    $result = mysqli_fetch_array(mysqli_query($con, "select count(*) as c from favorites where bid=$bid and tid=$tid"));
    return array(array('code' => '0', 'count' => strval($result['c'])));
}

function jiekoufunc_favorite_check($con, $token, $bid, $tid) {
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(array('code' => '0', 'favorited' => 'false'));
    }
    $username = mysqli_real_escape_string($con, $user['username']);
    $result = mysqli_query($con, "select 1 from favorites where username='$username' and bid=$bid and tid=$tid");
    $favorited = (mysqli_num_rows($result) > 0) ? 'true' : 'false';
    return array(array('code' => '0', 'favorited' => $favorited));
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
//  Middleware
// ============================================================================

function jiekoufunc_middleware_config($ask) {
    static $config = null;
    if ($config === null) {
        $config = require __DIR__ . '/../config/api-middleware.php';
    }
    if (isset($config[$ask])) return $config[$ask];
    return $config['_default'];
}

function jiekoufunc_middleware_login($con, $token, $bid, $check_bid1) {
    if ($check_bid1 && intval($bid) == 1) {
        $user = jiekoufunc_token2user($con, $token);
        if (!$user) {
            return array(false, jiekoufunc_report('-2', '本版块需要登录后才能查看'));
        }
        return array(true, null);
    }
    $user = jiekoufunc_token2user($con, $token);
    if (!$user) {
        return array(false, jiekoufunc_report('-2', '请先登录'));
    }
    return array(true, null);
}

function jiekoufunc_middleware_online($con, $token, $ip) {
    jiekoufunc_validate_token_and_sign($con, $token, $ip);
}

function jiekoufunc_middleware_permission($con, $token, $bid, $require_rights, $check_board_mod) {
    if ($require_rights <= 0 && !$check_board_mod) return null;

    $rights_info = jiekoufunc_getrights($con, $bid, $token);
    if ($rights_info[0] == -1) {
        return jiekoufunc_report('1', '会话超时，请重新登录');
    }
    $user_rights = intval($rights_info[3]);
    $board_able = intval($rights_info[0]);

    if ($check_board_mod && $board_able >= 1) return null;
    if ($user_rights >= $require_rights) return null;

    return jiekoufunc_report('5', '权限不足！');
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
        $th_title   = mysqli_real_escape_string($con, $thread['title']);
        $th_author  = mysqli_real_escape_string($con, $thread['author']);
        $th_replyer = isset($thread['replyer']) ? "'" . mysqli_real_escape_string($con, $thread['replyer']) . "'" : "NULL";
        $th_click   = intval($thread['click']);
        $th_reply   = intval($thread['reply']);
        $th_guest   = intval($thread['guesture']);
        $th_extr    = intval($thread['extr']);
        $th_top     = intval($thread['top']);
        $th_locked  = intval($thread['locked']);
        $th_ts      = intval($thread['timestamp']);
        $th_pd      = isset($thread['postdate']) ? "'" . mysqli_real_escape_string($con, $thread['postdate']) . "'" : "NULL";

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
            $p_fid     = intval($row['fid']);
            $p_pid     = intval($row['pid']);
            $p_title   = mysqli_real_escape_string($con, $row['title']);
            $p_author  = mysqli_real_escape_string($con, $row['author']);
            $p_text    = mysqli_real_escape_string($con, $row['text']);
            $p_ishtml  = mysqli_real_escape_string($con, $row['ishtml']);
            $p_attachs = mysqli_real_escape_string($con, $row['attachs']);
            $p_rtime   = intval($row['replytime']);
            $p_utime   = intval($row['updatetime']);
            $p_sig     = intval($row['sig']);
            $p_type    = mysqli_real_escape_string($con, $row['type']);
            $p_ip      = mysqli_real_escape_string($con, $row['ip']);
            $p_lzl     = intval($row['lzl']);

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

        $p_fid     = intval($row['fid']);
        $p_title   = mysqli_real_escape_string($con, $row['title']);
        $p_author  = mysqli_real_escape_string($con, $row['author']);
        $p_text    = mysqli_real_escape_string($con, $row['text']);
        $p_ishtml  = mysqli_real_escape_string($con, $row['ishtml']);
        $p_attachs = mysqli_real_escape_string($con, $row['attachs']);
        $p_rtime   = intval($row['replytime']);
        $p_utime   = intval($row['updatetime']);
        $p_sig     = intval($row['sig']);
        $p_type    = mysqli_real_escape_string($con, $row['type']);
        $p_ip      = mysqli_real_escape_string($con, $row['ip']);
        $p_lzl     = intval($row['lzl']);

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
        'code'          => '0',
        'msg'           => 'ok',
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
            'code'       => '0',
            'version_id' => strval($version_id),
            'text'       => $row['text'],
            'edit_time'  => strval($row['edit_time']),
            'edit_by'    => $row['edit_by'],
            'parent_id'  => strval($row['parent_id'] ?: '0'),
            'source'     => $row['source'],
            'author'     => $row['author'] ?: '',
            'fid'        => strval($row['fid']),
            'bid'        => strval($row['bid']),
            'tid'        => strval($row['tid']),
            'pid'        => strval($row['pid'])
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
    $ip       = $a[2];

    // 获取目标历史版本（必须 fid 匹配，防止跨帖子恢复）
    $stmt = "select * from post_edit_history where version_id=$version_id and fid=$fid";
    $res  = mysqli_query($con, $stmt);
    if (mysqli_num_rows($res) == 0) {
        return jiekoufunc_report('3', '版本不存在。');
    }
    $hist = mysqli_fetch_array($res);
    $target_text   = $hist['text'];
    $target_author = $hist['author'];
    $his_bid = $hist['bid'];
    $his_tid = $hist['tid'];
    $his_pid = $hist['pid'];

    // 检查帖子是否仍存在（用 fid 定位，比 bid/tid/pid 更可靠）
    $stmt_post = "select * from posts where fid=$fid";
    $res_post  = mysqli_query($con, $stmt_post);
    if (mysqli_num_rows($res_post) == 0) {
        return jiekoufunc_report('4', '目标帖子当前不存在（可能已被删除）。请先从回收站恢复。');
    }
    $cur = mysqli_fetch_array($res_post);
    $cur_author = $cur['author'];
    $cur_text   = mysqli_real_escape_string($con, $cur['text']);
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
        'code'                  => '0',
        'msg'                   => 'ok',
        'restored_from_version' => strval($version_id),
        'restored_author'       => $restored_author
    ));
}

// ============================================================================
//  Main dispatcher
// ============================================================================

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
    $limit       = isset($params['limit'])       ? intval($params['limit'])       : 10;
    $bid         = isset($params['bid'])         ? intval($params['bid'])         : 0;
    $method      = isset($params['method'])      ? $params['method']              : 'composite';
    $days        = isset($params['days'])        ? intval($params['days'])        : 7;
    $min_replies = isset($params['min_replies']) ? intval($params['min_replies']) : 0;

    if ($limit <= 0)   $limit = 10;
    if ($limit > 100)  $limit = 100;
    if ($days  <= 0)   $days  = 7;

    $cutoff    = time() - ($days * 86400);
    $bid_where = ($bid > 0) ? "AND t.bid = $bid" : "";

    // Total LZL count per thread (sum of lzl counters across all posts)
    $lzl_total  = "(SELECT COALESCE(SUM(p2.lzl), 0) FROM posts p2 WHERE p2.bid = t.bid AND p2.tid = t.tid)";
    // Total replies + LZL (used for scoring and threshold)
    $total_eng  = "(t.reply + $lzl_total)";
    $reply_min  = ($min_replies > 0) ? "AND $total_eng >= $min_replies" : "";

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

/**
 * Route a request to the appropriate business function.
 *
 * @param $con   mysqli connection
 * @param $params  associative array of parameters (mirrors old $_REQUEST)
 * @return array   array of assoc arrays (one per <info> block)
 */
function jiekoufunc_dispatch($con, $params) {
    // Extract parameters with defaults
    $ask       = isset($params['ask']) ? $params['ask'] : '';
    $bid       = intval(isset($params['bid']) ? $params['bid'] : 0);
    $tid       = intval(isset($params['tid']) ? $params['tid'] : 0);
    $pid       = intval(isset($params['pid']) ? $params['pid'] : 0);
    $to        = isset($params['to']) ? $params['to'] : '';
    $fid       = intval(isset($params['fid']) ? $params['fid'] : 0);
    $path      = isset($params['path']) ? $params['path'] : '';
    $filename  = isset($params['filename']) ? $params['filename'] : '';
    $text      = isset($params['text']) ? $params['text'] : '';
    $id        = isset($params['id']) ? $params['id'] : '';
    $attachs   = isset($params['attachs']) ? $params['attachs'] : '';
    $keyword   = isset($params['keyword']) ? $params['keyword'] : '';
    $type      = isset($params['type']) ? $params['type'] : '';
    $token     = isset($params['token']) ? $params['token'] : '';
    $ip        = isset($params['ip']) ? $params['ip'] : '';
    $view      = isset($params['view']) ? $params['view'] : '';
    $limit_raw = isset($params['limit']) ? $params['limit'] : '';

    if ($ip == "") $ip = $_SERVER["REMOTE_ADDR"];
    if ($token == null) $token = "";
    $token = mysqli_real_escape_string($con, $token);

    // Validate numeric params
    if (!jiekoufunc_islegal($bid) || !jiekoufunc_islegal($tid) ||
        !jiekoufunc_islegal($pid) || !jiekoufunc_islegal($fid)) {
        return array(array('code' => '-1', 'msg' => '未知错误，请反馈给我们。'));
    }

    // === Middleware ===
    $mw_config = jiekoufunc_middleware_config($ask);
    $m_check_bid1 = isset($mw_config['check_bid1']) ? $mw_config['check_bid1'] : false;
    // Login check
    if ($mw_config['check_login'] || ($m_check_bid1 && intval($bid) == 1)) {
        list($m_login_ok, $m_login_err) = jiekoufunc_middleware_login($con, $token, $bid, $m_check_bid1);
        if (!$m_login_ok) return $m_login_err;
    }
    // Online status + auto sign-in
    jiekoufunc_middleware_online($con, $token, $ip);
    // Permission check
    $m_perm_err = jiekoufunc_middleware_permission($con, $token, $bid,
        $mw_config['require_rights'],
        isset($mw_config['check_board_mod']) ? $mw_config['check_board_mod'] : false);
    if ($m_perm_err) return $m_perm_err;

    // === Dispatch by $ask ===

    if ($ask == "bbsinfo")           return jiekoufunc_bbsinfo($con, $bid, isset($params['name']) ? $params['name'] : '');
    if ($ask == "login")             return jiekoufunc_login($con, isset($params['username']) ? $params['username'] : '', isset($params['password']) ? $params['password'] : '', $ip, $params);
    if ($ask == "logout")            return jiekoufunc_logout($con, $token, $ip);
    if ($ask == "register")          return jiekoufunc_register($con, $ip, $params);
    if ($ask == "boardcast")         return jiekoufunc_boardcast($con, $token, $text);
    if ($ask == "getuser")           return jiekoufunc_getuser($con, $token);
    if ($ask == "userexists")        return jiekoufunc_userexists($con, $params);
    if ($ask == "hot")               return jiekoufunc_hot($con, $token, $params);
    if ($ask == "global_top")        return jiekoufunc_global_top($con, $token);
    if ($ask == "news")              return jiekoufunc_news($con, $token, $params);
    if ($ask == "tidinfo")           return jiekoufunc_tidinfo($con, $bid, $tid);
    if ($ask == "recentpost")        return jiekoufunc_recentpost($con, $view, $limit_raw);
    if ($ask == "recentreply")       return jiekoufunc_recentreply($con, $view, $limit_raw);
    if ($ask == "rights")            return jiekoufunc_rights($con, $bid, $token);
    if ($ask == "attach")            return jiekoufunc_attach($con, $token, $path, $filename);
    if ($ask == "attachdl")          return jiekoufunc_attachdl($con, $token, $id);
    if ($ask == "attachinfo")        return jiekoufunc_attachinfo($con, $id, $token);
    if ($ask == "unusedattachinfo")  return jiekoufunc_unusedattachinfo($con, $token);
    if ($ask == "delattach")         return jiekoufunc_delattach($con, $token, $id);
    if ($ask == "editpreview")       return jiekoufunc_editpreview($con, $token, $bid, $tid, $pid);
    if ($ask == "sendmsg")           return jiekoufunc_sendmsg($con, $token, $to, $text);
    if ($ask == "msg")               return jiekoufunc_msg($con, $token, $type, $params);
    if ($ask == "changepsd")         return jiekoufunc_changepsd($con, $token, $params);
    if ($ask == "admin_reset_password") return jiekoufunc_admin_reset_password($con, $token, $params);
    if ($ask == "currentUserInfo")   return jiekoufunc_currentUserInfo($con, $token);
    if ($ask == "search")            return jiekoufunc_searchByKeyword($con, $keyword, $token, $type, $bid, $params);
    if ($ask == "edituser")          return jiekoufunc_edituser($con, $token, $ip, $params);
    if ($ask == "online")            return jiekoufunc_viewonline($con);
    if ($ask == "update")            return jiekoufunc_updatetokentime($con, $token, $ip);
    if ($ask == "post")              return jiekoufunc_post($con, $token, $bid, $ip, $attachs, $params);
    if ($ask == "reply")             return jiekoufunc_reply($con, $token, $bid, $tid, $ip, $attachs, $params);
    if ($ask == "edit")              return jiekoufunc_edit($con, $token, $bid, $tid, $pid, $ip, $attachs, $params);

    // Admin actions (all go to threads_action)
    if ($ask == "lock" || $ask == "extr" || $ask == "top" || $ask == "global_top_action")
        return jiekoufunc_threads_action($con, $token, $bid, $tid, $ask);

    if ($ask == "delete")            return jiekoufunc_delete($con, $token, $bid, $tid, $pid);
    if ($ask == "move")              return jiekoufunc_move($con, $token, $bid, $tid, $to);

    if ($ask == "lzl") {
        $method = isset($params['method']) ? $params['method'] : '';
        return jiekoufunc_lzl($con, $method, $fid, $token, $ip, $params);
    }

    if ($ask == "getpages")          return jiekoufunc_getpages($con, $bid, $tid);
    if ($ask == "getlznum")          return jiekoufunc_getlznum($con, $bid, $tid);
    if ($ask == "getnum")            return jiekoufunc_getnum($con);
    if ($ask == "sign_today")        return jiekoufunc_sign_today($con, $params);
    if ($ask == "sign_year")         return jiekoufunc_sign_year($con);
    if ($ask == "sign_user")         return jiekoufunc_sign_user($con);

    // Favorite operations
    if ($ask == "favorite_add")            return jiekoufunc_favorite_add($con, $token, $bid, $tid);
    if ($ask == "favorite_remove")         return jiekoufunc_favorite_remove($con, $token, $bid, $tid);
    if ($ask == "favorite_list")           return jiekoufunc_favorite_list($con, $token, $params);
    if ($ask == "favorite_sort")           return jiekoufunc_favorite_sort($con, $token, $bid, $tid, $params);
    if ($ask == "favorite_count")          return jiekoufunc_favorite_count($con, $bid, $tid);
    if ($ask == "favorite_check")          return jiekoufunc_favorite_check($con, $token, $bid, $tid);
    if ($ask == "calendar")                return jiekoufunc_calendar($con);

    // Trash / restore / edit-history routes
    if ($ask == "trash_list") {
        $page  = isset($params['page'])  ? $params['page']  : 1;
        $limit = isset($params['limit']) ? $params['limit'] : 20;
        $type  = isset($params['type'])  ? $params['type']  : 'all';
        return jiekoufunc_trash_list($con, $token, $bid, $page, $limit, $type);
    }
    if ($ask == "trash_restore") {
        $trash_id = isset($params['trash_id']) ? intval($params['trash_id']) : 0;
        $type     = isset($params['type'])     ? $params['type']             : '';
        return jiekoufunc_trash_restore($con, $token, $type, $bid, $tid, $pid, $trash_id);
    }
    if ($ask == "trash_delete") {
        $trash_id = isset($params['trash_id']) ? intval($params['trash_id']) : 0;
        $type     = isset($params['type'])     ? $params['type']             : '';
        return jiekoufunc_trash_delete($con, $token, $type, $bid, $tid, $pid, $trash_id);
    }
    if ($ask == "trash_clean") {
        $days = isset($params['days']) ? intval($params['days']) : 90;
        return jiekoufunc_trash_clean($con, $token, $days);
    }
    if ($ask == "edit_history") {
        $fid = isset($params['fid']) ? intval($params['fid']) : 0;
        $version_id = isset($params['version_id']) ? intval($params['version_id']) : 0;
        return jiekoufunc_edit_history($con, $token, $fid, $version_id);
    }
    if ($ask == "restore_version") {
        $fid = isset($params['fid']) ? intval($params['fid']) : 0;
        $version_id = isset($params['version_id']) ? intval($params['version_id']) : 0;
        return jiekoufunc_restore_version($con, $token, $fid, $version_id);
    }
    // Thread listing
    if ($ask == "recent_threads")     return jiekoufunc_recent_threads($con, $params);
    if ($ask == "hot_threads")        return jiekoufunc_hot_threads($con, $params);

    // === Dispatch by $view (no $ask) ===
    if ($view != "")                 return jiekoufunc_view_user_array($con, $view);

    // === Dispatch by $bid (no $ask, default board/thread rendering) ===
    if ($bid != 0) {
        $page = isset($params['p']) ? $params['p'] : '';
        $see_lz = isset($params['see_lz']) ? $params['see_lz'] : '';
        $extr = isset($params['extr']) ? $params['extr'] : '';

        // Token time + nowboard update (same as jiekouapi.php lines 131-145)
        if ($token != "") {
            $nowtime = time();
            $statement = "select username from userinfo where token='$token' && $nowtime<=tokentime+{$GLOBALS['validtime']}";
            $result = mysqli_query($con, $statement);
            $user = "";
            while ($res = mysqli_fetch_array($result)) {
                foreach ($res as $key => $value) {
                    if ($key == "username") { $user = $value; }
                }
                if ($ip != "")
                    $statement = "update userinfo set tokentime=$nowtime, nowboard=$bid, lastip='$ip' where username='$user'";
                else
                    $statement = "update userinfo set tokentime=$nowtime, nowboard=$bid where username='$user'";
                mysqli_query($con, $statement);
            }
        }

        if ($tid != 0) {
            $author = "";
            if ($see_lz != "") {
                $statement = "select author from threads where bid=$bid && tid=$tid";
                $results = mysqli_query($con, $statement);
                if (mysqli_num_rows($results) != 0) {
                    $result = mysqli_fetch_row($results);
                    $author = $result[0];
                }
            }
            if ($fid != 0)
                $statement = "select * from posts where bid=$bid && tid=$tid && fid=$fid";
            elseif ($pid != 0)
                $statement = "select * from posts where bid=$bid && tid=$tid && pid=$pid";
            elseif ($page != "") {
                $start = ($page - 1) * 12;
                if ($author != "")
                    $statement = "select * from posts where bid=$bid && tid=$tid && author='$author' order by pid limit $start, 12";
                else
                    $statement = "select * from posts where bid=$bid && tid=$tid order by pid limit $start, 12";
            } else {
                $statement = "select * from posts where bid=$bid && tid=$tid order by pid";
            }
        } else {
            if ($extr == "") $extr = 0;
            else $extr = 1;
            if ($page == "") $page = 1;
            $start = ($page - 1) * 25;
            $statement = "
            select threads.bid,threads.tid,title,author,replyer,click,reply,extr,top,locked,timestamp,postdate,
            case when thread_global_top.bid is null then 0 else 1 end as global_top
            from threads left join thread_global_top on threads.bid=thread_global_top.bid and threads.tid=thread_global_top.tid
            where threads.bid=$bid and extr>=$extr order by top desc, timestamp desc limit $start, 25";
        }

        $result = jiekoufunc_view_bbs_array($con, $statement);

        // Click increment for thread views
        if ($tid != 0 && $pid == 0) {
            $statement = "update threads set click=click+1 where bid=$bid && tid=$tid";
            mysqli_query($con, $statement);
        }

        return $result;
    }

    // Nothing matched
    return array(array('code' => '14', 'msg' => 'ask错误。'));
}
