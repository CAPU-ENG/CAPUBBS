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
    $service = capubbs_nested_reply_service($con);
    if ($method == "ask") {
        return $service->legacyList($fid);
    }
    if ($method == "post") {
        return $service->legacyPost($fid, $token, $ip, $params);
    }
    if ($method == "delete") {
        return $service->legacyDelete($fid, $token, $params);
    }
    return CapubbsLegacyResultAdapter::report('14', '未知lzl操作');
}
