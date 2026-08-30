CAPUBBS
=======

APIs and web for CAPUBBS.

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

Vite 默认通过 `http://localhost:8080` 访问 PHP 接口；如 PHP 服务使用其他地址，设置 `CAPUBBS_PHP_ORIGIN`。开发服务也会读取 `capubbs_forum_mode` Cookie：`legacy` 请求转发给旧 PHP 论坛，其余请求加载新论坛。

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

`/bbs/` 是新旧论坛的统一路由根。首次访问默认加载新论坛；切换模式时写入浏览器 Cookie。此后首页、版面、帖子、搜索、用户中心等 `/bbs/...` 请求都按 Cookie 加载对应实现，不跳转目录，也不附加模式参数。新论坛生成的链接只使用 `/bbs`。

生产环境需要在 Nginx 的 `http` 作用域根据 Cookie 生成模式变量，并在站点中配置 `/bbs` 分流。完整规则见 `SERVER_DEPLOYMENT.md`；核心逻辑如下：

```nginx
map $cookie_capubbs_forum_mode $capubbs_forum_mode {
    default new;
    legacy legacy;
}

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
