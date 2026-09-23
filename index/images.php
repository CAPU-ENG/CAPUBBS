<?php
require __DIR__.'/includes/session.php';
if ($rights < 3) http_response_code(403);
?>
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>宣传图管理 · 北京大学自行车协会</title>
  <link rel="icon" type="image/png" href="/bbs/favicon.png">
  <link rel="stylesheet" href="/assets/css/home-session.css">
  <link rel="stylesheet" href="/assets/css/home-videos.css">
  <link rel="stylesheet" href="/assets/css/home-images.css">
  <script src="/assets/js/home-session.js" defer></script>
<?php if ($rights >= 3) { ?>
  <script src="/assets/js/home-images.js" defer></script>
<?php } ?>
</head>
<body>
  <header><a href="/">CAPU</a><?php require __DIR__.'/includes/session-links.php'; ?></header>
  <main>
    <h1>宣传图管理</h1>
<?php if ($rights < 3) { ?>
    <p>仅权限 3 及以上可编辑宣传图。</p>
<?php } else { ?>
    <form id="image-editor">
      <fieldset id="image-fields" disabled>
        <div id="image-rows"></div>
        <button id="image-add" type="button">添加宣传图</button>
        <div class="editor-actions"><button type="submit">保存</button><button id="image-reload" type="button">重新加载</button></div>
      </fieldset>
      <p id="image-status" role="status" aria-live="polite">正在加载…</p>
      <button id="image-retry" type="button" hidden>重试</button>
    </form>
<?php } ?>
  </main>
</body>
</html>
