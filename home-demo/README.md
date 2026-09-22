# 根目录首页预览

`/` 已使用新版入口；`/home-demo/` 使用同一份页面模板，并带 `noindex` 标记。两处的宣传图、视频和登录态一致，不再保留两套内容。

在仓库根目录执行 `php -c php.ini -S 127.0.0.1:8094 router.php`，访问 <http://127.0.0.1:8094/>。页面无需构建。视觉验收由仓库维护者进行。

正文依次为宣传图、协会介绍（三页签）、视频资料、联系方式；论坛入口和登录态在顶部，页脚保留赞助标识。布局与交互在 `assets/css/homepage.css`、`assets/js/homepage.js`，PHP 模板在 `index/includes/homepage.php`。素材来源、暂存配置及既有接口见 `index/README.md`。本轮仅完成排版，联系方式编辑和新增视频自动抓取封面的 API 尚未接入。

`images/` 的三张照片用于本轮暂存宣传图：首页初始显示，图片接口有记录时替换，没有记录时继续显示。不会自动写入数据库。暂存映射及两条已获取的 Bilibili 封面记录位于 `index/data/homepage-media.default.json`。

保留素材来自仓库已归档帖子《【甘南之行】雨中划过一弯彩虹》（版面 2，帖子 9096）：`gannan.webp` 对应 `/bbs/images/483532495.jpg`，`road.webp` 对应 `/bbs/images/635541616.jpg`，`riders.webp` 对应 `/bbs/images/36983029.jpg`；`capu.png` 为 `forum/public/favicon.png` 的副本。
