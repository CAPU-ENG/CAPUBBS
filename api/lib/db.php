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

require_once __DIR__ . '/../../src/Bootstrap.php';

// ============================================================================
//  DB helper functions
// ============================================================================

function jiekoufunc_token2user($con, $token) {
    return capubbs_user_repository($con)->findByToken($token);
}

function jiekoufunc_getrights($con, $bid, $token) {
    return capubbs_permission_service($con)->getLegacyRightsTuple($bid, $token);
}

function jiekoufunc__userexists($con, $user) {
    return capubbs_user_repository($con)->legacyUserExistsCode($user) === '1';
}

function jiekoufunc_insertmsg($con, $from, $to, $text, $bid, $tid, $pid, $ruser, $rmsg) {
    return capubbs_message_repository($con)->insert($from, $to, $text, $bid, $tid, $pid, $ruser, $rmsg);
}

function jiekoufunc_updatestar($con, $username) {
    capubbs_user_repository($con)->recalculateStar($username);
}

function jiekoufunc_search_replace_exec_at($con, $text, $bid, $tid, $pid, $username, $tidtitle) {
    capubbs_notification_service($con)->notifyMentionsAndQuotes($text, $bid, $tid, $pid, $username, $tidtitle);
    return $text;
}

function jiekoufunc__delattach($con, $id) {
    $ainfo = capubbs_attachment_repository($con)->findById($id);
    if (!$ainfo) {
        return false;
    }
    if ($ainfo['path']) {
        if (!file_exists($GLOBALS['attachroot'] . $ainfo['path']) || true) {
            if (capubbs_attachment_repository($con)->markDeletedById($id)) {
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

function jiekoufunc_view_user_array($con, $username, $viewer = null) {
    return capubbs_user_repository($con)->findPublicProfiles($username, $viewer);
}

// ============================================================================
//  Validation helpers
// ============================================================================

function jiekoufunc_validate_token_and_sign($con, $token, $ip) {
    return capubbs_auth_service($con)->legacyCheckUserAndSign($token, $ip, $_REQUEST);
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
