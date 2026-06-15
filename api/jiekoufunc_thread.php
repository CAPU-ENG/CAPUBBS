<?php
/**
 * jiekoufunc_thread.php — Thread/post content operations for CAPUBBS.
 *
 * Extracted from jiekoufunc.php.  Core write operations: post, reply, edit,
 * delete, move, threads_action (lock/extr/top), and lzl (楼中楼).
 *
 * Requires: lib/helpers.php, lib/db.php (loaded via jiekoufunc.php).
 */

// ============================================================================
//  Business functions — Content writing
// ============================================================================

function jiekoufunc_post($con, $token, $bid, $ip, $attachs, $params) {
    return capubbs_post_service($con)->legacyPost($token, $bid, $ip, $attachs, $params);
}

function jiekoufunc_reply($con, $token, $bid, $tid, $ip, $attachs, $params) {
    return capubbs_post_service($con)->legacyReply($token, $bid, $tid, $ip, $attachs, $params);
}

function jiekoufunc_edit($con, $token, $bid, $tid, $pid, $ip, $attachs, $params) {
    return capubbs_post_service($con)->legacyEdit($token, $bid, $tid, $pid, $ip, $attachs, $params);
}

function jiekoufunc_threads_action($con, $token, $bid, $tid, $action) {
    return capubbs_post_service($con)->legacyThreadsAction($token, $bid, $tid, $action);
}

function jiekoufunc_delete($con, $token, $bid, $tid, $pid) {
    return capubbs_post_service($con)->legacyDelete($token, $bid, $tid, $pid);
}

function jiekoufunc_move($con, $token, $bid, $tid, $to) {
    return capubbs_post_service($con)->legacyMove($token, $bid, $tid, $to);
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
        if (mysqli_num_rows($results) == 0) {
            return array(array('code' => '1', 'msg' => '超时，请重新登录。'));
        }
        $res = mysqli_fetch_row($results);
        $username = $res[0];
        $star = intval($res[1]);
        $rights = intval($res[2]);
        $lastpost = intval($res[3]);

        // 从 fid 解析 bid，用于 is_muted 的 bid=28 豁免判断
        $statement = "select bid from posts where fid=$fid limit 1";
        $result_bid = mysqli_query($con, $statement);
        $lzl_bid = 0;
        if (mysqli_num_rows($result_bid) > 0) {
            $info_bid = mysqli_fetch_array($result_bid);
            $lzl_bid = intval($info_bid['bid']);
        }

        $muted_reason = jiekoufunc_is_muted($con, $username, $lzl_bid);
        if ($muted_reason) {
            return array(array('code' => strval(ApiError::USER_MUTED),
                'msg' => '您暂时不能发帖（' . $muted_reason . '）。请先验证邮箱或联系管理员。'));
        }

        $delay_err = jiekoufunc_checkDelayTime($time, $star, $rights, $lastpost, $ip);
        if ($delay_err !== null) return $delay_err;

        $text = isset($params['text']) ? $params['text'] : '';
        if (trim($text) === '') {
            return array(array('code' => '11', 'msg' => '内容不能为空。'));
        }

        $statement = "select author from lzl where fid=$fid";
        $result_lzl = mysqli_query($con, $statement);
        if (mysqli_num_rows($result_lzl) >= 100) {
            return array(array('code' => '10', 'msg' => '楼中楼数目已经达到上限。'));
        }

        $statement = "select bid,tid,pid,author from posts where fid=$fid limit 1";
        $result = mysqli_query($con, $statement);
        if (mysqli_num_rows($result) == 0) {
            return array(array('code' => '3', 'msg' => '帖子不存在！'));
        }
        $info = mysqli_fetch_array($result);
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

        // 解析 bid，用于后续的禁言检查和版主权限检查
        $statement = "select bid from posts where fid=$fid";
        $results_bid = mysqli_query($con, $statement);
        if (mysqli_num_rows($results_bid) == 0) {
            return array(array('code' => '3', 'msg' => '帖子不存在！'));
        }
        $lzl_bid = intval(mysqli_fetch_row($results_bid)[0]);

        // 检查邮箱验证禁言，仅对自己删除自己楼中楼时生效（bid=28 豁免）
        if ($lzl_author == $username) {
            $muted_reason = jiekoufunc_is_muted($con, $username, $lzl_bid);
            if ($muted_reason) {
                return array(array('code' => strval(ApiError::USER_MUTED),
                    'msg' => '您暂时不能删除帖子（' . $muted_reason . '）。请先验证邮箱或联系管理员。'));
            }
        }

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
