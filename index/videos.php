<?php
require __DIR__.'/includes/session.php';
if ($rights < 3) http_response_code(403);
?>
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>视频管理 · 北京大学自行车协会</title>
  <link rel="icon" type="image/png" href="/bbs/favicon.png">
  <link rel="stylesheet" href="/assets/css/home-session.css">
  <link rel="stylesheet" href="/assets/css/home-videos.css">
  <script src="/assets/js/home-session.js" defer></script>
<?php if ($rights >= 3) { ?>
  <script src="/assets/js/home-videos.js" defer></script>
<?php } ?>
</head>
<body>
  <header><a href="/">CAPU</a><?php require __DIR__.'/includes/session-links.php'; ?></header>
  <main>
    <h1>视频管理</h1>
<?php if ($rights < 3) { ?>
    <p>仅权限 3 及以上可编辑主页视频。</p>
<?php } else { ?>
    <form id="video-editor">
      <fieldset id="video-fields" disabled>
        <div id="video-rows"></div>
        <button id="video-add" type="button">添加视频</button>
        <label class="more-url">全部视频链接<input id="video-more-url" type="url" maxlength="2048"></label>
        <div class="editor-actions"><button type="submit">保存</button><button id="video-reload" type="button">重新加载</button></div>
      </fieldset>
      <p id="video-status" role="status" aria-live="polite">正在加载…</p>
      <button id="video-retry" type="button" hidden>重试</button>
    </form>
<?php } ?>
  </main>
</body>
</html>
