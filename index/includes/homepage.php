<?php
require __DIR__.'/session.php';
require __DIR__.'/videos.php';
require __DIR__.'/homepage-content.php';
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
  <script src="/assets/js/home-video-covers.js" defer></script>
  <script src="/assets/js/home-footer.js" defer></script>
  <script src="/assets/js/homepage.js" defer></script>
</head>
<body id="top">
  <a class="skip-link" href="#main">跳转到正文</a>
  <header class="site-header">
    <div class="page-width header-inner">
      <a class="brand" href="/">
        <img src="/bbs/favicon.png" width="42" height="42" alt="">
        <h1><?php echo homepage_escape($homepageContent['name']); ?></h1>
      </a>
      <nav class="navigation" aria-label="主导航">
        <a class="forum-link" href="/bbs/">进入论坛</a>
        <?php require __DIR__.'/session-links.php'; ?>
      </nav>
    </div>
  </header>

  <main class="homepage-main" id="main">
    <section class="promotion" role="region" aria-label="宣传图" aria-roledescription="轮播图" data-promotion>
      <div class="promotion-frame">
        <div class="promotion-stage" id="promotion-slides">
<?php foreach ($homepageMedia['images'] as $number => $image) { ?>
          <div class="promotion-slide" role="group" aria-roledescription="幻灯片" aria-label="<?php echo ($number + 1).' / '.count($homepageMedia['images']); ?>"<?php if ($number > 0) echo ' hidden'; ?>>
            <a href="<?php echo homepage_escape($image['img']); ?>" target="_blank" rel="noopener noreferrer"><img src="<?php echo homepage_escape($image['img']); ?>" alt="<?php echo homepage_escape($image['title']); ?>" decoding="async" <?php echo $number === 0 ? 'fetchpriority="high"' : 'loading="lazy"'; ?>></a>
          </div>
<?php } ?>
        </div>
        <div class="promotion-empty" data-image-state hidden><p data-image-status role="status"></p></div>
        <div class="promotion-bar">
          <span class="promotion-caption" data-image-caption><?php echo homepage_escape($homepageMedia['images'][0]['title']); ?></span>
          <div class="promotion-actions">
            <button class="text-button" type="button" data-image-retry hidden>重新加载</button>
<?php if ($rights >= 3) { ?>
            <a class="promotion-manage" href="/index/images.php">管理宣传图</a>
<?php } ?>
            <div class="promotion-controls" data-image-controls hidden>
              <button type="button" data-image-step="-1" aria-label="上一张宣传图" aria-controls="promotion-slides">←</button>
              <span class="promotion-count" aria-live="polite" aria-atomic="true"><span data-image-number>01</span><span aria-hidden="true"> / </span><span data-image-total></span></span>
              <button type="button" data-image-step="1" aria-label="下一张宣传图" aria-controls="promotion-slides">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-frame about" id="about" aria-labelledby="about-title">
      <div class="section-heading"><h2 id="about-title">协会介绍</h2></div>
      <nav class="about-tabs" aria-label="协会介绍分类" data-about-tabs>
<?php foreach ($homepageContent['tabs'] as $tab) { ?>
        <a id="tab-<?php echo $tab['id']; ?>" href="#<?php echo $tab['id']; ?>" data-about-tab="<?php echo $tab['id']; ?>"><?php echo $tab['title']; ?></a>
<?php } ?>
      </nav>
<?php foreach ($homepageContent['tabs'] as $tab) { ?>
      <article class="about-panel" id="<?php echo $tab['id']; ?>" aria-labelledby="tab-<?php echo $tab['id']; ?>" data-about-panel>
<?php readfile(__DIR__.'/../content/'.$tab['file']); ?>
      </article>
<?php } ?>
    </section>

    <section class="videos" id="videos" aria-labelledby="videos-title">
      <div class="page-width videos-inner">
        <div class="section-heading">
          <h2 id="videos-title">视频资料</h2>
          <div class="section-actions">
            <a class="text-link" data-video-more href="<?php echo homepage_escape($homepageVideos['moreUrl']); ?>" target="_blank" rel="noopener noreferrer"<?php if ($homepageVideos['moreUrl'] === '') echo ' hidden'; ?>>全部视频</a>
<?php if ($rights >= 3) { ?>
            <a class="text-link" href="/index/videos.php">管理视频</a>
<?php } ?>
          </div>
        </div>
        <div class="video-grid" data-video-list>
