<?php
/** Refresh the public homepage snapshot when it is missing, dirty, or stale. */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/lib/HomeHotSnapshot.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('code' => 3001, 'message' => 'Method not allowed.'));
    exit;
}

$result = home_hot_snapshot_refresh();
$isError = isset($result['status']) && $result['status'] === 'error';
if ($isError) http_response_code(503);
echo json_encode(array(
    'code' => $isError ? 4003 : 0,
    'message' => $isError ? $result['message'] : 'success',
    'data' => $result,
), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
