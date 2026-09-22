<?php
require __DIR__.'/includes/session.php';
if ($rights < 3) http_response_code(403);
?>
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>联系方式管理 · 北京大学自行车协会</title>
  <link rel="icon" type="image/png" href="/bbs/favicon.png">
  <link rel="stylesheet" href="/assets/css/home-session.css">
  <link rel="stylesheet" href="/assets/css/home-videos.css">
  <link rel="stylesheet" href="/assets/css/home-contacts.css">
  <script src="/assets/js/home-session.js" defer></script>
<?php if ($rights >= 3) { ?>
  <script src="/assets/js/home-contacts.js" defer></script>
<?php } ?>
</head>
<body>
  <header><a href="/">CAPU</a><?php require __DIR__.'/includes/session-links.php'; ?></header>
  <main>
    <h1>联系方式管理</h1>
<?php if ($rights < 3) { ?>
    <p>仅权限 3 及以上可编辑联系方式。</p>
<?php } else { ?>
    <form id="contact-editor">
      <fieldset id="contact-fields" disabled>
        <label for="contact-text">联系方式</label>
        <textarea id="contact-text" name="text" rows="12" maxlength="5000" required></textarea>
        <div class="editor-actions"><button type="submit">保存</button><button id="contact-reload" type="button">重新加载</button><a href="/#contact">返回首页</a></div>
      </fieldset>
      <p id="contact-status" role="status" aria-live="polite">正在加载…</p>
      <button id="contact-retry" type="button" hidden>重试</button>
    </form>
<?php } ?>
  </main>
</body>
</html>
