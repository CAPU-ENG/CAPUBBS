# CAPUBBS `new-dist` 打包与服务器部署手册

本文记录 2026-08-21 已验证通过的完整流程，用于把 `new` 分支中的 `forum` 前端打包到 `new-dist`，并部署完整 CAPUBBS 项目、实时数据库和 `bbsimg` 到 Ubuntu 服务器。

## 1. 已验证环境

- 本机：macOS、PHP 8.5、Node.js/npm、MySQL 客户端、SSH、rsync。
- 服务器：Ubuntu 26.04 LTS。
- Web：Nginx 1.28。
- PHP：PHP-FPM 8.5。
- 数据库：MariaDB 11.8。
- Git 仓库：`https://github.com/ThywQuake/CAPUBBS.git`。
- 源码分支：`new`。
- 发布分支：`new-dist`。
- 当前测试服务器 SSH 别名：`forum`。
- 当前测试服务器公网地址：`39.96.95.114`。
- 站点目录：`/var/www/capubbs`。

除非明确要部署到同一台测试服务器，否则先修改下列示例值。

```bash
deploy_ssh_target=forum
deploy_public_host=39.96.95.114
deploy_app_root=/var/www/capubbs
deploy_repo_url=https://github.com/ThywQuake/CAPUBBS.git
deploy_source_branch=new
deploy_dist_branch=new-dist
```

## 2. 重要约束

1. 所有源码开发仍在 `new` 完成；`new-dist` 只保存发布内容。
2. `new-dist` 中项目其他目录与 `new` 一致，只有 `forum/` 被替换成打包产物。
3. `forum/` 根目录直接保存 `index.html`、`assets/`、`favicon.png` 等产物，不保留 `dist/` 中间层；同时保留 `forum/.gitignore`。
4. `config.php`、数据库密码、数据库导出文件不得提交 Git。
5. 全量数据库同步会覆盖目标数据库，只能用于新服务器、测试环境或明确批准的重建。已有线上数据时应改用迁移脚本。
6. 执行任何删除、覆盖或数据库导入前，先确认目标路径、分支、数据库和备份。
7. 没有域名时只配置 HTTP。可信 HTTPS 证书应在域名解析到服务器后单独配置。
8. `forum/node_modules/`、`forum/.vite/` 和 TypeScript 构建缓存只需由 `.gitignore` 排除，打包切换分支时不得删除；尤其禁止对 `forum/` 使用 `git clean -fdx`。

## 3. 从 `new` 生成 `new-dist`

### 3.1 构建前检查

```bash
git switch new
git pull --ff-only origin new
git status --short --branch
```

必须确认工作区和暂存区均干净。

安装依赖、类型检查并构建：

```bash
cd forum
npm ci
npm run build
cd ..
```

构建结果应位于 `forum/dist/`。

可先使用 PHP 本地服务做非视觉验证：

```bash
php -S 127.0.0.1:8127 -t forum/dist
```

在另一个终端验证：

```bash
curl --fail --head http://127.0.0.1:8127/
curl --fail --head http://127.0.0.1:8127/assets/<实际主CSS文件名>
curl --fail --head http://127.0.0.1:8127/assets/<实际主JS文件名>
curl --fail --head http://127.0.0.1:8127/favicon.png
```

完成后停止 PHP 服务。

### 3.2 保存本次构建产物

切换分支会改变 `forum/`，因此先把产物保存到临时目录：

```bash
release_tmp=$(mktemp -d)
cp -R forum/dist/. "$release_tmp/"
find "$release_tmp" -mindepth 1 -maxdepth 2 -print | sort
```

### 3.3 首次创建 `new-dist`

仅在分支不存在时使用：

```bash
git switch -c new-dist
git rm -r -- forum
git restore --source=new --staged --worktree -- forum/.gitignore
install -d forum
cp -R "$release_tmp"/. forum/
if [ -d forum/dist ]; then
  find forum/dist -mindepth 1 -delete
  rmdir forum/dist
fi
git add -- forum
```

### 3.4 更新已有 `new-dist`

`git read-tree` 会把发布分支的项目内容更新为 `new` 的当前树，因此执行前必须确认工作区干净。

