CAPUBBS
=======

APIs and web for CAPUBBS.

## 押后谱系

新论坛工具箱入口为 `/bbs/toolbox?tab=yahou-lineage`。所有人可查看、搜索和聚焦师门；权限值不低于 3 的登录会员可选中节点添加徒弟或更新状态，选中“实践部”可添加直属 ID。页面和接口都不提供删除关系或更换师傅的操作。

右上角“谱系总览”将当前完整谱系绘成从左向右展开的普通树状 SVG，保留所有 ID 和状态。同一代按列对齐，使用相同大小的矩形节点和字号；长 ID 分行显示，师徒之间使用直角连线。布局按师门顺序压缩空白，确保节点与文字不重叠。支持拖动、滚轮或按钮缩放、适应窗口及下载完整 SVG；键盘方向键平移、加减键缩放、Home 复位。总览直接使用当前 JSON 数据，不另存图形数据。

唯一主数据是 `forum/data/yahou-lineage.json`，以 `parentId: null` 表示直属“实践部”，其余节点的 `parentId` 为师傅 ID。状态为 `pending`（学徒：未过押后）、`passed`（押后：已过押后）、`qualified`（师父：已过押后且具备收徒资格）。已有后代的 ID 必须保持 `qualified`。初始 734 个 ID 及关系来自[师徒制谱系首楼](https://chexie.net/bbs/content/?bid=5&p=1&tid=1533#1)：无状态标记的 ID 视为已过押后，所有已有后代的 ID 及原帖明确标记的师傅视为具备收徒资格。

首次部署时上传主 JSON，并允许 PHP 运行用户读写 `forum/data/`。后续部署须保留服务器上已维护的主文件。每次成功修改将操作前的原文件写入唯一的 `yahou-lineage.backup.json`；无变化或失败请求不滚动备份。运行时使用 `yahou-lineage.lock` 串行化修改，并以同目录临时文件及原子替换避免写出半份 JSON；客户端版本过期时拒绝覆盖，需刷新重试。备份、锁和临时文件均不纳入 Git。

人工修正关系应在服务器上进行，并与 Web 写入共用 `yahou-lineage.lock` 的排他锁。修改后递增 `revision`，保证 ID 唯一、师傅存在、关系无环、已有后代者具备收徒资格。主文件缺失或损坏时接口报错，不会自动用初始数据覆盖。直接恢复备份时也应递增版本。

数据通过 `/api/api.php` 读取，不应直接公开数据目录。Apache 使用该目录内的 `.htaccess`；Nginx 在站点配置中加入 `location ^~ /forum/data/ { return 404; }`。这不影响新论坛 `/bbs/` 入口。

在本地 PHP 测试环境已启动的前提下，运行 `npm --prefix forum run verify:yahou-lineage` 验证树结构、资格约束、祖先定位和搜索。
运行 `npm --prefix forum run verify:yahou-overview` 验证全量总览节点和关系、同代尺寸与字号、标签完整性和节点间距、布局边界、源数据不被改写、同数量关系修正后的刷新及缩放计算。

## 网站流量每日快照

网站流量页面读取 `api/cache/website-traffic/current.json` 指向的周、月、年静态 JSON 文件。统计分别包含截至昨日的 7、30、365 个上海时区自然日。页面访问和兼容 API 均不会触发实时汇总；结算失败时继续提供上一次成功发布的数据。

部署时需单独上传本地 `tool/refresh-website-traffic.php`（依仓库规范不纳入 Git），并先上传 `api/lib/WebsiteTrafficSnapshot.php`。使用未来执行定时任务的用户，在项目根目录初始化历史数据：

```bash
php tool/refresh-website-traffic.php --initialize
```

初始化成功后再部署其余 API 与前端改动。缓存目录须允许任务用户写入、Web 服务读取。此过程不修改数据库表或索引；首次初始化查询最近 365 个已结束日期，正常每日任务只查询昨天，漏跑后一次补齐缺失日期。原始明细没有日期索引时，后台结算仍可能扫描较多记录，但不会由访客请求触发。

在服务器 **cron 使用 Asia/Shanghai 时区** 的前提下，配置每日 0:00 执行（替换项目、PHP 和日志绝对路径）：

```cron
0 0 * * * cd /path/to/CAPUBBS && /usr/bin/php tool/refresh-website-traffic.php >> /path/to/website-traffic.log 2>&1
```

若服务器 cron 使用 UTC，改用 `0 16 * * *`，对应上海时区次日 0:00。脚本始终按上海日期结算；同日重复运行直接跳过，文件锁避免任务重叠。`--initialize` 也可用于手动重建历史快照，重建期间现有结果仍可读取。

Apache 可使用缓存目录内的 `.htaccess`。Nginx 可在现有站点配置中加入以下静态文件规则（缓存目录不应转交 PHP）：

```nginx
location = /api/cache/website-traffic/current.json {
    add_header Cache-Control "no-cache, must-revalidate";
    try_files $uri =404;
}
location ~ "^/api/cache/website-traffic/snapshots/[0-9]{14}-[a-f0-9]{10}/(week|month|year)\\.json$" {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
}
location /api/cache/website-traffic/ {
    return 404;
}
```

刷新按钮只重新读取发布版本。缺少初始快照时不会回退到数据库现场计算，也没有公开的 HTTP 结算入口。

## 本地开发

在仓库根目录启动 PHP 服务。必须加载仓库内的 `php.ini`，否则档案室上传仍会使用 PHP 默认的 2M/8M 限制：

```bash
php -c php.ini -S localhost:8080 router.php
```

另开终端启动新论坛前端：

```bash
cd forum
npm install
npm run dev
```

Vite 默认通过 `http://localhost:8080` 访问 PHP 接口；如 PHP 服务使用其他地址，设置 `CAPUBBS_PHP_ORIGIN`。开发服务也会读取 `capubbs_forum_mode` Cookie：`legacy` 请求转发给旧 PHP 论坛，其余请求加载新论坛。没有模式 Cookie 但保留登录 `token` 的老用户会首次初始化为 `legacy`；没有这两个 Cookie 的新用户默认进入新论坛。

通过本地 PHP 服务验证统一入口 `/bbs/` 前，先执行 `npm run build`。`router.php` 会让所有 `/bbs/...` 页面按 `capubbs_forum_mode` Cookie 分流，并从 `/bbs/new-assets/` 提供本地构建资源。

## 服务器部署

服务器上的 PHP-FPM、Apache 或其他 PHP 运行时必须配置以下值，并在修改后重启对应服务：

```ini
upload_max_filesize = 500M
post_max_size = 520M
```

`post_max_size` 需要大于 `upload_max_filesize`，以容纳 multipart 请求的额外内容。生产环境应把这两项写入服务器实际加载的 `php.ini` 或 PHP-FPM 配置；仓库根目录的 `php.ini` 主要用于本地启动。

构建前端静态文件：

```bash
cd forum
npm ci
npm run build
```

将 `forum/dist` 的内容部署到服务器的内部新论坛静态目录。对外页面和资源统一使用 `/bbs/` 与 `/bbs/new-assets/`，不再公开 `/forum` 链接。`/api`、旧站 `/assets`、旧论坛文件和 `/bbsimg` 继续由 PHP 站点处理。部署 PHP 配置或前端文件后，重启 PHP-FPM/Web 服务器并清理可能存在的旧缓存。

`/bbs/` 是新旧论坛的统一路由根。没有模式 Cookie 时，保留登录 `token` 的老用户初始化为旧论坛，其余新用户默认加载新论坛；切换模式时写入浏览器 Cookie。此后首页、版面、帖子、搜索、用户中心等 `/bbs/...` 请求都按 Cookie 加载对应实现，不跳转目录，也不附加模式参数。新论坛生成的链接只使用 `/bbs`。

生产环境需要在 Nginx 的 `http` 作用域根据 Cookie 生成模式变量，并在站点中配置 `/bbs` 分流。完整规则见 `SERVER_DEPLOYMENT.md`；核心逻辑如下：

```nginx
map "$cookie_capubbs_forum_mode|$cookie_token" $capubbs_forum_mode {
    ~^legacy\| legacy;
    ~^new\| new;
    ~^\|.+ legacy;
    default new;
}

map "$cookie_capubbs_forum_mode|$cookie_token|$uri" $capubbs_forum_mode_cookie {
    ~^\|[^|]+\|/bbs(?:/|$) "capubbs_forum_mode=legacy; Path=/; Max-Age=31536000; SameSite=Lax; Secure";
    default "";
}

add_header Set-Cookie $capubbs_forum_mode_cookie always;

location = /bbs {
    return 308 /bbs/;
}

location /bbs/ {
    if ($capubbs_forum_mode = new) {
        rewrite ^ /__capubbs_new_forum last;
    }
    try_files $uri $uri/ /bbs/index.php?$query_string;
}
```
