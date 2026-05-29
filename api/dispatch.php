<?php
/**
 * dispatch.php — API request routing / middleware pipeline.
 *
 * Extracted from jiekoufunc.php.  This is the single entry point for all API
 * calls: it validates parameters, runs the middleware chain, then dispatches
 * to the correct business function.
 *
 * Include this file instead of jiekoufunc.php when you need the full API
 * surface (it pulls in jiekoufunc.php automatically).
 */

require_once __DIR__.'/jiekoufunc.php';

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

        // Token time + nowboard update
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
