<?php
require __DIR__.'/session.php';
require __DIR__.'/videos.php';
require __DIR__.'/homepage-content.php';
$homepageLoginModal = true;
$homepageAnnual = $homepageContent['annual'];
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
  <script src="/assets/js/home-contacts-format.js" defer></script>
  <script src="/assets/js/home-background.js" defer></script>
  <script src="/assets/js/homepage.js" defer></script>
</head>
<body id="top">
<?php require __DIR__.'/site-header.php'; ?>

  <main class="homepage-main" id="main">
    <section class="hero" role="region" aria-label="宣传图" aria-roledescription="轮播图" data-promotion>
      <div class="hero-slides" id="promotion-slides">
<?php foreach ($homepageMedia['images'] as $number => $image) { ?>
        <div class="promotion-slide" role="group" aria-roledescription="幻灯片" aria-label="<?php echo ($number + 1).' / '.count($homepageMedia['images']); ?>"<?php if ($number > 0) echo ' hidden'; ?>>
          <img src="<?php echo homepage_escape($image['img']); ?>" alt="<?php echo homepage_escape($image['title']); ?>" decoding="async" <?php echo $number === 0 ? 'fetchpriority="high"' : 'loading="lazy"'; ?>>
        </div>
<?php } ?>
      </div>
      <div class="promotion-empty" data-image-state hidden><p data-image-status role="status"></p></div>
      <div class="page-width hero-content">
        <h1 class="hero-title"><span><?php echo homepage_escape($homepageContent['slogan'][0]); ?>；</span><span><?php echo homepage_escape($homepageContent['slogan'][1]); ?></span></h1>
        <div class="hero-actions">
          <a class="button button-primary" href="/bbs/">进入论坛</a>
          <a class="button button-ghost" href="#contact">加入我们</a>
        </div>
      </div>
      <div class="page-width hero-bar">
        <a class="promotion-caption" data-image-caption href="<?php echo homepage_escape($homepageMedia['images'][0]['img']); ?>" target="_blank" rel="noopener noreferrer"><?php echo homepage_escape($homepageMedia['images'][0]['title']); ?></a>
        <div class="promotion-actions">
          <button class="text-button" type="button" data-image-retry hidden>重新加载</button>
<?php if ($rights >= 3) { ?>
          <a class="promotion-manage" href="/index/images.php">管理宣传图</a>
<?php } ?>
          <div class="promotion-controls" data-image-controls hidden>
            <button type="button" data-image-autoplay aria-label="暂停自动轮播" title="暂停自动轮播" aria-controls="promotion-slides"><span aria-hidden="true">Ⅱ</span></button>
            <button type="button" data-image-step="-1" aria-label="上一张宣传图" aria-controls="promotion-slides">←</button>
            <span class="promotion-count" aria-live="off" aria-atomic="true"><span data-image-number>01</span><span aria-hidden="true"> / </span><span data-image-total></span></span>
            <button type="button" data-image-step="1" aria-label="下一张宣传图" aria-controls="promotion-slides">→</button>
          </div>
        </div>
      </div>
    </section>

    <section class="section about" id="about" aria-labelledby="about-title">
      <div class="page-width">
        <div class="section-heading"><h2 id="about-title">协会介绍</h2></div>
        <div class="about-grid">
<?php foreach ($homepageContent['tabs'] as $number => $tab) { ?>
          <article class="about-card" id="<?php echo $tab['id']; ?>" aria-labelledby="about-<?php echo $tab['id']; ?>">
            <span class="about-index" aria-hidden="true"><?php echo sprintf('%02d', $number + 1); ?></span>
            <h3 id="about-<?php echo $tab['id']; ?>"><?php echo $tab['title']; ?></h3>
            <p><?php echo homepage_article_lead($tab['file']); ?></p>
            <a class="text-link" href="/index/intro.php#<?php echo $tab['id']; ?>">阅读全文 <span aria-hidden="true">→</span></a>
          </article>
<?php } ?>
        </div>
      </div>
    </section>

    <section class="section annual home-dotted-background home-dotted-dark" id="annual" aria-labelledby="annual-title">
      <div class="page-width annual-inner">
        <a class="annual-cover" href="<?php echo homepage_escape($homepageAnnual['url']); ?>" tabindex="-1" aria-hidden="true">
          <img src="<?php echo homepage_escape($homepageAnnual['cover']); ?>" width="249" height="338" alt="" loading="lazy" decoding="async">
        </a>
        <div class="annual-text">
          <h2 id="annual-title">年刊</h2>
          <h3>《<?php echo homepage_escape($homepageAnnual['title']); ?>》<?php echo homepage_escape($homepageAnnual['year']); ?></h3>
          <div class="annual-actions">
            <a class="button button-primary" href="<?php echo homepage_escape($homepageAnnual['url']); ?>">阅读</a>
            <a class="button button-ghost" href="/annual/">全部年刊</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section videos" id="videos" aria-labelledby="videos-title">
      <div class="page-width">
        <div class="section-heading">
          <h2 id="videos-title">视频资料</h2>
          <div class="section-actions">
            <a class="text-link" data-video-more href="<?php echo homepage_escape($homepageVideos['moreUrl']); ?>" target="_blank" rel="noopener noreferrer"<?php if ($homepageVideos['moreUrl'] === '') echo ' hidden'; ?>>全部视频 <span aria-hidden="true">→</span></a>
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

    <section class="section contact" id="contact" aria-labelledby="contact-title">
      <div class="page-width">
        <div class="section-heading">
          <h2 id="contact-title">联系方式</h2>
<?php if ($rights >= 3) { ?>
          <a class="text-link" href="/index/contacts.php">管理联系方式</a>
<?php } ?>
        </div>
        <div class="contact-card">
          <dl class="contact-table" data-contact-table<?php if (count($homepageContactView['rows']) === 0) echo ' hidden'; ?>>
<?php foreach ($homepageContactView['rows'] as $row) { ?>
            <div><dt><?php echo homepage_escape($row['label']); ?></dt><dd><?php echo homepage_escape($row['value']); ?></dd></div>
<?php } ?>
          </dl>
          <div class="contact-notes" data-contact-notes<?php if ($homepageContactView['notes'] === '') echo ' hidden'; ?>><?php echo homepage_escape($homepageContactView['notes']); ?></div>
          <p class="section-status" role="status" data-contact-status<?php if (!$homepageContactsError) echo ' hidden'; ?>>联系方式暂时无法加载。</p>
          <button class="text-button" type="button" data-contact-retry<?php if (!$homepageContactsError) echo ' hidden'; ?>>重新加载</button>
        </div>
      </div>
    </section>
  </main>

<?php require __DIR__.'/site-footer.php'; ?>

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
