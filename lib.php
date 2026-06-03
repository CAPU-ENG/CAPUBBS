<?php
/**
 * Global shared lib for CAPUBBS.
 */
require_once __DIR__ . '/config.php';

// Database connector (mysqli).
function dbconnect_mysqli() {
    $con = @mysqli_connect(CAPUBBS_DB_HOSTNAME, CAPUBBS_DB_USERNAME,
        CAPUBBS_DB_PASSWORD, "capubbs") or die("Cannot connect to database !!!");
    if (mysqli_connect_errno()) {
        echo "连接 MySQL 失败: " . mysqli_connect_error();
        return null;
    }

    // Set to `utf8mb4` in order to support emoji
    mysqli_query($con, "SET NAMES 'utf8mb4'");

    // Allow insert null while the column is defined with not null
    mysqli_query($con, "SET sql_mode = ''");

    return $con;
}

function checkuser_mysqli() {
    $token = @$_COOKIE['token'];
    if ($token == "") return array("", 0);
    $con = dbconnect_mysqli();
    $time = time();
    $statement = "select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=60*60*24*7";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) return array("", 0);
    $res = mysqli_fetch_array($results);
    return $res;
}

function checkuser_con($con) {
    $token = @$_COOKIE['token'];
    if ($token == "") return array("", 0);
    $time = time();
    $statement = "select username, rights from capubbs.userinfo where token='$token' && $time-tokentime<=60*60*24*7";
    $results = mysqli_query($con, $statement);
    if (mysqli_num_rows($results) == 0) return array("", 0);
    $res = mysqli_fetch_array($results);
    return $res;
}

// Shared routing key resolver used by both mainfunc.php and client.php.
function _jiekoufunc_resolve_route_key($posts) {
    $ask = isset($posts['ask']) ? $posts['ask'] : '';
    if ($ask) {
        return $ask;
    }
    if (isset($posts['view']) && $posts['view'] != '') return '__view';
    if (intval(isset($posts['bid']) ? $posts['bid'] : 0) != 0) {
        if (intval(isset($posts['tid']) ? $posts['tid'] : 0) != 0) return '__tid_default';
        return '__bbs_default';
    }
    return '';
}

// Shared API routing loader used by both mainfunc.php and client.php.
function _jiekoufunc_get_api_routing() {
    static $routing = null;
    if ($routing === null) {
        $routing = require __DIR__ . '/config/api-routing.php';
    }
    return $routing;
}

// Sanitize string for XML 1.0 compliance: strip control characters that are
// illegal even inside CDATA sections (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F).
function sanitize_xml($str) {
    if ($str === null || $str === '') return $str;
    return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $str);
}

// Enrich user info array with signature data from user_sig table.
// Prefers user_sig values over any existing sig1/sig2/sig3 in $info.
// $username must already be SQL-escaped.
function enrich_user_sigs($con, $username, &$info) {
    $sig_statement = "SELECT sig_num, sig, sig_type FROM user_sig WHERE username='$username'";
    $sig_results = mysqli_query($con, $sig_statement);
    while ($sig_row = mysqli_fetch_array($sig_results)) {
        $n = intval($sig_row['sig_num']);
        if ($n >= 1 && $n <= 3) {
            $info['sig' . $n] = $sig_row['sig'];
            $info['sig' . $n . '_type'] = $sig_row['sig_type'];
        }
    }
    for ($n = 1; $n <= 3; $n++) {
        if (!isset($info['sig' . $n . '_type'])) {
            $info['sig' . $n . '_type'] = 'raw';
        }
    }
}

// Upsert signature content and type into user_sig table.
// $username must already be SQL-escaped.
// $sigs and $sig_types are arrays indexed by sig_num (1, 2, 3).
// Values must already be SQL-escaped.
// Returns null on success, or the error message string on failure.
function upsert_user_sigs($con, $username, $sigs, $sig_types) {
    for ($n = 1; $n <= 3; $n++) {
        $sig_val = $sigs[$n];
        $sig_type_val = $sig_types[$n];
        $upsert = "INSERT INTO user_sig (username, sig_num, sig, sig_type) VALUES ('$username', $n, '$sig_val', '$sig_type_val') ON DUPLICATE KEY UPDATE sig='$sig_val', sig_type='$sig_type_val'";
        mysqli_query($con, $upsert);
        if (mysqli_error($con)) {
            return mysqli_error($con);
        }
    }
    return null;
}

// Parse the 'limit' parameter for recentpost/recentrely APIs.
// Returns: 10 (default), null (no limit), or positive int N.
function _parse_limit($raw, $default=10) {
    if ($raw === null || $raw === '' || $raw === '0') return $default;
    if ($raw === '-1' || strtolower($raw) === 'all') return null;
    $limit = intval($raw);
    if ($limit <= 0) return $default;
    return $limit;
}
?>