<?php foreach ($homepageVideos['videos'] as $video) { ?>
          <a class="video-link" href="<?php echo homepage_escape($video['url']); ?>" target="_blank" rel="noopener noreferrer">
            <span class="video-cover" aria-hidden="true">
              <span class="video-play">▶</span>
            </span>
            <div class="video-caption"><h3><?php echo homepage_escape($video['title']); ?></h3></div>
          </a>
<?php } ?>
        </div>
        <div class="section-status" role="status" data-video-status<?php if (!$homepageVideosError && count($homepageVideos['videos']) > 0) echo ' hidden'; ?>><?php echo $homepageVideosError ? '视频暂时无法加载。' : '暂无视频资料。'; ?></div>
        <button class="text-button" type="button" data-video-retry hidden>重新加载</button>
      </div>
    </section>

    <section class="section-frame contact" id="contact" aria-labelledby="contact-title">
      <div class="section-heading">
        <h2 id="contact-title">联系方式</h2>
<?php if ($rights >= 3) { ?>
        <a class="text-link" href="/index/contacts.php">管理联系方式</a>
<?php } ?>
      </div>
      <div class="contact-text" data-contact-text><?php echo homepage_escape($homepageContacts['text']); ?></div>
      <p class="section-status" role="status" data-contact-status<?php if (!$homepageContactsError) echo ' hidden'; ?>>联系方式暂时无法加载。</p>
      <button class="text-button" type="button" data-contact-retry<?php if (!$homepageContactsError) echo ' hidden'; ?>>重新加载</button>
    </section>
  </main>

  <footer class="site-footer">
    <div class="page-width footer-inner">
      <div class="sponsors" aria-label="赞助标识"><img src="/assets/images/static/homepage/rockbros.png" alt="洛克兄弟" title="洛克兄弟" width="320" loading="lazy" decoding="async"></div>
      <div class="footer-qr-list" aria-label="公众号和客户端二维码">
<?php foreach ($homepageContent['qrCodes'] as $qrCode) { ?>
        <details class="footer-qr" data-footer-qr>
          <summary id="qr-trigger-<?php echo $qrCode['id']; ?>" aria-controls="qr-panel-<?php echo $qrCode['id']; ?>"><?php echo homepage_escape($qrCode['label']); ?></summary>
          <div class="footer-qr-popover" id="qr-panel-<?php echo $qrCode['id']; ?>" role="region" aria-labelledby="qr-trigger-<?php echo $qrCode['id']; ?>">
            <img src="/assets/images/static/homepage/<?php echo homepage_escape($qrCode['image']); ?>" width="200" height="200" alt="<?php echo homepage_escape($qrCode['alt']); ?>" loading="lazy" decoding="async">
          </div>
        </details>
<?php } ?>
      </div>
      <nav class="footer-links" aria-label="页脚导航">
        <a href="https://www.pku.edu.cn/" target="_blank" rel="noopener noreferrer">北京大学</a>
        <a href="https://bbs.pku.edu.cn/" target="_blank" rel="noopener noreferrer">北大未名BBS</a>
        <a href="/privacy/">隐私政策</a>
      </nav>
      <div class="footer-bottom"><span>© 2001–<?php echo date('Y'); ?> <?php echo homepage_escape($homepageContent['name']); ?></span><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"><?php echo homepage_escape($homepageContent['registration']); ?></a></div>
    </div>
  </footer>

  <script type="application/json" id="homepage-media"><?php echo json_encode($homepageMedia, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?></script>
  <dialog class="login-dialog" id="home-login" aria-labelledby="login-title">
    <button class="dialog-close" type="button" data-close-login aria-label="关闭登录">×</button>
    <h2 id="login-title">登录</h2>
    <form id="home-login-form">
      <fieldset id="home-login-fields">
        <label for="home-username">用户名</label><input id="home-username" name="username" autocomplete="username" required maxlength="100">
        <label for="home-password">密码</label><input id="home-password" name="password" type="password" autocomplete="current-password" required>
        <p class="login-error" role="alert" data-login-error hidden></p>
        <button class="login-submit" type="submit">登录</button>
      </fieldset>
      <div class="login-links"><a href="/bbs/register/">注册账号</a><a href="/bbs/login">前往论坛登录</a></div>
    </form>
  </dialog>
</body>
</html>
