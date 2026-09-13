<?php
if (PHP_SAPI !== 'cli-server') {
    http_response_code(404);
    exit;
}

$requestPath = parse_url(@$_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (!is_string($requestPath)) return false;

function capubbs_router_starts_with($value, $prefix) {
    return $prefix === '' || strncmp($value, $prefix, strlen($prefix)) === 0;
}

function serve_new_forum_file($requestPath, $urlPrefix, $fileRoot) {
    if (!capubbs_router_starts_with($requestPath, $urlPrefix)) return false;

    $relativePath = rawurldecode(substr($requestPath, strlen($urlPrefix)));
    $rootPath = realpath($fileRoot);
    $filePath = realpath($fileRoot.'/'.$relativePath);
    if ($rootPath === false || $filePath === false || !capubbs_router_starts_with($filePath, $rootPath.'/') || !is_file($filePath)) {
        http_response_code(404);
        exit;
    }

    $contentTypes = array(
        'css' => 'text/css; charset=UTF-8',
        'gif' => 'image/gif',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'js' => 'application/javascript; charset=UTF-8',
        'png' => 'image/png',
        'svg' => 'image/svg+xml',
        'webp' => 'image/webp',
        'woff2' => 'font/woff2'
    );
    $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    header('Content-Type: '.(@$contentTypes[$extension] ?: 'application/octet-stream'));
    header('Content-Length: '.filesize($filePath));
    header('Cache-Control: public, max-age=31536000, immutable');
    readfile($filePath);
    exit;
}

serve_new_forum_file($requestPath, '/bbs/new-assets/', __DIR__.'/forum/dist/new-assets');
if ($requestPath === '/bbs/favicon.png') {
    serve_new_forum_file('/bbs/static/favicon.png', '/bbs/static/', __DIR__.'/forum/dist');
}

if ($requestPath !== '/bbs' && !capubbs_router_starts_with($requestPath, '/bbs/')) return false;

$passthroughPrefixes = array(
    '/bbs/assets/',
    '/bbs/attach/',
    '/bbs/download/',
    '/bbs/images/',
    '/bbs/lib/',
    '/bbs/utils/'
);
$passthroughPaths = array(
    '/bbs/content/test.php',
    '/bbs/register/action.php',
    '/bbs/register/userexists.php'
);

foreach ($passthroughPrefixes as $passthroughPrefix) {
    if (capubbs_router_starts_with($requestPath, $passthroughPrefix)) return false;
}
if (in_array($requestPath, $passthroughPaths, true)) return false;
$forumMode = @$_COOKIE['capubbs_forum_mode'];
if ($forumMode === 'legacy') return false;

require __DIR__.'/bbs/index.php';
