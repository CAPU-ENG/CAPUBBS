<?php
/**
 * db.php — Shared database-query helpers and middleware for CAPUBBS.
 *
 * Extracted from jiekoufunc.php.  These functions are the "data access layer" —
 * they encapsulate repeated SQL patterns (token validation, permission checks,
 * message insertion, attachment cleanup, etc.) and the auth middleware pipeline.
 *
 * All functions require a live mysqli $con.  Keep GLOBALS references minimal.
 */

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

function jiekoufunc_report($code, $msg) {
    return array(array('code' => strval($code), 'msg' => $msg));
}

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
    return null;
}

// ============================================================================
//  Middleware
// ============================================================================

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
