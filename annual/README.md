# 电子年刊

总入口为 `/annual/`（访问 `/annual` 会跳转到带斜杠的地址）。入口自动读取本目录下四位年份文件夹，只展示包含 `index.html` 的年份，按年份倒序排列。没有年刊时显示“暂无年刊”。入口不依赖数据库或论坛登录，不需要构建前端。

每年使用独立目录，例如以下结构对应 `/annual/2026/`：

```text
annual/
├── index.php
├── style.css
└── 2026/
    ├── index.html
    ├── style.css
    ├── script.js
    └── assets/
        ├── cover.webp
        └── …
```

年份及文件仅为结构说明；本次未加入任何年刊正文或示例年刊。新增年刊时，将完成的整套网页放入对应年份目录，保留 HTML、CSS、JS 和资源的相对位置。CSS、JS 文件名可自定，HTML 入口统一为 `index.html`。只有已经放入 `index.html` 的年份才会出现在总入口。

年刊内使用相对路径引用自己的资源：

```html
<link rel="stylesheet" href="./style.css">
<script src="./script.js" defer></script>
<img src="./assets/cover.webp" alt="年刊封面">
```

每份年刊是独立的完整网页，直接访问，不嵌入论坛；CSS、JS 不要求共用。可用 `<a href="../">历年年刊</a>` 返回总入口。需要长期保存的图片、字体等资源也应随年刊放入自己的 `assets/`。引用目录地址时保留末尾 `/`，避免相对资源路径指向上一层。

在仓库根目录启动本地服务：

```bash
php -c php.ini -S localhost:8080 router.php
```

通过 `http://localhost:8080/annual/` 访问。Vite 开发服务也会把 `/annual` 请求转发给 `CAPUBBS_PHP_ORIGIN` 指定的本地 PHP 服务。

## 档案室收录

档案室现有“添加帖子”支持站内路径及 HTTP(S) 地址，可以填写 `/annual/2026/` 或 `https://chexie.net/annual/2026/`。手动填写“帖子名称”，例如“2026 年刊”；自动提取名称只支持论坛帖子，不能识别年刊标题。需要具备档案室管理权限。

档案室保存的是地址及名称，打开条目会直接访问年刊；它不会复制网页及其资源，也不会将该目录变为私有。为保持链接有效，应保留年份目录及文件路径。需要文件备份时，可另外将整份年刊打包后上传到档案室。

## 服务器路径

部署时将 `annual/` 中的页面、样式和各年份目录保留原结构放到站点根目录下，并保留历年内容。入口由 PHP 执行，年刊 HTML/CSS/JS/assets 作为静态文件提供。站点需配置 `index index.php index.html`，按真实文件处理 `/annual/`，不存在的页面和资源返回 404。现有部署文档中的 Nginx 规则已满足这一结构；不要将 `/annual/` 重写到论坛的单页入口。
