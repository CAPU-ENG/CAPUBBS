CAPUBBS
=======

APIs and web for CAPUBBS.

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
