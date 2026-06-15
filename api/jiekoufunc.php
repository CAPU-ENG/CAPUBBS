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
