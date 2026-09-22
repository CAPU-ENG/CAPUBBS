# 主页内容维护

根目录 `/` 与 `/home-demo/` 共用模板。当前按确认的框线图排版：**宣传图 → 协会介绍 → 视频资料 → 联系方式**，论坛入口与登录态放在顶部，赞助标识与底部信息放在页脚。旧的 `/index/main.php` 仍可直接访问，不再通过 iframe 嵌入首页。

宣传图使用比正文更宽的容器，顶栏至宣传图区域连续使用与视频区相同的深绿色背景，搭配浅色文字和论坛按钮；卡片、控件圆角和基础配色参考 `forum/src/styles/base.css`。联系方式卡片按内容自适应宽度并居中，最大不超过正文区域，窄屏自动换行；使用四边齿孔与内框呈现邮票边缘。Bilibili 封面通过前端 JSONP 自动获取，不经过本站 API。

首页背景参考 `annual/style.css`、`annual/background.js`，使用 5px 间隔的静态点阵与鼠标附近的柔和高亮。浅色正文区使用灰绿色点阵；深绿顶栏、宣传图区和视频区使用浅绿色点阵与更明亮的高亮，宣传图留白及控件栏也沿用该背景。已移除联系方式两侧的点列与图标。`assets/js/home-background.js` 每帧合并指针更新，按各区域坐标定位高亮；不透明内容卡片遮住装饰层，背景不拦截点击。触屏、减少动态效果和强制配色时不显示动态高亮；滚动、离开窗口和页面隐藏时收起高亮。底栏恢复纯 `#bbbbbb` 背景，不含点阵或背景高亮，保留原赞助图片。

两处共用论坛登录会话。未登录显示登录、注册；已登录显示用户名（进入个人中心）和退出。首页登录弹窗调用现有统一 API；不支持弹窗的浏览器前往论坛登录页。页面返回时、窗口重新聚焦时会重新验证登录状态。用户名与权限由服务端读取，页面禁止共享缓存。

图片、公告、日历、视频、联系方式的编辑权限统一为 **rights >= 3**。旧主页接口、统一 API 和两处 `news` 公告处理均执行此限制。日历管理不再因账号名为“组织部”而额外放行；该账号也须具备权限 3。普通访问及内容读取不受影响。

下载中心入口和旧下载资料列表已停用；`/index/download.php`、`/index/download_file.php` 返回 410。旧下载增删改操作始终返回功能已停用，不访问下载表。既有下载数据和文件未删除。原主页和 demo 的 favicon 均直接使用 `/bbs/favicon.png`。

## 宣传图

`ask=homepage_images` 通过 `/api/api.php` 公开读取 `mainpage` 表 `id=0` 的记录，按 `number` 排序，返回 `data.images` 数组；每项为 `{img, imgthumb, title}`。0 项、1 项或多项时返回结构一致。只读接口不改变数据、顺序或权限，不增加数据库结构。

首页调用既有接口加载图片，优先展示原图，失败时尝试缩略图。宣传图容器最大宽度 1536px，桌面展示高度固定为 480px，窄屏（<=760px）固定为 280px；图片按比例居中缩放、完整显示，不裁切，点击可查看原图。多图时每 5 秒自动切换，提供暂停/继续按钮，支持前后按钮与方向键；鼠标悬停、焦点位于轮播区域或页面隐藏时暂停，恢复后重新计时，手动切换也重新计时。单图时隐藏控件并停止计时。标题按纯文本输出，链接只允许 HTTP/HTTPS 或站内路径。首页重新取得焦点时刷新宣传图和视频；视频初始内容同时由 PHP 渲染。

排版阶段的暂存图片与链接位于 `index/data/homepage-media.default.json`：首次 HTML 渲染和接口返回空列表时展示 `home-demo/images/` 的三张既有照片；接口有记录时替换为真实宣传图。接口异常保留已显示内容，并提供重试。暂存图片不会写入数据库。正式接入前应移除这项临时回退，否则清空管理列表后仍会显示暂存图片。

维护入口：`/index/images.php`，仅权限 >= 3 可进入，从首页宣传图区可到达。支持原图、可选缩略图、标题和排序；保存沿用已收权的 `ask=saveimg`。这是旧接口的整表列表保存模式；不具备视频接口的原子版本冲突保护，应避免多人同时编辑。该页不提供文件上传，需填写已有图片地址。

## 协会介绍、联系方式与页脚

`index/homepage-content.php` 配置名称、页签、底栏二维码和备案号；`index/content/about.html`、`summer.html`、`activities.html` 分别存放协会简介、暑期介绍、日常活动的完整静态正文。正文按要求复制自 `https://www.chexie.net/index/about.php`，保留原文的历史年份和介绍内容。正文行宽、首段、小标题、段落缩进和列表分层排版，暑期成果整理为列表，活动按既有四个主题分组；没有改写或删减原文。页签支持鼠标、方向键、Home/End 和 `#summer`、`#activities` 直达；无 JavaScript 时三篇正文依次显示。

`index/data/contacts.default.json` 保存原“关于协会 → 联系我们”的完整初始联系方式；文档为 `{schemaVersion: 1, revision, text}`，模板以纯文本转义输出并保留换行。首页返回或重新聚焦时刷新内容，读取失败保留当前文字并提供重试。

权限 >= 3 时，联系方式标题旁显示“管理联系方式”，进入 `/index/contacts.php`；管理页及保存接口均校验权限。文本长度为 1–5000 个字符，支持换行，不执行 HTML。保存失败或版本冲突保留编辑内容；离开页面或重新加载前会提醒尚未保存的修改。

