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

// Mirror real-directory hosting for annuals, including relative asset URLs.
// PHP's development server otherwise falls back to a parent's index.php on 404.
if ($requestPath === '/annual' || capubbs_router_starts_with($requestPath, '/annual/')) {
    $annualRoot = realpath(__DIR__ . '/annual');
    $annualPath = realpath(__DIR__ . rawurldecode($requestPath));
    if ($annualRoot === false || $annualPath === false
        || ($annualPath !== $annualRoot && !capubbs_router_starts_with($annualPath, $annualRoot . '/'))
        || (is_dir($annualPath) && !is_file($annualPath . '/index.html') && !is_file($annualPath . '/index.php'))) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=UTF-8');
        echo 'Not Found';
        exit;
    }
    if (is_dir($annualPath) && substr($requestPath, -1) !== '/') {
        $query = isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '' ? '?' . $_SERVER['QUERY_STRING'] : '';
        header('Location: ' . $requestPath . '/' . $query, true, 308);
        exit;
    }
    return false;
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
        'webmanifest' => 'application/manifest+json; charset=UTF-8',
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
