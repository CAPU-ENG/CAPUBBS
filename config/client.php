<?php

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

echo json_encode(
    array(
        'browserDownloadUrl' => defined('CAPUBBS_BROWSER_DOWNLOAD_URL')
            ? CAPUBBS_BROWSER_DOWNLOAD_URL
            : '',
    ),
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);
