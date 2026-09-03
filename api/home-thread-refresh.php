<?php
/** Incrementally refresh private snapshots for homepage thread targets. */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/dispatch.php';
require_once __DIR__ . '/lib/HomeThreadSnapshot.php';

date_default_timezone_set('Asia/Shanghai');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

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

$token = isset($_COOKIE['token']) ? $_COOKIE['token'] : '';
$result = home_thread_snapshot_refresh(8, $token);
$isError = isset($result['status']) && $result['status'] === 'error';
if ($isError) http_response_code(503);
echo json_encode(array(
    'code' => $isError ? 4003 : 0,
    'message' => $isError ? $result['message'] : 'success',
    'data' => $result,
), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
