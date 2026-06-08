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

    $muted_reason = jiekoufunc_is_muted($con, $username, $bid);
    if ($muted_reason) {
        return array(array('code' => strval(ApiError::USER_MUTED),
            'msg' => '您暂时不能发帖（' . $muted_reason . '）。请先验证邮箱或联系管理员。'));
    }

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

    $muted_reason = jiekoufunc_is_muted($con, $username, $bid);
    if ($muted_reason) {
        return array(array('code' => strval(ApiError::USER_MUTED),
            'msg' => '您暂时不能发帖（' . $muted_reason . '）。请先验证邮箱或联系管理员。'));
    }

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

        $statement = "select author from lzl where fid=$fid";
        $result_lzl = mysqli_query($con, $statement);
        if (mysqli_num_rows($result_lzl) >= 100) {
            return array(array('code' => '10', 'msg' => '楼中楼数目已经达到上限。'));
        }

        $statement = "select bid,tid,pid,author from posts where fid=$fid limit 1";
        $result = mysqli_query($con, $statement);
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
