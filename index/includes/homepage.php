<?php
require __DIR__.'/session.php';
require __DIR__.'/videos.php';
$homepageContent = require __DIR__.'/../homepage-content.php';
$homepageLoginModal = true;
?>
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#203c32">
<?php if (!empty($homepagePreview)) { ?>
  <meta name="robots" content="noindex, nofollow">
<?php } ?>
  <title><?php echo homepage_escape($homepageContent['name']); ?> · CAPU</title>
  <link rel="icon" type="image/png" href="/bbs/favicon.png">
  <link rel="stylesheet" href="/assets/css/home-session.css">
  <link rel="stylesheet" href="/assets/css/homepage.css">
  <script src="/bbs/lib/md5.js" defer></script>
  <script src="/assets/js/home-session.js" defer></script>
  <script src="/assets/js/homepage.js" defer></script>
</head>
<body id="top">
  <a class="skip-link" href="#main">跳转到正文</a>
  <header class="site-header page-width">
    <a class="brand" href="/" aria-label="北京大学自行车协会首页">
      <img src="/bbs/favicon.png" width="44" height="44" alt="">
      <span class="brand-wordmark">CAPU</span>
      <span class="brand-name"><?php echo homepage_escape($homepageContent['name']); ?></span>
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation" hidden>菜单 <span aria-hidden="true">＋</span></button>
    <nav class="navigation" id="navigation" aria-label="主导航">
      <a href="#videos">视频资料</a>
      <a href="#about">协会介绍</a>
      <a href="#contact">联系方式</a>
      <?php require __DIR__.'/session-links.php'; ?>
    </nav>
  </header>

  <main id="main">
    <section class="hero page-width" aria-labelledby="hero-title">
      <div class="hero-copy">
        <h1 id="hero-title">深入社会，<br>融于自然<span>。</span></h1>
        <a class="forum-link" href="/bbs/"><span>进入论坛</span><span class="arrow-circle" aria-hidden="true">↗</span></a>
        <a class="hero-about" href="#about">认识车协 <span aria-hidden="true">↓</span></a>
        <span class="hero-wordmark" aria-hidden="true">CAPU</span>
      </div>
      <div class="promotion" role="region" aria-label="宣传图" aria-roledescription="轮播图" data-promotion>
        <div class="promotion-stage" id="promotion-slides"></div>
        <div class="promotion-empty" data-image-state>
          <span class="empty-mark" aria-hidden="true">CAPU</span>
          <p data-image-status role="status"></p>
          <button class="text-button" type="button" data-image-retry hidden>重新加载</button>
          <noscript><p>启用 JavaScript 以加载宣传图。</p></noscript>
        </div>
        <div class="promotion-bar">
          <span class="promotion-caption" data-image-caption>宣传图</span>
          <div class="promotion-controls" data-image-controls hidden>
            <span class="promotion-count" aria-live="polite" aria-atomic="true"><span data-image-number>01</span><span aria-hidden="true"> / </span><span data-image-total></span></span>
            <button type="button" data-image-step="-1" aria-label="上一张宣传图" aria-controls="promotion-slides">←</button>
            <button type="button" data-image-step="1" aria-label="下一张宣传图" aria-controls="promotion-slides">→</button>
          </div>
        </div>
<?php if ($rights >= 3) { ?>
        <a class="promotion-manage" href="/index/images.php">管理宣传图 <span aria-hidden="true">↗</span></a>
<?php } ?>
      </div>
    </section>

    <section class="videos page-width section-space" id="videos" aria-labelledby="videos-title">
      <div class="section-heading">
        <h2 id="videos-title">视频资料<span class="heading-dot" aria-hidden="true">.</span></h2>
        <div class="section-actions">
          <a class="text-link" data-video-more href="<?php echo homepage_escape($homepageVideos['moreUrl']); ?>" target="_blank" rel="noopener noreferrer"<?php if ($homepageVideos['moreUrl'] === '') echo ' hidden'; ?>>全部视频 <span aria-hidden="true">↗</span></a>
<?php if ($rights >= 3) { ?>
          <a class="text-link" href="/index/videos.php">管理视频 <span aria-hidden="true">↗</span></a>
<?php } ?>
        </div>
      </div>
      <div class="video-grid" data-video-list>
