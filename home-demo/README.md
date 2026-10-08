# 根目录首页预览

`/` 已使用新版入口；`/home-demo/` 使用同一份页面模板，并带 `noindex` 标记。两处的宣传图、视频和登录态一致，不再保留两套内容。

在仓库根目录执行 `php -c php.ini -S 127.0.0.1:8094 router.php`，访问 <http://127.0.0.1:8094/>。页面无需构建。视觉验收由仓库维护者进行。

正文依次为全宽宣传图首屏（口号与论坛、加入按钮）、协会介绍（三张摘要卡片，全文见 `/index/intro.php`）、年刊、视频资料、联系方式（表格与补充说明）；页脚上方为赞助条。卡片与控件风格参考新论坛。布局与交互在 `assets/css/homepage.css`、`assets/js/homepage.js`，PHP 模板在 `index/includes/homepage.php`。素材来源、暂存配置及既有接口见 `index/README.md`。

三篇介绍保留完整原文，在完整介绍页优化正文、标题和列表层级。洛克兄弟标识去除灰底后置于白色赞助条；页脚改为深绿底，直接展示原站的公众号、Android、iOS 三个二维码。

Bilibili 单视频封面由 `assets/js/home-video-covers.js` 在前端通过 JSONP 获取，直接展示 B 站 CDN 图片；不在服务器保存封面。请求失败和暂不支持的链接保留播放占位。

`images/capu.png` 为 `forum/public/favicon.png` 的副本。
