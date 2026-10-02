  <aside class="sponsor-strip" aria-label="赞助标识">
    <img src="/assets/images/static/homepage/rockbros-logo.png" alt="洛克兄弟" title="洛克兄弟" width="200" height="112" loading="lazy" decoding="async">
  </aside>
  <footer class="site-footer">
    <div class="page-width footer-inner">
      <div class="footer-brand">
        <img src="/bbs/favicon.png" width="36" height="36" alt="" loading="lazy">
        <span><?php echo homepage_escape($homepageContent['name']); ?></span>
      </div>
      <ul class="footer-qr-list" aria-label="公众号和客户端二维码">
<?php foreach ($homepageContent['qrCodes'] as $qrCode) { ?>
        <li class="footer-qr">
          <img src="/assets/images/static/homepage/<?php echo homepage_escape($qrCode['image']); ?>" width="96" height="96" alt="<?php echo homepage_escape($qrCode['alt']); ?>" loading="lazy" decoding="async">
          <span><?php echo homepage_escape($qrCode['label']); ?></span>
        </li>
<?php } ?>
      </ul>
      <div class="footer-meta">
        <nav class="footer-links" aria-label="页脚导航">
          <a href="https://www.pku.edu.cn/" target="_blank" rel="noopener noreferrer">北京大学</a>
          <a href="https://bbs.pku.edu.cn/" target="_blank" rel="noopener noreferrer">北大未名BBS</a>
          <a href="/privacy/">隐私政策</a>
        </nav>
        <div class="footer-bottom"><span>© 2001–<?php echo date('Y'); ?> <?php echo homepage_escape($homepageContent['name']); ?></span><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"><?php echo homepage_escape($homepageContent['registration']); ?></a></div>
      </div>
    </div>
  </footer>