<?php foreach ($homepageVideos['videos'] as $number => $video) { ?>
        <a class="video-link" href="<?php echo homepage_escape($video['url']); ?>" target="_blank" rel="noopener noreferrer">
          <span class="video-number" aria-hidden="true"><?php echo str_pad($number + 1, 2, '0', STR_PAD_LEFT); ?></span>
          <span class="video-play" aria-hidden="true">▷</span>
          <h3><?php echo homepage_escape($video['title']); ?></h3>
          <span class="video-arrow" aria-hidden="true">↗</span>
        </a>
<?php } ?>
      </div>
      <div class="section-status" role="status" data-video-status<?php if (!$homepageVideosError && count($homepageVideos['videos']) > 0) echo ' hidden'; ?>><?php echo $homepageVideosError ? '视频暂时无法加载。' : '暂无视频资料。'; ?></div>
      <button class="text-button" type="button" data-video-retry hidden>重新加载</button>
    </section>

    <section class="about" id="about" aria-labelledby="about-title">
      <div class="about-layout page-width">
        <div class="about-heading"><h2 id="about-title">协会介绍<span class="heading-dot" aria-hidden="true">.</span></h2><time datetime="1995-10-25"><?php echo homepage_escape($homepageContent['founded']); ?></time></div>
        <div class="about-copy">
          <h3><?php echo homepage_escape($homepageContent['name']); ?></h3>
<?php foreach ($homepageContent['about'] as $paragraph) { ?>
          <p><?php echo homepage_escape($paragraph); ?></p>
<?php } ?>
        </div>
      </div>
      <div class="about-wordmark page-width" aria-hidden="true">CAPU<span>↗</span></div>
    </section>

    <section class="contact page-width section-space" id="contact" aria-labelledby="contact-title">
      <div class="section-heading"><h2 id="contact-title">联系方式<span class="heading-dot" aria-hidden="true">.</span></h2></div>
      <div class="contact-grid">
        <div class="contact-item">
          <h3>微信公众号</h3>
          <button class="contact-value" type="button" data-copy-wechat="<?php echo homepage_escape($homepageContent['wechat']); ?>" aria-label="复制微信公众号名称：<?php echo homepage_escape($homepageContent['wechat']); ?>"><?php echo homepage_escape($homepageContent['wechat']); ?><span aria-hidden="true">⧉</span></button>
<?php if (is_file(__DIR__.'/../../assets/images/qrcode_wechat.jpg')) { ?>
          <details class="wechat-code"><summary>查看二维码</summary><img src="/assets/images/qrcode_wechat.jpg" alt="北大车协微信公众号二维码" width="180" height="180" loading="lazy"></details>
<?php } ?>
          <span class="copy-status" data-copy-status role="status"></span>
        </div>
        <div class="contact-item"><h3>新浪微博</h3><a class="contact-value" href="<?php echo homepage_escape($homepageContent['weibo']); ?>" target="_blank" rel="noopener noreferrer">北大车协<span aria-hidden="true">↗</span></a></div>
        <div class="contact-item"><h3>论坛反馈</h3><a class="contact-value" href="mailto:<?php echo homepage_escape($homepageContent['email']); ?>"><?php echo homepage_escape($homepageContent['email']); ?><span aria-hidden="true">↗</span></a></div>
        <div class="contact-item contact-address"><h3>地址</h3><address><?php echo homepage_escape($homepageContent['address']); ?><span>邮编 <?php echo homepage_escape($homepageContent['postalCode']); ?></span></address></div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-top page-width">
      <a class="footer-brand" href="/">CAPU<span><?php echo homepage_escape($homepageContent['name']); ?></span></a>
      <nav aria-label="页脚导航"><a href="https://www.pku.edu.cn/" target="_blank" rel="noopener noreferrer">北京大学 ↗</a><a href="/privacy/">隐私政策</a><a href="#top">回到顶部 ↑</a></nav>
    </div>
    <div class="footer-bottom page-width"><span>© 2001–<?php echo date('Y'); ?> <?php echo homepage_escape($homepageContent['name']); ?></span><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"><?php echo homepage_escape($homepageContent['registration']); ?></a></div>
  </footer>

  <dialog class="login-dialog" id="home-login" aria-labelledby="login-title">
    <button class="dialog-close" type="button" data-close-login aria-label="关闭登录">×</button>
    <h2 id="login-title">登录</h2>
    <form id="home-login-form">
      <fieldset id="home-login-fields">
        <label for="home-username">用户名</label><input id="home-username" name="username" autocomplete="username" required maxlength="100">
        <label for="home-password">密码</label><input id="home-password" name="password" type="password" autocomplete="current-password" required>
        <p class="login-error" role="alert" data-login-error hidden></p>
        <button class="login-submit" type="submit">登录 <span aria-hidden="true">↗</span></button>
      </fieldset>
      <div class="login-links"><a href="/bbs/register/">注册账号</a><a href="/bbs/login">前往论坛登录</a></div>
    </form>
  </dialog>
</body>
</html>