```bash
git switch new-dist
git status --short --branch
git read-tree --reset -u new
git rm -r -- forum
git restore --source=new --staged --worktree -- forum/.gitignore
install -d forum
cp -R "$release_tmp"/. forum/
if [ -d forum/dist ]; then
  find forum/dist -mindepth 1 -delete
  rmdir forum/dist
fi
git add -- forum
```

### 3.5 校验发布树并提交

```bash
test ! -d forum/dist
test -f forum/.gitignore
test -f forum/index.html
test -d forum/assets
test -f forum/favicon.png
git check-ignore -q forum/node_modules
test -z "$(git ls-files forum/node_modules)"
git ls-files forum | sort
git diff --cached --check
git status --short
```

确认其他项目文件已正确同步，且 Git 发布树中的 `forum/` 只有 `.gitignore` 和打包产物后提交。工作区里的 `node_modules/`、`.vite/` 等忽略目录可以继续保留：

```bash
git commit \
  -m "build: 更新 forum 生产构建产物" \
  -m "同步 new 分支项目内容，并将 forum 源码替换为直接位于 forum 根目录的 Vite 生产构建结果。"
git push --set-upstream origin new-dist
git status --short --branch
```

临时目录确认无误后再清理：

```bash
find "$release_tmp" -mindepth 1 -delete
rmdir "$release_tmp"
```

## 4. 首次检查服务器

先执行只读检查：

```bash
ssh -o BatchMode=yes -o ConnectTimeout=10 "$deploy_ssh_target" '
  id
  hostname
  uname -a
  test -r /etc/os-release && grep PRETTY_NAME /etc/os-release
  php -v 2>/dev/null || true
  nginx -v 2>&1 || true
  mariadb --version 2>/dev/null || true
  systemctl is-active nginx php8.5-fpm mariadb 2>/dev/null || true
  ss -lnt
  df -h /
  find /var/www -mindepth 1 -maxdepth 2 -print 2>/dev/null
'
```

如果目标已有站点、数据库或用户上传文件，必须先备份，不能直接套用首次初始化命令。

## 5. 安装服务器环境

```bash
ssh "$deploy_ssh_target" '
  set -e
  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y \
    nginx mariadb-server \
    php-fpm php-cli php-mysql php-mbstring php-curl php-gd php-xml php-zip php-sqlite3 \
    rsync curl ca-certificates
  systemctl enable --now nginx mariadb php8.5-fpm
'
```

验证：

```bash
ssh "$deploy_ssh_target" '
  systemctl is-active nginx mariadb php8.5-fpm
  php -m | grep -E "^(curl|dom|gd|mbstring|mysqli|pdo_mysql|SimpleXML|sqlite3|zip)$" | sort
  mariadb --version
'
```

若系统安装的 PHP 版本不是 8.5，后续 Nginx 配置中的 FPM socket 和服务名必须相应调整。

## 6. 同步代码

### 6.1 服务器可访问 GitHub 时

```bash
ssh "$deploy_ssh_target" "
  git clone \
    --branch $deploy_dist_branch \
    --single-branch \
    $deploy_repo_url \
    $deploy_app_root
"
```

### 6.2 GitHub 克隆卡住时

本次部署中，服务器到 GitHub 的 HTTPS 克隆持续无数据传输。可直接从本机通过 SSH 发送发布分支：

```bash
ssh "$deploy_ssh_target" "install -d -m 0755 $deploy_app_root"
git archive --format=tar "$deploy_dist_branch" \
  | ssh "$deploy_ssh_target" "tar -xpf - -C $deploy_app_root"
```

记录准确提交号：

```bash
deploy_commit=$(git rev-parse "$deploy_dist_branch")
printf '%s\n' "$deploy_commit" \
  | ssh "$deploy_ssh_target" "install -o root -g www-data -m 0640 /dev/stdin $deploy_app_root/.deployed-commit"
```

Nginx 配置会禁止访问点文件，因此该标识不会公开。

## 7. 同步用户图片

`bbsimg/` 被 Git 忽略，但数据库内容会引用其中的头像和帖子图片，必须单独同步。

```bash
rsync -az --stats bbsimg/ "$deploy_ssh_target:$deploy_app_root/bbsimg/"
```

