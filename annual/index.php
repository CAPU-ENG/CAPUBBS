<?php
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache');

$years = array();
foreach (scandir(__DIR__) as $entry) {
    if (preg_match('/^[0-9]{4}$/D', $entry)
        && is_dir(__DIR__ . '/' . $entry)
        && !is_link(__DIR__ . '/' . $entry)
        && !is_link(__DIR__ . '/' . $entry . '/index.html')
        && is_file(__DIR__ . '/' . $entry . '/index.html')) {
        $years[] = $entry;
    }
}
rsort($years, SORT_NUMERIC);

$titlesJson = @file_get_contents(__DIR__ . '/titles.json');
$titles = $titlesJson === false ? array() : json_decode($titlesJson, true);
if (!is_array($titles)) $titles = array();
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
    <script src="/annual/background.js" defer></script>
</head>
<body class="annual-directory-page">
    <div class="annual-shell">
        <header class="annual-header">
            <a class="annual-brand" href="/">北大车协</a>
            <nav aria-label="站点导航">
                <a href="/bbs/">论坛</a>
                <a href="/bbs/archive-room">档案室</a>
            </nav>
        </header>
        <main class="annual-catalog">
            <div class="annual-heading">
                <h1 class="annual-title" aria-label="年刊"><span aria-hidden="true">年</span><span aria-hidden="true">刊</span></h1>
                <p class="annual-subtitle" lang="en">CAPU YEARBOOK</p>
                <div class="annual-book-mark" aria-hidden="true"><span></span><span></span><span></span></div>
            </div>
<?php if (count($years) === 0): ?>
            <p class="annual-empty">暂无年刊</p>
<?php else: ?>
            <ul class="annual-list" aria-label="历年年刊">
<?php foreach ($years as $year):
    $title = isset($titles[$year]) && is_string($titles[$year]) ? trim($titles[$year]) : '';
?>
                <li>
                    <a class="annual-issue" href="/annual/read.php?year=<?php echo $year; ?>">
                        <span class="annual-year"><?php echo $year; ?></span>
<?php if ($title !== ''): ?>
                        <span class="annual-issue-title"><?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?></span>
<?php endif; ?>
                        <span class="annual-arrow" aria-hidden="true">↗</span>
                    </a>
                </li>
<?php endforeach; ?>
            </ul>
<?php endif; ?>
        </main>
    </div>
</body>
</html>