接口位于 `/api/api.php`：`ask=homepage_contacts` 公开返回完整文档，读取不连接数据库；`ask=save_homepage_contacts` 仅接受同源 POST，请求头须有 `X-Requested-With: XMLHttpRequest`，表单字段为 `revision` 与 `text`，使用论坛登录 Cookie 验证权限。成功返回新文档，权限不足为 403，旧版本冲突为 409。

首次有效修改创建 `index/data/contacts.json`，原内容备份至 `contacts.json.backup`，锁文件为 `contacts.json.lock`，均不纳入 Git。通过文件锁、版本检查和同目录原子替换防止覆盖，内容不变不增加版本或轮换备份。已有运行文件损坏时返回错误，不自动恢复初始联系方式或覆盖文件。

页脚保留洛克兄弟赞助标识、北京大学、北大未名BBS、隐私政策、版权和备案号，已移除“原车协主页”入口。页脚按照原站 `/assets/css/style.css` 使用 `#bbbbbb` 背景、`#777` 文字和上下 30px 留白；按新要求移除页脚顶边框及版权区白色分隔线。赞助图片 `assets/images/static/homepage/rockbros.png` 与原站 `/bbs/images/a56e5ca6707358f21ba8f1bb1cc583858068c921.png` 字节一致，宽度恢复为原站 320px，高度按原图比例自适应，不加底板或滤镜。Favicon 与导航图标复用 `/bbs/favicon.png`。

相关链接与版权、备案行归为一组，行间距为 6px。底栏新增微信公众号、Android 客户端、iOS 客户端三个二维码入口，复用原首页 `index/main.php` 引用的图片，存放在 `assets/images/static/homepage/`：

- `qrcode-wechat.jpg`：来自 `/assets/images/qrcode_wechat.jpg`，原二维码指向 `http://weixin.qq.com/r/NUOIkFPEzw6wrRfz9xYn`。
- `qrcode-android.png`：来自 `/assets/images/qrcode_android.png`，原二维码指向 `http://pan.baidu.com/s/1dE8rStz`。
- `qrcode-ios.png`：来自 `/assets/images/qrcode_ios.gif`，其实际文件格式为 PNG，仅纠正扩展名，图片内容未改动；原二维码指向 `http://itunes.apple.com/cn/app/capubbs/id826386033`。

这些是原站已有二维码，未更换为新的客户端安装渠道。`assets/js/home-footer.js` 支持鼠标悬停、点击固定或收起、键盘焦点展开、Esc/点击外部/焦点离开关闭；同一时间只展开一个。移动端点击展开，弹层居中避免横向溢出。无 JavaScript 时由原生 `details/summary` 提供点击展开功能。

## 视频

维护入口：`/index/videos.php`，也可从主页视频区点击“管理视频”。支持标题、链接、添加、删除、排序和“全部视频”链接。最多 30 项，标题最多 80 个字符，链接仅接受完整 HTTP/HTTPS 地址。不上传视频文件。

视频内容存储不依赖数据库；保存时的登录和权限验证沿用论坛账号。原主页不再查询 `mainpage` 中 `id=2` 的视频记录，旧记录保留。

视频使用等宽封面卡片，手机窄屏使用左侧封面、右侧标题的列表。前端 `assets/js/home-video-covers.js` 从 Bilibili 视频链接提取 BV/av 号，通过固定的 `https://api.bilibili.com/x/web-interface/view` JSONP 接口（`jsonp=jsonp`、独立 `callback`）读取 `data.pic`。随后由浏览器直接加载 HTTPS 的 B 站 `hdslb.com` 图片，使用 `referrerpolicy="no-referrer"`；不在服务器下载图片或写入封面元数据，已移除此前两张暂存封面。

支持 `www.bilibili.com`、`m.bilibili.com` 和 `bilibili.com` 的 `/video/BV...`、`/video/av...` 链接，允许查询参数和末尾斜线。仅接受匹配当前视频 ID 的响应，图片域名仅限 `hdslb.com` 及其子域，不把管理员填写的任意链接作为脚本地址。

每次页面会话最多并发 3 个封面请求，同一视频合并请求，成功结果在页面内存中缓存 15 分钟，失败结果冷却 60 秒后可在后续刷新时重试。请求 8 秒超时后保留播放占位，移除脚本并短暂保留空回调处理迟到响应。已显示的封面不定时轮询。视频列表更新后自动补充新卡片的封面，迟到响应不修改已移除的卡片。

优酷、`b23.tv` 短链接、2022 合集等非标准单视频链接，以及接口或图片加载失败时均显示播放占位，链接仍可打开。JavaScript 未启用时也保留视频标题和链接。JSONP 的远端可用性受 B 站接口策略及浏览器限制影响，页面不依赖封面请求成功才能使用。

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

在仓库根目录通过 `php -c php.ini -S 127.0.0.1:8094 router.php` 启动本地环境。首页、宣传图管理、视频管理及联系方式管理均无需前端构建。论坛资源沿用已有构建，视觉验收由维护者完成。

部署时上传程序和初始内容，**保留服务器已有的 `videos.json`、`contacts.json` 及各自的备份、锁文件**，不要用本地初始内容覆盖运行内容。PHP 运行用户需可读初始内容、可读写运行数据，且可在 `index/data/` 创建和重命名文件。备份和运行文件由 PHP 运行用户持有。

数据目录仅通过 API 公开内容。PHP 本地 router 已阻止直接访问；Apache 使用目录内 `.htaccess`。Nginx 需要对应规则：

```nginx
location ^~ /index/data/ { return 404; }
```

本次实现与验证在本地完成，不包含服务器部署或数据库结构变更。