macOS 自带 rsync 版本较旧，不要使用 `--info=stats2`；使用 `--stats`。

首次同步后记录文件数和字节数：

```bash
find bbsimg -type f | wc -l
du -sb bbsimg 2>/dev/null || du -sk bbsimg

ssh "$deploy_ssh_target" "
  find $deploy_app_root/bbsimg -type f | wc -l
  du -sb $deploy_app_root/bbsimg
"
```

## 8. 创建数据库和运行配置

在服务器生成随机密码。密码只保存在 root 可读文件和站点 `config.php` 中，不回显到终端。

```bash
ssh "$deploy_ssh_target"
```

进入服务器后执行：

```bash
set -euo pipefail

install -d -m 0700 /etc/capubbs
if [ ! -s /etc/capubbs/db-password ]; then
  umask 077
  openssl rand -hex 32 > /etc/capubbs/db-password
fi

db_pass=$(tr -d '\r\n' < /etc/capubbs/db-password)

mariadb -e "CREATE DATABASE IF NOT EXISTS capubbs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mariadb -e "
  CREATE USER IF NOT EXISTS 'capubbs_app'@'localhost' IDENTIFIED BY '${db_pass}';
  ALTER USER 'capubbs_app'@'localhost' IDENTIFIED BY '${db_pass}';
  GRANT ALL PRIVILEGES ON capubbs.* TO 'capubbs_app'@'localhost';
  FLUSH PRIVILEGES;
"

cp /var/www/capubbs/config.sample.php /var/www/capubbs/config.php

sed -i "s|^define('CAPUBBS_DB_USERNAME'.*|define('CAPUBBS_DB_USERNAME', 'capubbs_app');|" /var/www/capubbs/config.php
sed -i "s|^define('CAPUBBS_DB_PASSWORD'.*|define('CAPUBBS_DB_PASSWORD', '${db_pass}');|" /var/www/capubbs/config.php
sed -i "s|^define('CAPUBBS_DB_HOSTNAME'.*|define('CAPUBBS_DB_HOSTNAME', 'localhost');|" /var/www/capubbs/config.php
sed -i "s|^define('CAPUBBS_HOST'.*|define('CAPUBBS_HOST', '39.96.95.114');|" /var/www/capubbs/config.php

chown root:www-data /var/www/capubbs/config.php
chmod 0640 /var/www/capubbs/config.php
php -l /var/www/capubbs/config.php
```

将示例中的公网 IP 换成实际域名或 IP。配置完成后退出服务器 Shell。

样例配置中的 SMTP 账号不能发送邮件。若要测试邮件验证码，应在服务器 `config.php` 中单独写入有效 SMTP 配置，并继续保持文件不入 Git。

## 9. 全量同步实时数据库

### 9.1 先确认本地数据库

本机 `config.php` 应能连接准备同步的 `capubbs` 数据库：

```bash
php -r '
require "config.php";
$con = mysqli_connect(
    CAPUBBS_DB_HOSTNAME,
    CAPUBBS_DB_USERNAME,
    CAPUBBS_DB_PASSWORD,
    "capubbs"
);
if (!$con) exit(1);
$result = mysqli_query($con, "SHOW TABLES");
echo "tables=", mysqli_num_rows($result), PHP_EOL;
'
```

### 9.2 目标已有数据时先备份

```bash
ssh "$deploy_ssh_target" '
  set -e
  install -d -m 0700 /root/backups
  backup_name=/root/backups/capubbs-before-import-$(date +%Y%m%d%H%M%S).sql.gz
  mariadb-dump --single-transaction --routines --triggers --events --hex-blob capubbs \
    | gzip -9 \
    | install -m 0600 /dev/stdin "$backup_name"
  gzip -t "$backup_name"
  echo "$backup_name"
'
```

### 9.3 通过 SSH 流式导入

该命令不会在本机或服务器留下明文 SQL 文件：

```bash
set -o pipefail

db_host=$(php -r 'require "config.php"; echo CAPUBBS_DB_HOSTNAME;')
db_user=$(php -r 'require "config.php"; echo CAPUBBS_DB_USERNAME;')
db_pass=$(php -r 'require "config.php"; echo CAPUBBS_DB_PASSWORD;')

MYSQL_PWD="$db_pass" mysqldump \
  --host="$db_host" \
  --user="$db_user" \
  --no-tablespaces \
  --column-statistics=0 \
  --set-gtid-purged=OFF \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  --hex-blob \
  --default-character-set=utf8mb4 \
  capubbs \
  | ssh "$deploy_ssh_target" 'mariadb --default-character-set=utf8mb4 capubbs'
```

