<?php
require __DIR__.'/includes/session.php';
require __DIR__.'/includes/homepage-content.php';
?>
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#203c32">
  <title>协会介绍 · <?php echo homepage_escape($homepageContent['name']); ?></title>
  <link rel="icon" type="image/png" href="/bbs/favicon.png">
  <link rel="stylesheet" href="/assets/css/home-session.css">
  <link rel="stylesheet" href="/assets/css/homepage.css">
  <script src="/bbs/lib/md5.js" defer></script>
  <script src="/assets/js/home-session.js" defer></script>
  <script src="/assets/js/home-background.js" defer></script>
</head>
<body id="top">
<?php require __DIR__.'/includes/site-header.php'; ?>

  <main class="intro-main" id="main">
    <div class="page-width intro-layout">
      <nav class="intro-toc" aria-label="协会介绍分类">
<?php foreach ($homepageContent['tabs'] as $tab) { ?>
        <a href="#<?php echo $tab['id']; ?>"><?php echo $tab['title']; ?></a>
<?php } ?>
      </nav>
      <div class="intro-articles">
<?php foreach ($homepageContent['tabs'] as $tab) { ?>
        <article class="about-panel" id="<?php echo $tab['id']; ?>">
<?php readfile(__DIR__.'/content/'.$tab['file']); ?>
        </article>
<?php } ?>
      </div>
    </div>
  </main>

<?php require __DIR__.'/includes/site-footer.php'; ?>
</body>
</html>
