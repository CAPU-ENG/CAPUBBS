# 根目录首页预览

`/` 已使用新版入口；`/home-demo/` 使用同一份页面模板，并带 `noindex` 标记。两处的宣传图、视频和登录态一致，不再保留两套内容。

在仓库根目录执行 `php -c php.ini -S 127.0.0.1:8094 router.php`，访问 <http://127.0.0.1:8094/>。页面无需构建。视觉验收由仓库维护者进行。

正文依次为加宽铺满的宣传图、协会介绍（三页签）、全宽深绿色视频资料、联系方式；论坛入口和登录态在顶部，页脚保留赞助标识。卡片与控件风格参考新论坛。布局与交互在 `assets/css/homepage.css`、`assets/js/homepage.js`，PHP 模板在 `index/includes/homepage.php`。素材来源、暂存配置及既有接口见 `index/README.md`。联系方式编辑接口尚未接入。

三篇介绍保留完整原文并优化正文、标题和列表层级。页脚恢复原站 `#bbbbbb` 背景及 320px 洛克兄弟标识，移除“原车协主页”。原站的公众号、Android、iOS 三个二维码放在底栏，通过悬停、点击或键盘展开，交互代码为 `assets/js/home-footer.js`。

`images/` 的三张照片用于暂存宣传图：首页初始显示，图片接口有记录时替换，没有记录时继续显示。不会自动写入数据库。暂存映射位于 `index/data/homepage-media.default.json`。

Bilibili 单视频封面由 `assets/js/home-video-covers.js` 在前端通过 JSONP 获取，直接展示 B 站 CDN 图片；不在服务器保存封面。请求失败和暂不支持的链接保留播放占位。

保留素材来自仓库已归档帖子《【甘南之行】雨中划过一弯彩虹》（版面 2，帖子 9096）：`gannan.webp` 对应 `/bbs/images/483532495.jpg`，`road.webp` 对应 `/bbs/images/635541616.jpg`，`riders.webp` 对应 `/bbs/images/36983029.jpg`；`capu.png` 为 `forum/public/favicon.png` 的副本。