### 9.4 逐表核对

至少核对：

- 表数量一致。
- 每张表 `COUNT(*)` 一致。
- 关键内容表与用户表行数一致。
- `bbsimg` 文件数量和体积一致。

本次验证结果为 42 张表、51,893 行，逐表完全一致。该数字只用于识别本次快照，下次应以当时本机数据为准。

## 10. 权限和可写目录

```bash
ssh "$deploy_ssh_target" "
  set -e
  chown -R root:www-data $deploy_app_root

  install -d -o www-data -g www-data -m 0755 \
    $deploy_app_root/bbs/attachment \
    $deploy_app_root/bbs/images \
    $deploy_app_root/assets/downloads \
    $deploy_app_root/log \
    $deploy_app_root/bbsimg/upload \
    $deploy_app_root/bbsimg/icons

  chown -R www-data:www-data \
    $deploy_app_root/bbs/attachment \
    $deploy_app_root/bbs/images \
    $deploy_app_root/assets/downloads \
    $deploy_app_root/log \
    $deploy_app_root/bbsimg

  chown root:www-data $deploy_app_root/config.php
  chmod 0640 $deploy_app_root/config.php
"
```

## 11. 配置 Nginx

仓库中的模板为：

`docs/deployment/nginx-capubbs.conf.example`

模板已经处理以下路由：

- `/` 和前端深链返回 `forum/index.html`。
- `/forum/` 继续可访问。
- `/assets/` 优先读取 `forum/assets/`，否则读取旧站 `assets/`。
- `/api`、`/bbs`、`/bbsimg` 和旧 PHP 路径仍从项目根目录提供。
- `config.php`、`config.sample.php`、`capubbs.sql` 和点文件禁止公网访问。

上传模板：

```bash
scp docs/deployment/nginx-capubbs.conf.example \
  "$deploy_ssh_target:/etc/nginx/sites-available/capubbs"
```

若 PHP 版本或站点目录不同，先在服务器修改 FPM socket 和 `root`。

启用配置：

```bash
ssh "$deploy_ssh_target" '
  set -e
  ln -sfn /etc/nginx/sites-available/capubbs /etc/nginx/sites-enabled/capubbs
  if [ -L /etc/nginx/sites-enabled/default ]; then
    unlink /etc/nginx/sites-enabled/default
  fi
  nginx -t
  systemctl reload nginx
  systemctl is-active nginx php8.5-fpm mariadb
'
```

Ubuntu 的 `/etc/nginx/snippets/fastcgi-php.conf` 已包含 PHP 文件存在性检查。不要在 PHP location 中重复添加 `try_files $uri =404;`，否则 `nginx -t` 会报告重复指令。

## 12. 配置防火墙

先放行当前 SSH 端口，再启用 UFW，避免锁掉 SSH：

```bash
ssh "$deploy_ssh_target" '
  set -e
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw --force enable
  ufw status verbose
'
```

MariaDB 应只监听 `127.0.0.1:3306`，不要向公网开放 3306。

配置域名和 HTTPS 后再放行 443：

```bash
ufw allow 443/tcp
```

## 13. 部署后备份

```bash
ssh "$deploy_ssh_target" '
  set -e
  install -d -m 0700 /root/backups
  backup_name=/root/backups/capubbs-initial-$(date +%Y%m%d%H%M%S).sql.gz
  mariadb-dump --single-transaction --routines --triggers --events --hex-blob capubbs \
    | gzip -9 \
    | install -m 0600 /dev/stdin "$backup_name"
  gzip -t "$backup_name"
  stat -c "BACKUP=%n SIZE=%s MODE=%a" "$backup_name"
'
```

## 14. 验证清单

### 14.1 服务和端口

```bash
ssh "$deploy_ssh_target" '
  systemctl is-active nginx php8.5-fpm mariadb
  nginx -t
  ss -lnt | grep -E "(:22|:80|:3306)[[:space:]]"
  df -h /
'
```

