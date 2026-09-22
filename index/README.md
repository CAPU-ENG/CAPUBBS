# 主页内容维护

根目录 `/` 与 `/home-demo/` 共用模板。当前按确认的框线图排版：**宣传图 → 协会介绍 → 视频资料 → 联系方式**，论坛入口与登录态放在顶部，赞助标识与底部信息放在页脚。旧的 `/index/main.php` 仍可直接访问，不再通过 iframe 嵌入首页。

本轮仅完成页面与暂存素材，未修改 API。联系方式在线编辑、Bilibili 新链接的自动封面获取及缓存接口留待后续确认接入。

两处共用论坛登录会话。未登录显示登录、注册；已登录显示用户名（进入个人中心）和退出。首页登录弹窗调用现有统一 API；不支持弹窗的浏览器前往论坛登录页。页面返回时、窗口重新聚焦时会重新验证登录状态。用户名与权限由服务端读取，页面禁止共享缓存。

图片、公告、日历、视频的编辑权限统一为 **rights >= 3**。旧主页接口、统一 API 和两处 `news` 公告处理均执行此限制。日历管理不再因账号名为“组织部”而额外放行；该账号也须具备权限 3。普通访问及内容读取不受影响。

下载中心入口和旧下载资料列表已停用；`/index/download.php`、`/index/download_file.php` 返回 410。旧下载增删改操作始终返回功能已停用，不访问下载表。既有下载数据和文件未删除。原主页和 demo 的 favicon 均直接使用 `/bbs/favicon.png`。

## 宣传图

`ask=homepage_images` 通过 `/api/api.php` 公开读取 `mainpage` 表 `id=0` 的记录，按 `number` 排序，返回 `data.images` 数组；每项为 `{img, imgthumb, title}`。0 项、1 项或多项时返回结构一致。只读接口不改变数据、顺序或权限，不增加数据库结构。

首页调用既有接口加载图片，缩略图优先、失败时尝试原图。图片完整展示，不裁切海报；支持按钮与方向键切换，不自动播放。标题按纯文本输出，链接只允许 HTTP/HTTPS 或站内路径。首页重新取得焦点时刷新宣传图和视频；视频初始内容同时由 PHP 渲染。

排版阶段的暂存图片与链接位于 `index/data/homepage-media.default.json`：首次 HTML 渲染和接口返回空列表时展示 `home-demo/images/` 的三张既有照片；接口有记录时替换为真实宣传图。接口异常保留已显示内容，并提供重试。暂存图片不会写入数据库。正式接入前应移除这项临时回退，否则清空管理列表后仍会显示暂存图片。

维护入口：`/index/images.php`，仅权限 >= 3 可进入，从首页宣传图区可到达。支持原图、可选缩略图、标题和排序；保存沿用已收权的 `ask=saveimg`。这是旧接口的整表列表保存模式；不具备视频接口的原子版本冲突保护，应避免多人同时编辑。该页不提供文件上传，需填写已有图片地址。

## 协会介绍、联系方式与页脚

`index/homepage-content.php` 配置名称、页签和备案号；`index/content/about.html`、`summer.html`、`activities.html` 分别存放协会简介、暑期介绍、日常活动的完整静态正文。正文按要求复制自 `https://www.chexie.net/index/about.php`，保留原文的历史年份和介绍内容，只调整 HTML 结构。页签支持鼠标、方向键、Home/End 和 `#summer`、`#activities` 直达；无 JavaScript 时三篇正文依次显示。

`index/data/contacts.default.json` 的 `text` 保存原“关于协会 → 联系我们”的完整联系方式，包含负责人、电话、28号楼B107室地址与线下活动信息；模板以纯文本转义输出并保留换行。当前仅展示，没有在线编辑入口或保存接口。后续在线编辑仍须权限 >= 3。

页脚保留洛克兄弟赞助标识、北京大学、北大未名BBS、原车协主页、隐私政策、版权和备案号。赞助图片暂存为 `assets/images/static/homepage/rockbros.png`，来源是原页脚的 `/bbs/images/a56e5ca6707358f21ba8f1bb1cc583858068c921.png`。原车协主页链接指向既有 `/old/index/`，其内容不属于本次修改。Favicon 与导航图标复用 `/bbs/favicon.png`。

## 视频

维护入口：`/index/videos.php`，也可从主页视频区点击“管理视频”。支持标题、链接、添加、删除、排序和“全部视频”链接。最多 30 项，标题最多 80 个字符，链接仅接受完整 HTTP/HTTPS 地址。不上传视频文件。

视频内容存储不依赖数据库；保存时的登录和权限验证沿用论坛账号。原主页不再查询 `mainpage` 中 `id=2` 的视频记录，旧记录保留。

视频使用等宽封面卡片，手机窄屏使用左侧封面、右侧标题的列表。2020、2021 两条视频的封面已通过 Bilibili 官方 `x/web-interface/view?bvid=...` 返回的 `pic` 获取，暂存在 `assets/images/static/homepage/`；来源 URL 与获取日期记录在 `homepage-media.default.json`。页面按 Bilibili 域名和 BV 号匹配已有封面（支持链接中的查询参数），不把任意视频配上无关照片。优酷视频、2022 合集、尚未获取封面的新链接以及封面加载失败时均显示播放占位，仍可打开视频链接。当前没有运行时抓取或定时刷新封面的能力。

- `index/data/videos.default.json`：随代码提供的初始列表，沿用原首页的视频链接。
- `index/data/videos.json`：首次有效修改后生成的运行数据，不纳入 Git。
- `index/data/videos.json.backup`：上一次成功修改前的完整内容，不纳入 Git。
- `index/data/videos.json.lock`：写入锁文件，不纳入 Git，不应在运行中删除。

读取尚未初始化的站点时使用初始列表，不创建文件。保存使用版本号检查、文件锁和同目录原子替换；并发更新会拒绝旧版本覆盖。内容无变化时不增加版本或轮换备份。运行数据损坏时返回错误，不自动覆盖或回退到初始列表。

接口均在 `/api/api.php`：

- `ask=homepage_videos`：公开读取 `{schemaVersion, revision, videos, moreUrl}`；视频数组每项为 `{title, url}`，数组顺序即显示顺序。
- `ask=save_homepage_videos`：仅 POST；携带当前 `revision` 和 `document`（包含 `videos`、`moreUrl` 的 JSON 字符串），以及 `X-Requested-With: XMLHttpRequest` 请求头。使用登录 Cookie，要求同源且权限 >= 3。

响应沿用 `{code, message, data}` 格式。成功返回保存后的文档；权限不足返回 403；版本冲突返回 409，维护页面保留未保存内容，管理员可重新加载后编辑。

## 本地与部署文件要求

在仓库根目录通过 `php -c php.ini -S 127.0.0.1:8094 router.php` 启动本地环境。首页、宣传图管理和视频管理均无需前端构建。论坛资源沿用已有构建，视觉验收由维护者完成。

部署时上传程序和初始列表，**保留服务器已有的 `videos.json`、备份及锁文件**，不要用本地初始列表覆盖运行内容。PHP 运行用户需可读初始列表、可读写运行数据，且可在 `index/data/` 创建和重命名文件。备份和运行文件由 PHP 运行用户持有。

数据目录仅通过 API 公开内容。PHP 本地 router 已阻止直接访问；Apache 使用目录内 `.htaccess`。Nginx 需要对应规则：

```nginx
location ^~ /index/data/ { return 404; }
```

本次实现与验证在本地完成，不包含服务器部署或数据库结构变更。
