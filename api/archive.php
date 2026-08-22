<?php
/**
 * Dedicated archive room API.
 *
 * This endpoint is intentionally separate from api/api.php: archive downloads
 * stream binary data, while the other operations mutate both MySQL metadata
 * and the configured filesystem tree.
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/lib/ApiError.php';
require_once __DIR__ . '/lib/ApiResponse.php';
require_once __DIR__ . '/lib/ArchiveService.php';

date_default_timezone_set('Asia/Shanghai');

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (preg_match('#^https?://localhost(:\d+)?$#', $origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $con = dbconnect_mysqli();
    $identity = checkuser_con($con);
    if (empty($identity[0])) {
        ApiResponse::error(ApiError::NOT_LOGGED_IN, '请先登录档案室。')->send();
    }

    $username = strval($identity[0]);
    $rights = intval($identity[1]);
    $usernameEscaped = mysqli_real_escape_string($con, $username);
    $userResult = mysqli_query($con, "SELECT userid FROM userinfo WHERE username='{$usernameEscaped}' LIMIT 1");
    if ($userResult === false || !($userRow = mysqli_fetch_assoc($userResult))) {
        ApiResponse::error(ApiError::USER_NOT_FOUND, '当前用户不存在。')->send();
    }

    $service = new ArchiveService($con, intval($userRow['userid']), $username, $rights);
    $ask = strtolower(trim(isset($_REQUEST['ask']) ? strval($_REQUEST['ask']) : ''));

    switch ($ask) {
        case 'list':
            ApiResponse::success($service->listEntries(archive_param('parent_key', null)))->send();
            break;
        case 'upload':
            $upload = isset($_FILES['file']) ? $_FILES['file'] : null;
            ApiResponse::success($service->upload(
                archive_param('parent_key', null),
                archive_param('name', ''),
                $upload
            ))->send();
            break;
        case 'mkdir':
            ApiResponse::success($service->createFolder(
                archive_param('parent_key', null),
                archive_param('name', '')
            ))->send();
            break;
        case 'rename':
            ApiResponse::success($service->renameEntry(
                archive_param('entry_key', ''),
                archive_param('name', '')
            ))->send();
            break;
        case 'move':
            ApiResponse::success($service->moveEntry(
                archive_param('entry_key', ''),
                archive_param('target_parent_key', null)
            ))->send();
            break;
        case 'mask':
            ApiResponse::success($service->maskEntry(archive_param('entry_key', '')))->send();
            break;
        case 'download':
            $service->streamDownload(
                archive_param('entry_key', ''),
                isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '',
                isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : ''
            );
            break;
        case 'download_stats':
            ApiResponse::success($service->downloadStats(
                archive_param('entry_key', ''),
                archive_param('limit', 50)
            ))->send();
            break;
        default:
            ApiResponse::error(ApiError::INVALID_ACTION, '未知的档案室操作。')->send();
    }
} catch (ArchiveServiceException $error) {
    ApiResponse::error($error->apiCode, $error->getMessage())->send();
} catch (Exception $error) {
    error_log('Archive API error: ' . $error->getMessage());
    ApiResponse::error(ApiError::INTERNAL_ERROR, '档案室服务暂时不可用。')->send();
}

function archive_param($key, $default)
{
    if (array_key_exists($key, $_POST)) return $_POST[$key];
    if (array_key_exists($key, $_GET)) return $_GET[$key];
    return $default;
}
