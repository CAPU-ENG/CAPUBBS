<?php
/** Authenticated facade for homepage-targeted thread snapshots. */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/lib/ApiError.php';
require_once __DIR__ . '/lib/ApiResponse.php';
require_once __DIR__ . '/dispatch.php';
require_once __DIR__ . '/lib/HomeThreadSnapshot.php';

date_default_timezone_set('Asia/Shanghai');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: private, no-store');

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (preg_match('#^https?://localhost(:\d+)?$#', $origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('code' => 3001, 'message' => 'Method not allowed.'));
    exit;
}

$params = $_REQUEST;
$params['bid'] = intval(isset($_REQUEST['bid']) ? $_REQUEST['bid'] : 0);
$params['tid'] = intval(isset($_REQUEST['tid']) ? $_REQUEST['tid'] : 0);
$token = isset($_COOKIE['token']) ? $_COOKIE['token'] : '';
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
$connection = dbconnect_mysqli();
$cacheStatus = 'bypass';
$result = home_thread_snapshot_dispatch_detail(
    $connection,
    $params['bid'],
    $params['tid'],
    $params,
    $token,
    $ip,
    $cacheStatus
);
header('Server-Timing: thread-cache;desc="' . preg_replace('/[^a-z-]/', '', $cacheStatus) . '"');
header('X-CAPUBBS-Thread-Cache: ' . strtoupper($cacheStatus));
ApiResponse::fromDispatchResult($result)->send();
