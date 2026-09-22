# 主页内容维护

原主页 `/` 和新版方案 `/home-demo/` 共用论坛登录会话。未登录显示登录、注册；已登录显示用户名（进入个人中心）和退出。原主页保留登录弹窗，使用论坛统一登录 API；demo 的登录入口进入论坛登录页。页面返回时、窗口重新聚焦时会重新验证登录状态。用户名与权限由服务端读取，登录后的页面禁止共享缓存。

图片、公告、日历、视频的编辑权限统一为 **rights >= 3**。旧主页接口、统一 API 和两处 `news` 公告处理均执行此限制。日历管理不再因账号名为“组织部”而额外放行；该账号也须具备权限 3。普通访问及内容读取不受影响。

下载中心入口和旧下载资料列表已停用；`/index/download.php`、`/index/download_file.php` 返回 410。旧下载增删改操作始终返回功能已停用，不访问下载表。既有下载数据和文件未删除。原主页和 demo 的 favicon 均直接使用 `/bbs/favicon.png`。

## 视频

维护入口：`/index/videos.php`，也可从主页视频区点击“管理视频”。支持标题、链接、添加、删除、排序和“全部视频”链接。最多 30 项，标题最多 80 个字符，链接仅接受完整 HTTP/HTTPS 地址。不上传视频文件。

视频内容存储不依赖数据库；保存时的登录和权限验证沿用论坛账号。原主页不再查询 `mainpage` 中 `id=2` 的视频记录，旧记录保留。

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

在仓库根目录通过 `php -c php.ini -S 127.0.0.1:8089 router.php` 启动本地环境。视频维护页面和主页无需前端构建；新论坛日历权限入口变更需重新构建 `forum/`。

部署时上传程序和初始列表，**保留服务器已有的 `videos.json`、备份及锁文件**，不要用本地初始列表覆盖运行内容。PHP 运行用户需可读初始列表、可读写运行数据，且可在 `index/data/` 创建和重命名文件。备份和运行文件由 PHP 运行用户持有。

数据目录仅通过 API 公开内容。PHP 本地 router 已阻止直接访问；Apache 使用目录内 `.htaccess`。Nginx 需要对应规则：

```nginx
location ^~ /index/data/ { return 404; }
```

本次实现与验证在本地完成，不包含服务器部署或数据库结构变更。
