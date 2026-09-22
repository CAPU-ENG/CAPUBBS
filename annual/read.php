<?php
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store');

// The manifest describes the published static files, never the document layout.
function annual_collect_files($directory, $urlPrefix, &$files) {
    $entries = scandir($directory);
    if ($entries === false) throw new RuntimeException('Cannot list annual directory.');
    foreach ($entries as $entry) {
        if ($entry[0] === '.' || is_link($directory . '/' . $entry)) continue;
        $path = $directory . '/' . $entry;
        $url = $urlPrefix . rawurlencode($entry);
        if (is_dir($path)) {
            annual_collect_files($path, $url . '/', $files);
        } elseif (is_file($path)) {
            $extension = strtolower(pathinfo($entry, PATHINFO_EXTENSION));
            if (in_array($extension, array('php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar', 'inc', 'sql', 'ini', 'md', 'log', 'bak', 'dump', 'sh', 'env'), true)) continue;
            $size = filesize($path);
            if ($size === false) throw new RuntimeException('Cannot read annual file.');
            $files[] = array('url' => $url, 'size' => $size);
        }
    }
}

$year = isset($_GET['year']) && is_string($_GET['year']) ? $_GET['year'] : '';
$isManifestRequest = isset($_GET['manifest']) && $_GET['manifest'] === '1';
$manifest = null;
$error = '';
if (!preg_match('/^[0-9]{4}$/D', $year)
    || is_link(__DIR__ . '/' . $year)
    || !is_file(__DIR__ . '/' . $year . '/index.html')
    || is_link(__DIR__ . '/' . $year . '/index.html')) {
    http_response_code(404);
    $error = '年刊不存在';
    $year = '';
} elseif ($isManifestRequest) {
    try {
        $files = array();
        annual_collect_files(__DIR__ . '/' . $year, '/annual/' . $year . '/', $files);
        $manifest = array(
            'year' => $year,
            'entry' => '/annual/' . $year . '/',
            'files' => $files,
            'totalBytes' => array_sum(array_map(function ($file) { return $file['size']; }, $files))
        );
    } catch (Exception $exception) {
        http_response_code(500);
        error_log('Annual manifest: ' . $exception->getMessage());
        $error = '年刊暂时无法读取';
    }
}
if ($isManifestRequest) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($manifest !== null ? $manifest : array('error' => $error), JSON_UNESCAPED_SLASHES);
    exit;
}
$canLoad = $error === '';
?>
<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>车协年刊</title>
    <link rel="icon" type="image/png" href="/bbs/favicon.png">
    <link rel="stylesheet" href="/annual/style.css">
<?php if ($canLoad): ?>
    <script src="/annual/loader.js" defer></script>
<?php endif; ?>
</head>
<body class="annual-loading-page">
    <main class="annual-loading" aria-labelledby="loading-title" aria-busy="<?php echo $canLoad ? 'true' : 'false'; ?>">
        <div class="annual-book-mark" aria-hidden="true"><span></span><span></span><span></span></div>
        <h1 id="loading-title"><?php echo $year === '' ? '年刊' : $year . ' 年刊'; ?></h1>
        <p id="loading-status" role="status"><?php echo $error === '' ? '正在准备' : $error; ?></p>
<?php if ($canLoad): ?>
        <progress id="loading-progress" aria-label="年刊下载进度" max="100" value="0"></progress>
        <div class="annual-loading-detail"><span id="loading-size">0 B / 0 B</span><span id="loading-percent">0%</span></div>
        <noscript><p>请启用 JavaScript 后加载年刊。</p></noscript>
<?php endif; ?>
        <div class="annual-loading-actions">
            <button id="loading-retry" type="button" hidden>重新加载</button>
            <a href="/annual/">返回目录</a>
        </div>
    </main>
<?php if ($canLoad): ?>
    <script id="annual-request" type="application/json"><?php echo json_encode(array('year' => $year), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?></script>
<?php endif; ?>
</body>
</html>
