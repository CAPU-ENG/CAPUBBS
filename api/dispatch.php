<?php
/**
 * dispatch.php — API request routing / middleware pipeline.
 *
 * This is the single entry point for all API calls: it validates parameters,
 * runs the middleware chain, then dispatches to the correct business function.
 *
 * The $routes table below is the canonical registry of every API action.
 * Each entry defines:
 *   handler         — callable (function name string)
 *   check_login     — true: reject if not logged in
 *   require_rights  — minimum global rights (0=any, 1=mod, 2=admin, 3=super, 10=root)
 *   check_board_mod — true: allow if user is board moderator (m1-m4)
 *   check_bid1      — true: require login when bid==1 (special board)
 *
 * Include this file instead of jiekoufunc.php to get the full API surface.
 */

require_once __DIR__.'/jiekoufunc.php';
require_once __DIR__.'/lib/ThreadDetailQuery.php';

function _dispatch_build_routes() {
    return array(
        // ================================================================
        // Public — no login required
        // ================================================================
        'bbsinfo'         => array('handler' => 'jiekoufunc_bbsinfo',         'check_login' => false, 'require_rights' => 0),
        'hot'             => array('handler' => 'jiekoufunc_hot',             'check_login' => false, 'require_rights' => 0),
        'global_top'      => array('handler' => 'jiekoufunc_global_top',      'check_login' => false, 'require_rights' => 0),
        'tidinfo'         => array('handler' => 'jiekoufunc_tidinfo',         'check_login' => false, 'require_rights' => 0),
        'thread_detail'   => array('handler' => 'jiekoufunc_thread_detail',   'check_login' => false, 'require_rights' => 0, 'check_bid1' => true),
        'getpages'        => array('handler' => 'jiekoufunc_getpages',        'check_login' => false, 'require_rights' => 0),
        'getlznum'        => array('handler' => 'jiekoufunc_getlznum',        'check_login' => false, 'require_rights' => 0),
        'getnum'          => array('handler' => 'jiekoufunc_getnum',          'check_login' => false, 'require_rights' => 0),
        'online'          => array('handler' => 'jiekoufunc_viewonline',      'check_login' => false, 'require_rights' => 0),
        'search'          => array('handler' => 'jiekoufunc_searchByKeyword', 'check_login' => false, 'require_rights' => 0),
        'sign_today'      => array('handler' => 'jiekoufunc_sign_today',      'check_login' => false, 'require_rights' => 0),
        'sign_year'       => array('handler' => 'jiekoufunc_sign_year',       'check_login' => false, 'require_rights' => 0),
        'sign_user'       => array('handler' => 'jiekoufunc_sign_user',       'check_login' => false, 'require_rights' => 0),
        'getuser'         => array('handler' => 'jiekoufunc_getuser',         'check_login' => false, 'require_rights' => 0),
        'userexists'      => array('handler' => 'jiekoufunc_userexists',      'check_login' => false, 'require_rights' => 0),
        'rights'          => array('handler' => 'jiekoufunc_rights',          'check_login' => false, 'require_rights' => 0),
        'recentpost'      => array('handler' => 'jiekoufunc_recentpost',      'check_login' => false, 'require_rights' => 0),
        'recentreply'     => array('handler' => 'jiekoufunc_recentreply',     'check_login' => false, 'require_rights' => 0),
        'lzl'             => array('handler' => 'jiekoufunc_lzl',             'check_login' => false, 'require_rights' => 0),
        'calendar'        => array('handler' => 'jiekoufunc_calendar',        'check_login' => false, 'require_rights' => 0),
        'recent_threads'  => array('handler' => 'jiekoufunc_recent_threads',  'check_login' => false, 'require_rights' => 0),
        'hot_threads'     => array('handler' => 'jiekoufunc_hot_threads',     'check_login' => false, 'require_rights' => 0),

        // Auth operations — handle login/session themselves
        'login'           => array('handler' => 'jiekoufunc_login',           'check_login' => false, 'require_rights' => 0),
        'logout'          => array('handler' => 'jiekoufunc_logout',          'check_login' => false, 'require_rights' => 0),
        'register'        => array('handler' => 'jiekoufunc_register',        'check_login' => false, 'require_rights' => 0),

        // ================================================================
        // Login required — any authenticated user
        // ================================================================
        'post'             => array('handler' => 'jiekoufunc_post',             'check_login' => true, 'require_rights' => 0),
        'reply'            => array('handler' => 'jiekoufunc_reply',            'check_login' => true, 'require_rights' => 0),
        'sendmsg'          => array('handler' => 'jiekoufunc_sendmsg',          'check_login' => true, 'require_rights' => 0),
        'edituser'         => array('handler' => 'jiekoufunc_edituser',         'check_login' => true, 'require_rights' => 0),
        'changepsd'        => array('handler' => 'jiekoufunc_changepsd',        'check_login' => true, 'require_rights' => 0),
        'currentUserInfo'  => array('handler' => 'jiekoufunc_currentUserInfo',  'check_login' => true, 'require_rights' => 0),
        'editpreview'      => array('handler' => 'jiekoufunc_editpreview',      'check_login' => true, 'require_rights' => 0),
        'msg'              => array('handler' => 'jiekoufunc_msg',              'check_login' => true, 'require_rights' => 0),
        'attach'           => array('handler' => 'jiekoufunc_attach',           'check_login' => true, 'require_rights' => 0),
        'attachdl'         => array('handler' => 'jiekoufunc_attachdl',         'check_login' => true, 'require_rights' => 0),
        'attachinfo'       => array('handler' => 'jiekoufunc_attachinfo',       'check_login' => false, 'require_rights' => 0),
        'unusedattachinfo' => array('handler' => 'jiekoufunc_unusedattachinfo', 'check_login' => true, 'require_rights' => 0),
        'delattach'        => array('handler' => 'jiekoufunc_delattach',        'check_login' => true, 'require_rights' => 0),
        'update'           => array('handler' => 'jiekoufunc_updatetokentime',  'check_login' => false, 'require_rights' => 0),
        'favorite_add'     => array('handler' => 'jiekoufunc_favorite_add',     'check_login' => true, 'require_rights' => 0),
        'favorite_remove'  => array('handler' => 'jiekoufunc_favorite_remove',  'check_login' => true, 'require_rights' => 0),
        'favorite_list'    => array('handler' => 'jiekoufunc_favorite_list',    'check_login' => true, 'require_rights' => 0),
        'favorite_sort'    => array('handler' => 'jiekoufunc_favorite_sort',    'check_login' => true, 'require_rights' => 0),
        'favorite_count'   => array('handler' => 'jiekoufunc_favorite_count',   'check_login' => false, 'require_rights' => 0),
        'favorite_check'   => array('handler' => 'jiekoufunc_favorite_check',   'check_login' => true, 'require_rights' => 0),
        'news'             => array('handler' => 'jiekoufunc_news',             'check_login' => false, 'require_rights' => 0),

        // -- Email verification (login required) --
        'sendVerifyCode'   => array('handler' => null, 'check_login' => true,  'require_rights' => 0),
        'verifyEmail'      => array('handler' => null, 'check_login' => true,  'require_rights' => 0),

        // -- Password reset (public, no login) --
        'sendRegisterCode'       => array('handler' => null, 'check_login' => false, 'require_rights' => 0),
        'sendResetPasswordCode' => array('handler' => null, 'check_login' => false, 'require_rights' => 0),
        'resetPasswordByEmail'  => array('handler' => null, 'check_login' => false, 'require_rights' => 0),

        // -- Email mute management (moderator+) --
        'muteEmail'        => array('handler' => null, 'check_login' => true,  'require_rights' => 1, 'check_board_mod' => true),
        'unmuteEmail'      => array('handler' => null, 'check_login' => true,  'require_rights' => 1, 'check_board_mod' => true),
        'listEmailMutes'   => array('handler' => null, 'check_login' => true,  'require_rights' => 1, 'check_board_mod' => true),
        'toggleEmailVisible' => array('handler' => null, 'check_login' => true,  'require_rights' => 0),

        // ================================================================
        // Login + board moderator OR self-service (function-level auth)
        // ================================================================
        'edit'             => array('handler' => 'jiekoufunc_edit',   'check_login' => true, 'require_rights' => 0, 'check_board_mod' => true),
        'delete'           => array('handler' => 'jiekoufunc_delete', 'check_login' => true, 'require_rights' => 0, 'check_board_mod' => true),

        // ================================================================
        // Login + board moderator OR rights >= 1
        // ================================================================
        'lock'             => array('handler' => 'jiekoufunc_threads_action', 'check_login' => true, 'require_rights' => 1, 'check_board_mod' => true),
        'extr'             => array('handler' => 'jiekoufunc_threads_action', 'check_login' => true, 'require_rights' => 1, 'check_board_mod' => true),
        'top'              => array('handler' => 'jiekoufunc_threads_action', 'check_login' => true, 'require_rights' => 1, 'check_board_mod' => true),

        // ================================================================
        // Admin only
        // ================================================================
        'move'                => array('handler' => 'jiekoufunc_move',                'check_login' => true, 'require_rights' => 2),
        'global_top_action'   => array('handler' => 'jiekoufunc_threads_action',      'check_login' => true, 'require_rights' => 2),
        'boardcast'           => array('handler' => 'jiekoufunc_boardcast',           'check_login' => true, 'require_rights' => 3),
        'admin_reset_password' => array('handler' => 'jiekoufunc_admin_reset_password', 'check_login' => true, 'require_rights' => 10),

        // ================================================================
        // Trash / edit-history (inline param extraction in dispatch)
        // ================================================================
        'trash_list'      => array('handler' => null, 'check_login' => true, 'require_rights' => 0),
        'trash_restore'   => array('handler' => null, 'check_login' => true, 'require_rights' => 0, 'check_board_mod' => true),
        'trash_delete'    => array('handler' => null, 'check_login' => true, 'require_rights' => 0),
        'trash_clean'     => array('handler' => null, 'check_login' => true, 'require_rights' => 0),
        'edit_history'    => array('handler' => null, 'check_login' => true, 'require_rights' => 0),
        'restore_version' => array('handler' => null, 'check_login' => true, 'require_rights' => 0),

        // ================================================================
        // Implicit routes (no $ask, dispatched by $view or $bid)
        // ================================================================
        '__view'         => array('handler' => null, 'check_login' => false, 'require_rights' => 0),
        '__bbs_default'  => array('handler' => null, 'check_login' => false, 'require_rights' => 0, 'check_bid1' => true),
        '__tid_default'  => array('handler' => null, 'check_login' => false, 'require_rights' => 0, 'check_bid1' => true),

        // Fallback
        '_default'       => array('handler' => null, 'check_login' => false, 'require_rights' => 0),
    );
}

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
    $email     = isset($params['email'])  ? $params['email']  : '';
    $code      = isset($params['code'])   ? $params['code']   : '';
    $reason    = isset($params['reason']) ? $params['reason'] : '';
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

    // Resolve route key (same logic as _jiekoufunc_resolve_route_key in lib.php)
    if ($ask == '') {
        if ($view != '')         $ask = '__view';
        elseif ($bid != 0)       $ask = ($tid != 0) ? '__tid_default' : '__bbs_default';
    }

    // === Middleware (config from routing table) ===
    $routes = _dispatch_build_routes();
    $route  = isset($routes[$ask]) ? $routes[$ask] : $routes['_default'];
    $m_check_bid1 = isset($route['check_bid1']) ? $route['check_bid1'] : false;

    // Login check
    if ($route['check_login'] || ($m_check_bid1 && intval($bid) == 1)) {
        list($m_login_ok, $m_login_err) = jiekoufunc_middleware_login($con, $token, $bid, $m_check_bid1);
        if (!$m_login_ok) return $m_login_err;
    }
    // Online status + auto sign-in
    jiekoufunc_middleware_online($con, $token, $ip);
    // Permission check
    $m_perm_err = jiekoufunc_middleware_permission($con, $token, $bid,
        $route['require_rights'],
        isset($route['check_board_mod']) ? $route['check_board_mod'] : false);
    if ($m_perm_err) return $m_perm_err;

    // === Dispatch ===
    $handler = isset($route['handler']) ? $route['handler'] : null;

    if ($handler && $handler !== 'jiekoufunc_threads_action') {
        // Simple handler — call directly with standard parameter mapping
        switch ($handler) {
            case 'jiekoufunc_bbsinfo':
                return jiekoufunc_bbsinfo($con, $bid, isset($params['name']) ? $params['name'] : '');
            case 'jiekoufunc_login':
                return jiekoufunc_login($con, isset($params['username']) ? $params['username'] : '', isset($params['password']) ? $params['password'] : '', $ip, $params);
            case 'jiekoufunc_logout':
                return jiekoufunc_logout($con, $token, $ip);
            case 'jiekoufunc_register':
                return jiekoufunc_register($con, $ip, $params);
            case 'jiekoufunc_boardcast':
                return jiekoufunc_boardcast($con, $token, $text);
            case 'jiekoufunc_getuser':
                return jiekoufunc_getuser($con, $token);
            case 'jiekoufunc_userexists':
                return jiekoufunc_userexists($con, $params);
            case 'jiekoufunc_hot':
                return jiekoufunc_hot($con, $token, $params);
            case 'jiekoufunc_global_top':
                return jiekoufunc_global_top($con, $token);
            case 'jiekoufunc_news':
                return jiekoufunc_news($con, $token, $params);
            case 'jiekoufunc_tidinfo':
                return jiekoufunc_tidinfo($con, $bid, $tid);
            case 'jiekoufunc_thread_detail':
                return jiekoufunc_thread_detail($con, $bid, $tid, $params, $token, $ip);
            case 'jiekoufunc_recentpost':
                return jiekoufunc_recentpost($con, $view, $limit_raw);
            case 'jiekoufunc_recentreply':
                return jiekoufunc_recentreply($con, $view, $limit_raw);
            case 'jiekoufunc_rights':
                return jiekoufunc_rights($con, $bid, $token);
            case 'jiekoufunc_attach':
                return jiekoufunc_attach($con, $token, $path, $filename);
            case 'jiekoufunc_attachdl':
                return jiekoufunc_attachdl($con, $token, $id);
            case 'jiekoufunc_attachinfo':
                return jiekoufunc_attachinfo($con, $id, $token);
            case 'jiekoufunc_unusedattachinfo':
                return jiekoufunc_unusedattachinfo($con, $token);
            case 'jiekoufunc_delattach':
                return jiekoufunc_delattach($con, $token, $id);
            case 'jiekoufunc_editpreview':
                return jiekoufunc_editpreview($con, $token, $bid, $tid, $pid);
            case 'jiekoufunc_sendmsg':
                return jiekoufunc_sendmsg($con, $token, $to, $text);
            case 'jiekoufunc_msg':
                return jiekoufunc_msg($con, $token, $type, $params);
            case 'jiekoufunc_changepsd':
                return jiekoufunc_changepsd($con, $token, $params);
            case 'jiekoufunc_admin_reset_password':
                return jiekoufunc_admin_reset_password($con, $token, $params);
            case 'jiekoufunc_currentUserInfo':
                return jiekoufunc_currentUserInfo($con, $token);
            case 'jiekoufunc_searchByKeyword':
                return jiekoufunc_searchByKeyword($con, $keyword, $token, $type, $bid, $params);
            case 'jiekoufunc_edituser':
                return jiekoufunc_edituser($con, $token, $ip, $params);
            case 'jiekoufunc_viewonline':
                return jiekoufunc_viewonline($con);
            case 'jiekoufunc_updatetokentime':
                return jiekoufunc_updatetokentime($con, $token, $ip);
            case 'jiekoufunc_post':
                return jiekoufunc_post($con, $token, $bid, $ip, $attachs, $params);
            case 'jiekoufunc_reply':
                return jiekoufunc_reply($con, $token, $bid, $tid, $ip, $attachs, $params);
            case 'jiekoufunc_edit':
                return jiekoufunc_edit($con, $token, $bid, $tid, $pid, $ip, $attachs, $params);
            case 'jiekoufunc_delete':
                return jiekoufunc_delete($con, $token, $bid, $tid, $pid);
            case 'jiekoufunc_move':
                return jiekoufunc_move($con, $token, $bid, $tid, $to);
            case 'jiekoufunc_lzl':
                return jiekoufunc_lzl($con, isset($params['method']) ? $params['method'] : '', $fid, $token, $ip, $params);
            case 'jiekoufunc_getpages':
                return jiekoufunc_getpages($con, $bid, $tid);
            case 'jiekoufunc_getlznum':
                return jiekoufunc_getlznum($con, $bid, $tid);
            case 'jiekoufunc_getnum':
                return jiekoufunc_getnum($con);
            case 'jiekoufunc_sign_today':
                return jiekoufunc_sign_today($con, $params);
            case 'jiekoufunc_sign_year':
                return jiekoufunc_sign_year($con);
            case 'jiekoufunc_sign_user':
                return jiekoufunc_sign_user($con);
            case 'jiekoufunc_favorite_add':
                return jiekoufunc_favorite_add($con, $token, $bid, $tid);
            case 'jiekoufunc_favorite_remove':
                return jiekoufunc_favorite_remove($con, $token, $bid, $tid);
            case 'jiekoufunc_favorite_list':
                return jiekoufunc_favorite_list($con, $token, $params);
            case 'jiekoufunc_favorite_sort':
                return jiekoufunc_favorite_sort($con, $token, $bid, $tid, $params);
            case 'jiekoufunc_favorite_count':
                return jiekoufunc_favorite_count($con, $bid, $tid);
            case 'jiekoufunc_favorite_check':
                return jiekoufunc_favorite_check($con, $token, $bid, $tid);
            case 'jiekoufunc_calendar':
                return jiekoufunc_calendar($con);
            case 'jiekoufunc_recent_threads':
                return jiekoufunc_recent_threads($con, $params);
            case 'jiekoufunc_hot_threads':
                return jiekoufunc_hot_threads($con, $params);
        }
    }

    // Handler that uses $ask as action type (lock/extr/top/global_top_action)
    if ($handler === 'jiekoufunc_threads_action') {
        return jiekoufunc_threads_action($con, $token, $bid, $tid, $ask);
    }

    // Trash / restore / edit-history — inline param extraction
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

    // === Email verification ===
    if ($ask == "sendVerifyCode")        return jiekoufunc_sendVerifyCode($con, $token, $params);
    if ($ask == "verifyEmail")           return jiekoufunc_verifyEmail($con, $token, $params);

    // === Registration verification (public, no login) ===
    if ($ask == "sendRegisterCode")      return jiekoufunc_sendRegisterCode($con, $params);

    // === Password reset ===
    if ($ask == "sendResetPasswordCode") return jiekoufunc_sendResetPasswordCode($con, $params);
    if ($ask == "resetPasswordByEmail")  return jiekoufunc_resetPasswordByEmail($con, $params);

    // === Email mute management ===
    if ($ask == "muteEmail")             return jiekoufunc_muteEmail($con, $token, $params);
    if ($ask == "unmuteEmail")           return jiekoufunc_unmuteEmail($con, $token, $params);
    if ($ask == "listEmailMutes")        return jiekoufunc_listEmailMutes($con, $token);
    if ($ask == "toggleEmailVisible")    return jiekoufunc_toggleEmailVisible($con, $token, $params);

    // === Dispatch by $view (no $ask) ===
    if ($view != "") {
        $viewer = '';
        if ($token) {
            $viewer_user = jiekoufunc_token2user($con, $token);
            if ($viewer_user) $viewer = $viewer_user['username'];
        }
        return jiekoufunc_view_user_array($con, $view, $viewer);
    }

    // === Dispatch by $bid (no $ask, default board/thread rendering) ===
    if ($bid != 0) {
        $page = isset($params['p']) ? $params['p'] : '';
        $see_lz = isset($params['see_lz']) ? $params['see_lz'] : '';
        $extr = isset($params['extr']) ? $params['extr'] : '';

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

        if ($tid != 0 && $pid == 0) {
            $statement = "update threads set click=click+1 where bid=$bid && tid=$tid";
            mysqli_query($con, $statement);
        }

        return $result;
    }

    return array(array('code' => '14', 'msg' => 'ask错误。'));
}
