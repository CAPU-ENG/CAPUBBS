  <a class="skip-link" href="#main">跳转到正文</a>
  <header class="site-header">
    <div class="page-width header-inner">
      <a class="brand" href="/">
        <img src="/bbs/favicon.png" width="40" height="40" alt="">
        <span class="brand-name"><?php echo homepage_escape($homepageContent['name']); ?></span>
      </a>
      <nav class="site-nav" aria-label="页面导航">
<?php foreach ($homepageContent['navigation'] as $item) { ?>
        <a href="<?php echo homepage_escape($item['href']); ?>"><?php echo homepage_escape($item['title']); ?></a>
<?php } ?>
      </nav>
      <div class="header-actions">
        <a class="forum-link" href="/bbs/">进入论坛</a>
        <?php require __DIR__.'/session-links.php'; ?>
      </div>
    </div>
  </header>
