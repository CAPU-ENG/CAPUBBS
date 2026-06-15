<?php
    require_once __DIR__ . '/../../src/Bootstrap.php';

    function getTidInfo($con, $bid, $tid) {
        return capubbs_thread_read_service($con)->legacyGetTidInfo($bid, $tid);
    }

    function checkUserAndSign($con, $ip, $token) {
        return capubbs_auth_service($con)->legacyCheckUserAndSign($token, $ip, $_REQUEST);
    }

    function getOnePage($con, $bid, $tid, $page, $see_lz, $ip, $token) {
        return capubbs_thread_read_service($con)->legacyGetOnePage($bid, $tid, $page, $see_lz, $ip, $token);
    }
?>
