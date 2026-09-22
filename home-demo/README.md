# 根目录首页预览

`/` 已使用新版入口；`/home-demo/` 使用同一份页面模板，并带 `noindex` 标记。两处的宣传图、视频和登录态一致，不再保留两套内容。

在仓库根目录执行 `php -c php.ini -S 127.0.0.1:8091 router.php`，访问 <http://127.0.0.1:8091/>。页面无需构建。视觉验收由仓库维护者进行。

新版包含宣传图、视频资料、论坛入口、协会介绍、联系方式和底部信息。布局与交互在 `assets/css/homepage.css`、`assets/js/homepage.js`，PHP 模板在 `index/includes/homepage.php`。接口、维护入口及内容配置见 `index/README.md`。

原 demo 的 `images/` 保留为已有素材，首页不会把它们自动写入宣传图列表。宣传图以现有数据库内容为准；没有记录时显示空状态。

保留素材来自仓库已归档帖子《【甘南之行】雨中划过一弯彩虹》（版面 2，帖子 9096）：`gannan.webp` 对应 `/bbs/images/483532495.jpg`，`road.webp` 对应 `/bbs/images/635541616.jpg`，`riders.webp` 对应 `/bbs/images/36983029.jpg`；`capu.png` 为 `forum/public/favicon.png` 的副本。
