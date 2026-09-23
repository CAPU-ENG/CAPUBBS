<span class="home-session" data-home-session data-username="<?php echo homepage_escape($username); ?>" data-rights="<?php echo $rights; ?>" data-cookie-domain="<?php echo homepage_escape(defined('CAPUBBS_HOST') ? CAPUBBS_HOST : 'chexie.net'); ?>">
<?php if ($username === '') { ?>
  <a href="/bbs/login"<?php if (!empty($homepageLoginModal)) echo ' data-home-login'; ?>>登录</a>
  <a href="/bbs/register/">注册</a>
<?php } else { ?>
  <a class="home-session-name" href="/bbs/home/" title="个人中心"><?php echo homepage_escape($username); ?></a>
  <button type="button" data-home-logout>退出</button>
<?php } ?>
  <span class="home-session-error" role="status" hidden></span>
</span>
