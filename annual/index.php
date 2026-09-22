<?php
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache');

$years = array();
foreach (scandir(__DIR__) as $entry) {
    if (preg_match('/^[0-9]{4}$/D', $entry)
        && is_dir(__DIR__ . '/' . $entry)
        && is_file(__DIR__ . '/' . $entry . '/index.html')) {
        $years[] = $entry;
    }
}
rsort($years, SORT_NUMERIC);
?>
<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>年刊 · 北大车协</title>
    <link rel="stylesheet" href="/annual/style.css">
</head>
<body>
    <div class="annual-shell">
        <header class="annual-header">
            <a class="annual-brand" href="/">北大车协</a>
            <nav aria-label="站点导航">
                <a href="/bbs/">论坛</a>
                <a href="/bbs/archive-room">档案室</a>
            </nav>
        </header>
        <main>
            <h1>年刊</h1>
<?php if (count($years) === 0): ?>
            <p class="annual-empty">暂无年刊</p>
<?php else: ?>
            <ul class="annual-list" aria-label="历年年刊">
<?php foreach ($years as $year): ?>
                <li>
                    <a class="annual-issue" href="/annual/<?php echo $year; ?>/" aria-label="阅读 <?php echo $year; ?> 年刊">
                        <span class="annual-year"><?php echo $year; ?></span>
                        <span class="annual-issue-label">年刊</span>
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
