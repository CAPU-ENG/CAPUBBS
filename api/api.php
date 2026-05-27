<?php
/**
 * /api/api.php — Unified AJAX entry point for all frontend-backend interaction.
 *
 * All future frontend AJAX requests should go through this file.
 * Uses the standard JSON envelope: { code, message, data, meta }
 *
 * Existing endpoints (jiekoujson.php, jiekouapi.php, etc.) remain
 * untouched for backward compatibility with legacy pages.
 */

require_once __DIR__ . '/../lib.php';

date_default_timezone_set('Asia/Shanghai');
header('Content-Type: application/json; charset=utf-8');

// CORS: 允许 localhost 任意端口调用
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (preg_match('#^https?://localhost(:\d+)?$#', $origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
}

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/lib/ApiError.php';
require_once __DIR__ . '/lib/ApiResponse.php';

// Collect parameters. Start with all request data, then override with
// sanitized versions for the core fields that jiekoufunc_dispatch expects.
$params = $_REQUEST;
$params['ask']   = isset($_REQUEST['ask'])   ? $_REQUEST['ask']   : '';
$params['view']  = isset($_REQUEST['view'])  ? $_REQUEST['view']  : '';
$params['limit'] = isset($_REQUEST['limit']) ? $_REQUEST['limit'] : '';
$params['bid']   = intval(isset($_REQUEST['bid']) ? $_REQUEST['bid'] : 0);
$params['tid']   = intval(isset($_REQUEST['tid']) ? $_REQUEST['tid'] : 0);
$params['pid']   = intval(isset($_REQUEST['pid']) ? $_REQUEST['pid'] : 0);
$params['token'] = isset($_COOKIE['token'])  ? $_COOKIE['token']  : '';
$params['ip']    = $_SERVER['REMOTE_ADDR'];

$con = dbconnect_mysqli();

// Route mainpage-specific operations (originally in /assets/api/main.php)
// to their new handlers. Everything else goes through jiekoufunc_dispatch.
$mainpage_asks = array(
    'getfilesize', 'loadcalendar', 'savecalendar',
    'addinform', 'delinform', 'saveimg',
    'add_download', 'edit_download', 'del_download',
);
if (in_array($params['ask'], $mainpage_asks, true)) {
    require_once __DIR__ . '/lib/MainpageHandlers.php';
    $result = mainpage_dispatch($con, $params);
} else {
    require_once __DIR__ . '/jiekoufunc.php';
    $result = jiekoufunc_dispatch($con, $params);
}

ApiResponse::fromDispatchResult($result)->send();
