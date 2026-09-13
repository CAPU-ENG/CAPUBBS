<?php
/**
 * Legacy activity-create endpoint.
 *
 * Kept for the old forum UI. New clients use /api/api.php with
 * ask=activity_create; both paths share ActivityHandlers.php.
 */

require_once __DIR__ . '/../../../../lib.php';
require_once __DIR__ . '/../../../jiekoufunc.php';
require_once __DIR__ . '/../../../lib/ActivityHandlers.php';

header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('Asia/Shanghai');

$con = dbconnect_mysqli();
$params = $_POST;
$token = isset($_COOKIE['token']) ? $_COOKIE['token'] : '';
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
$bid = intval(isset($params['bid']) ? $params['bid'] : 0);

// Missing signup times remain valid only on this legacy entry point.
$result = activity_handler_create($con, $token, $bid, $ip, $params, true);
echo json_encode(activity_handler_legacy_response($result), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
