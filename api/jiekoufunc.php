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
    return capubbs_thread_read_service($con)->legacyBbsInfo($bid, $name);
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
    return capubbs_thread_read_service($con)->legacyHot($token, $params);
}

function jiekoufunc_global_top($con, $token) {
    return capubbs_thread_read_service($con)->legacyGlobalTop($token);
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
    return capubbs_sign_service($con)->legacyGetNum();
}

function jiekoufunc_sign_today($con, $params) {
    return capubbs_sign_service($con)->legacyToday($params);
}

function jiekoufunc_sign_year($con) {
    return capubbs_sign_service($con)->legacyYear();
}

function jiekoufunc_sign_user($con) {
    return capubbs_sign_service($con)->legacyUserRank();
}

function jiekoufunc_viewonline($con) {
    return capubbs_sign_service($con)->legacyViewOnline();
}

function jiekoufunc_attachinfo($con, $id, $token) {
    return capubbs_attachment_service($con)->legacyInfo($id, $token);
}

function jiekoufunc_unusedattachinfo($con, $token) {
    return capubbs_attachment_service($con)->legacyUnusedInfo($token);
}

function jiekoufunc_searchByKeyword($con, $keyword, $token, $type, $bid, $params) {
    return capubbs_thread_read_service($con)->legacySearchByKeyword($keyword, $type, $bid, $params);
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
    capubbs_sign_service($con)->legacyAutoSign($username);
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
    return capubbs_attachment_service($con)->legacyUpload($token, $path, $filename);
}

function jiekoufunc_attachdl($con, $token, $id) {
    if (!jiekoufunc_islegal($id)) {
        return jiekoufunc_report('1', "illegal");
    }
    return capubbs_attachment_service($con)->legacyDownload($token, $id);
}

function jiekoufunc_delattach($con, $token, $id) {
    return capubbs_attachment_service($con)->legacyDelete($token, $id);
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

// List trash items (deleted posts/threads). Board mods see their boards; admins (rights>=2) see all.
function jiekoufunc_trash_list($con, $token, $bid, $page, $limit, $type) {
    return capubbs_trash_service($con)->legacyList($token, $bid, $page, $limit, $type);
}

// Restore a deleted post or thread from trash.
function jiekoufunc_trash_restore($con, $token, $type, $bid, $tid, $pid, $trash_id) {
    return capubbs_trash_service($con)->legacyRestore($token, $type, $bid, $tid, $pid, $trash_id);
}

// Permanently delete a trash item (admin only).
function jiekoufunc_trash_delete($con, $token, $type, $bid, $tid, $pid, $trash_id) {
    return capubbs_trash_service($con)->legacyDelete($token, $type, $bid, $tid, $pid, $trash_id);
}

// Batch clean old trash items (admin only).
function jiekoufunc_trash_clean($con, $token, $days) {
    return capubbs_trash_service($con)->legacyClean($token, $days);
}

// ============================================================================
//  Edit history
// ============================================================================

function jiekoufunc_edit_history($con, $token, $fid, $version_id) {
    return capubbs_edit_history_service($con)->legacyHistory($token, $fid, $version_id);
}

function jiekoufunc_restore_version($con, $token, $fid, $version_id) {
    return capubbs_edit_history_service($con)->legacyRestore($token, $fid, $version_id);
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
    return capubbs_thread_read_service($con)->legacyRecentThreads($params);
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
    return capubbs_thread_read_service($con)->legacyHotThreads($params);
}

// ============================================================================
//  Email verification — Helper functions
// ============================================================================

function jiekoufunc_is_pku_email($email) {
    return CapubbsEmailVerificationService::isPkuEmailAddress($email);
}

function jiekoufunc_is_muted($con, $username, $bid = 0) {
    return capubbs_email_verification_service($con)->legacyIsMuted($username, $bid);
}

function jiekoufunc_can_send_code($con, $username, $email, $type) {
    return capubbs_email_verification_service($con)->canSendCode($username, $email, $type);
}

function jiekoufunc_invalidate_codes($con, $username, $email, $type) {
    capubbs_email_verification_service($con)->invalidateCodes($username, $email, $type);
}

// ============================================================================
//  Email verification — API handlers
// ============================================================================

function jiekoufunc_sendRegisterCode($con, $params) {
    return capubbs_email_verification_service($con)->legacySendRegisterCode($params);
}

function jiekoufunc_sendVerifyCode($con, $token, $params) {
    return capubbs_email_verification_service($con)->legacySendVerifyCode($token, $params);
}

function jiekoufunc_verifyEmail($con, $token, $params) {
    return capubbs_email_verification_service($con)->legacyVerifyEmail($token, $params);
}

function jiekoufunc_sendResetPasswordCode($con, $params) {
    return capubbs_email_verification_service($con)->legacySendResetPasswordCode($params);
}

function jiekoufunc_resetPasswordByEmail($con, $params) {
    return capubbs_email_verification_service($con)->legacyResetPasswordByEmail($params);
}

function jiekoufunc_muteEmail($con, $token, $params) {
    return capubbs_email_verification_service($con)->legacyMuteEmail($token, $params);
}

function jiekoufunc_unmuteEmail($con, $token, $params) {
    return capubbs_email_verification_service($con)->legacyUnmuteEmail($token, $params);
}

function jiekoufunc_listEmailMutes($con, $token) {
    return capubbs_email_verification_service($con)->legacyListEmailMutes($token);
}

function jiekoufunc_toggleEmailVisible($con, $token, $params) {
    return capubbs_email_verification_service($con)->legacyToggleEmailVisible($token, $params);
}

function jiekoufunc_verifiedCount($con) {
    return capubbs_email_verification_service($con)->legacyVerifiedCount();
}
