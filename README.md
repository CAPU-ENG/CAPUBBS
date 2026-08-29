CAPUBBS
=======

APIs and web for CAPUBBS.

## 本地开发

在仓库根目录启动 PHP 服务。必须加载仓库内的 `php.ini`，否则档案室上传仍会使用 PHP 默认的 2M/8M 限制：

```bash
php -c php.ini -S localhost:8080
```

另开终端启动新论坛前端：

```bash
cd forum
npm install
npm run dev
```

Vite 默认通过 `http://localhost:8080` 访问 PHP 接口；如 PHP 服务使用其他地址，设置 `CAPUBBS_PHP_ORIGIN`。

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

将 `forum/dist` 的内容部署到 Web 服务器的 `/forum/` 目录，并将 `/forum/*` 中不存在的静态文件回退到 `/forum/index.html`。`/api`、旧站 `/assets`、`/bbs` 和 `/bbsimg` 继续由域名根目录下的 PHP 站点处理。部署 PHP 配置或前端文件后，重启 PHP-FPM/Web 服务器并清理可能存在的旧缓存。

新论坛生成的页面地址统一以 `/forum/` 为前缀。为了让无尾斜杠的 `/forum` 也能直接访问，Nginx 需要增加精确入口，并与 `/forum/` 深链共同回退到同一个前端文件：

```nginx
location = /forum {
    try_files /forum/index.html =404;
}

location /forum/ {
    try_files $uri $uri/ /forum/index.html;
}
```