预期：

- SSH 和 Nginx 监听公网地址。
- MariaDB 只监听 `127.0.0.1:3306`。
- 三个服务均为 `active`。

### 14.2 公网 HTTP

```bash
for url in \
  '/' \
  '/forum/' \
  '/login' \
  '/user-center' \
  '/favicon.png' \
  '/api/api.php?ask=bbsinfo' \
  '/api/api.php?ask=recent_threads&limit=5' \
  '/api/api.php?ask=hot_threads&limit=5' \
  '/assets/api/getCalendar.php'
do
  curl \
    --connect-timeout 8 \
    --max-time 20 \
    --silent \
    --show-error \
    --output /dev/null \
    --write-out '%{http_code}\t%{content_type}\t%{url_effective}\n' \
    "http://$deploy_public_host${url}"
done
```

预期均返回 HTTP 200。API 还应确认是有效 JSON。

### 14.3 敏感文件

```bash
for url in \
  '/config.php' \
  '/config.sample.php' \
  '/capubbs.sql' \
  '/.deployed-commit'
do
  curl \
    --silent \
    --output /dev/null \
    --write-out '%{http_code}\t%{url_effective}\n' \
    "http://$deploy_public_host${url}"
done
```

预期为 HTTP 403，不得返回文件内容。

### 14.4 日志

```bash
ssh "$deploy_ssh_target" '
  tail -n 100 /var/log/nginx/error.log
  journalctl -u php8.5-fpm --since "30 minutes ago" --no-pager
'
```

只做功能和日志验证；UI 视觉验收由项目负责人完成。

## 15. 后续更新流程

1. 在 `new` 完成源码修改、测试并提交。
2. 按第 3 节重新生成并推送 `new-dist`。
3. 备份服务器数据库、代码和用户上传目录。
4. 将 `new-dist` 解压到服务器临时目录。
5. 使用 rsync 更新站点代码，同时排除服务器状态文件：

```text
config.php
bbsimg/
bbs/attachment/
bbs/images/
assets/downloads/
log/
.deployed-commit
```

6. 重新写入 `.deployed-commit`。
7. 只有存在明确数据库迁移时才更新数据库；不要每次覆盖生产数据库。
8. 重设权限，执行 `nginx -t`，必要时 reload PHP-FPM/Nginx。
9. 完整执行第 14 节验证。

## 16. 回滚原则

- 代码回滚：恢复部署前的代码备份，但保留当前 `config.php` 和用户上传目录。
- 数据库回滚：只在确认必须恢复时使用对应 SQL 备份；恢复会丢失备份之后的数据。
- Nginx 回滚：保留 `/etc/nginx/sites-available/` 中上一版配置，恢复链接后必须先执行 `nginx -t`。
- 回滚后再次验证服务、HTTP、API、数据库连接、静态资源和日志。

## 17. 本次部署中发现的问题

1. 服务器访问 GitHub 时 clone 卡住，可用 `git archive | ssh tar` 绕过。
2. macOS 自带 rsync 不支持 `--info=stats2`，应使用 `--stats`。
3. Ubuntu 的 PHP Nginx snippet 已包含 `try_files`，重复配置会导致语法检查失败。
4. Vite 产物引用根路径 `/assets/...`，Nginx 必须优先把 `/assets` 映射到 `forum/assets`，同时兼容旧站 `assets`。
5. `bbsimg` 不在 Git 中，必须单独同步并赋予 `www-data` 写权限。
6. 仓库中的 `capubbs.sql` 可能只是结构样例；同步前应优先检查本机实时数据库。
7. 仅使用公网 IP 时无法配置受浏览器信任的常规 HTTPS 证书。
8. 样例 SMTP 配置不能发送验证码；普通浏览和已有账户登录不依赖 SMTP。
9. Vite/esbuild 审计问题位于开发服务器依赖，不进入静态产物；源码分支仍应择机升级 Vite。
10. 不要对 `forum/` 使用 `git clean -fdx` 或整目录删除；这会把已经正确忽略的 `node_modules/` 一并删除。发布时保留 `.gitignore`，只操作 Git 跟踪的源码和 `dist/` 产物。
