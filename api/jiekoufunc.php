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
        $valid_bids = capubbs_board_repository($con)->findAllBidMap();
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
    return capubbs_user_service($con)->legacyUserExists($params);
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
    return capubbs_auth_service($con)->legacyRegister($ip, $params);
}

require_once __DIR__ . '/jiekoufunc_thread.php';

function jiekoufunc_sendmsg($con, $token, $to, $text) {
    return capubbs_message_service($con)->legacySend($token, $to, $text);
}

function jiekoufunc_boardcast($con, $token, $text) {
    return capubbs_message_service($con)->legacyBroadcast($token, $text);
}

function jiekoufunc_news($con, $token, $params) {
    return capubbs_mainpage_service($con)->legacyNews($token, $params);
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
    return capubbs_user_service($con)->legacyEditProfile($token, $ip, $params);
}

function jiekoufunc_changepsd($con, $token, $params) {
    return capubbs_auth_service($con)->legacyChangePassword($token, $params);
}

function jiekoufunc_admin_reset_password($con, $token, $params) {
    return capubbs_auth_service($con)->legacyAdminResetPassword($token, $params);
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
    return capubbs_mainpage_service($con)->legacyCalendarRows();
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
