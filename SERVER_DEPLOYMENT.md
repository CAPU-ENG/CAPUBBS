# CAPUBBS 新论坛正式上线手册

本文面向负责 CAPUBBS 正式服务器的系统管理员。目标是在保留现有数据库、老 BBS、用户上传文件和账号体系的前提下，将新论坛完整上线，并为失败回滚保留可靠路径。

本手册默认使用 Nginx、PHP-FPM 和 MySQL。若正式服务器使用 Apache，请实现与本文 Nginx 配置等价的静态文件、PHP、前端深链回退和敏感文件保护规则。

## 一、上线前必须确认的信息

开始前，由发布负责人和服务器管理员共同确认并记录：

- 正式域名，例如 `chexie.net`。
- Web 根目录，例如 `/var/www/capubbs`。
- PHP-FPM 服务名和套接字，例如 `php8.5-fpm`、`/run/php/php8.5-fpm.sock`。
- MySQL 主机、数据库名和备份账号。
- PHP-FPM 实际运行账号，例如 `www-data`。
- 档案室物理目录，例如 `/srv/capubbs-archive`。
- 本次部署的 `new-dist` 精确提交号。
- 数据库增量脚本的来源提交号和 SHA-256 校验值。
- 代码、数据库和用户文件备份的保存位置。
- 上线窗口、验证负责人和回滚决定人。

不要仅记录“最新版本”。上线记录必须包含不可变化的 Git 提交号。

## 二、理解交付物

正式上线需要两份彼此分离的交付物。

### 1. 生产代码

生产代码来自 `new-dist` 分支。该分支包含：

- PHP API 和公共库。
- 老 BBS。
- 编译后的新论坛，位于 `forum/`。
- 生产运行所需的静态资源。
- `php.ini` 参考配置。

`new-dist` 不应包含 Agent 文档、数据库 SQL、前端源码、Node.js 依赖或本地测试文件。服务器上不需要执行 `npm install`。

### 2. 数据库增量脚本

数据库管理员需要单独取得 `production_schema_extensions.sql`。该文件不在 `new-dist` 中，必须通过受控渠道传到 Web 根目录之外，例如：

```text
/root/capubbs-migrations/production_schema_extensions.sql
```

该脚本增加 11 张表：

- `season_activity_schedule`
- `season_activity_signup_window`
- `archive_entries`
- `archive_downloads`
- `user_floor_decoration`
- `user_tags`
- `user_tag_members`
- `user_tag_displays`
- `user_medals`
- `user_medal_members`
- `user_medal_displays`

脚本只使用 `CREATE TABLE IF NOT EXISTS`，不会主动删除数据。但是，如果服务器已经有同名但结构不同的表，MySQL 不会自动修正其结构，必须先执行 `SHOW CREATE TABLE` 人工比对。

严禁把 SQL 文件放进可被 HTTP 访问的目录。

## 三、上线前演练

正式上线前，至少在一套与正式服 MySQL、PHP 主版本一致的环境完成一次全流程演练：

1. 恢复最近一次正式数据库备份。
2. 恢复用户头像、帖子图片、附件和档案室文件。
3. 执行数据库增量脚本。
4. 部署 `new-dist`。
5. 使用正式服配置的脱敏副本启动 PHP 和 Web 服务。
6. 完成本文“上线验收”中的全部项目。
7. 实际执行一次代码回滚，确认旧论坛仍可工作。

不能只验证前端首页。必须验证登录、读帖、发帖、回复、图片、附件、活动、标签、勋章、楼层装饰和档案室。

## 四、检查服务器运行依赖

### 1. PHP

建议使用服务器已验证过的 PHP 8.x 版本，并安装以下扩展：

- `mysqli`
- `mbstring`
- `curl`
- `fileinfo`
- `gd`，且必须支持 WebP
- `json`
- `openssl`

检查示例：

```bash
php -v
php -m | grep -E 'mysqli|mbstring|curl|fileinfo|gd|json|openssl'
php -r 'if (!function_exists("imagewebp")) { fwrite(STDERR, "GD WebP missing\n"); exit(1); } echo "GD WebP OK\n";'
```

CLI PHP 和 PHP-FPM 可能读取不同的配置文件。必须同时检查 PHP-FPM 的实际配置，不能只看 `php --ini`。

### 2. MySQL

数据库需要 MySQL 5.7 或更高版本，并支持 InnoDB、外键和 `utf8mb4_unicode_ci`：

```sql
SELECT VERSION();
SHOW ENGINES;
SHOW COLLATION LIKE 'utf8mb4_unicode_ci';
```

执行建表脚本应使用独立的迁移账号。应用日常账号只需要业务所需的 `SELECT`、`INSERT`、`UPDATE`、`DELETE` 权限，不应长期拥有 `DROP` 权限。

### 3. 磁盘空间

上线前检查以下位置：

- Web 根目录及其备份至少能同时容纳旧版和新版代码。
- MySQL 数据目录能容纳完整备份及新增索引。
- PHP 上传临时目录至少能容纳一个 520 MiB 请求。
- 档案室目录有足够的长期存储空间。
- PHP、Nginx 和系统日志所在分区有足够空间。

## 五、进入维护窗口并完成备份

数据库包含 MyISAM 老表，仅使用 `mysqldump --single-transaction` 不能保证所有表处于同一时间点。应先停止写入或进入维护模式，再备份数据库。

至少备份以下内容：

- 完整 MySQL 数据库，包括触发器、事件和存储过程。
- 当前 Web 根目录。
- 正式 `config.php`。
- `bbs/attachment/`。
- `bbs/images/`。
- `bbsimg/`。
- `assets/downloads/`。
- `assets/images/posters/`。
- `documents/`、`dump/`、`log/` 和 `msgxml.xml` 等现有服务器数据。
- 档案室物理目录。
- 当前 Nginx/Apache 和 PHP-FPM 配置。

数据库备份示例：

```bash
mysqldump \
  --default-character-set=utf8mb4 \
  --lock-all-tables \
  --routines \
  --triggers \
  --events \
  capubbs > /srv/backups/capubbs/before-new-forum/capubbs.sql
```

备份完成后必须执行恢复检查，至少确认 SQL 文件非空、结尾完整，并能在临时数据库中导入。文件备份应保留权限、属主和时间戳。

## 六、执行数据库增量

### 1. 确认父表存在

两个活动时间表依赖现有的 `season_threads_activity`：

```sql
SHOW CREATE TABLE season_threads_activity;
```

该表必须使用 InnoDB，且 `activity_id` 的类型必须与增量脚本一致。否则先停止上线并处理结构差异，不要删除外键绕过问题。

### 2. 检查同名表

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'capubbs'
  AND table_name IN (
    'season_activity_schedule',
    'season_activity_signup_window',
    'archive_entries',
    'archive_downloads',
    'user_floor_decoration',
    'user_tags',
    'user_tag_members',
    'user_tag_displays',
    'user_medals',
    'user_medal_members',
    'user_medal_displays'
  );
```

首次上线时通常不应返回这些表。若返回任何表，先与增量脚本逐项核对字段、索引、字符集和外键。

### 3. 执行脚本

```bash
chmod 600 /root/capubbs-migrations/production_schema_extensions.sql
mysql --default-character-set=utf8mb4 --show-warnings --database=capubbs \
  < /root/capubbs-migrations/production_schema_extensions.sql
```

执行完成后查询表数量和外键：

```sql
SELECT COUNT(*) AS new_table_count
FROM information_schema.tables
WHERE table_schema = 'capubbs'
  AND table_name IN (
    'season_activity_schedule',
    'season_activity_signup_window',
    'archive_entries',
    'archive_downloads',
    'user_floor_decoration',
    'user_tags',
    'user_tag_members',
    'user_tag_displays',
    'user_medals',
    'user_medal_members',
    'user_medal_displays'
  );
```

结果必须为 `11`。确认无误后，将增量脚本移出服务器或转移到只有数据库管理员可读的归档位置，不能留在 Web 根目录。

## 七、准备正式配置

正式配置文件是 Web 根目录下的 `config.php`。它被 Git 忽略，不会随发布包提供。应在现有正式配置基础上补充新配置，不能直接用 `config.sample.php` 覆盖。

至少核对以下内容：

```php
<?php
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('log_errors', '1');

define('CAPUBBS_DB_USERNAME', '正式数据库账号');
define('CAPUBBS_DB_PASSWORD', '正式数据库密码');
define('CAPUBBS_DB_HOSTNAME', '正式数据库地址');
define('CAPUBBS_HOST', 'chexie.net');

define('ADMIN_EMAIL', '管理员联系邮箱');
define('OSS_ADDRESS', '实际 OSS 地址');
define('CAPUBBS_CDN_URL', '');

define('CAPUBBS_BROWSER_DOWNLOAD_URL', '实际浏览器下载地址');
define('CAPUBBS_ARCHIVE_ROOT', '/srv/capubbs-archive');
define('CAPUBBS_ARCHIVE_ID_SECRET', '正式服独立随机密钥');
define('CAPUBBS_ARCHIVE_MAX_BYTES', 500 * 1024 * 1024);

define('CAPUBBS_ENABLE_EMAIL_VERIFY', true);
define('CAPUBBS_ENABLE_EMAIL_MUTE', true);
define('CAPUBBS_ENABLE_POST_CONTROL', true);

define('CAPUBBS_SMTP_SERVER', '实际 SMTP 服务器');
define('CAPUBBS_SMTP_PORT', 465);
define('CAPUBBS_SMTP_USER', '实际 SMTP 用户');
define('CAPUBBS_SMTP_PASS', '实际 SMTP 密码');
define('CAPUBBS_SMTP_FROM_NAME', 'CAPUBBS');
define('CAPUBBS_VERIFY_CODE_EXPIRE', 10);
```

注意：

- `CAPUBBS_HOST` 只填写域名，不包含 `https://` 和路径。
- `CAPUBBS_ARCHIVE_ID_SECRET` 可用 `php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'` 生成。
- 密钥、数据库密码和 SMTP 密码不得出现在 Git、工单截图或公开日志中。
- `config/client.php` 会把浏览器下载地址返回给前端，不能向该接口增加秘密配置。
- 开启邮箱验证前，必须实际验证 SMTP 发信、验证码过期和频率限制。
- 正式环境不得使用本地或测试环境约定的测试密码。

设置权限，使 PHP 可以读取、普通 Web 请求不能下载：

```bash
chown root:www-data /var/www/capubbs/config.php
chmod 640 /var/www/capubbs/config.php
```

## 八、准备档案室和可写目录

档案室必须放在 Web 根目录之外：

```bash
install -d -o www-data -g www-data -m 0750 /srv/capubbs-archive
```

以下已有业务目录需要 PHP-FPM 写权限，并且部署时必须保留原内容：

- `/var/www/capubbs/bbs/attachment/`
- `/var/www/capubbs/bbs/images/`
- `/var/www/capubbs/bbsimg/`
- `/var/www/capubbs/assets/downloads/`
- `/var/www/capubbs/assets/images/posters/`

不要把整个 Web 根目录交给 PHP-FPM 写入。代码文件应由发布账号拥有，只给上述业务目录写权限。

活动报名的老兼容代码会写 `/tmp/capu_log`。该文件可能包含报名字段，应预先创建并限制为 PHP-FPM 账号可读写：

```bash
touch /tmp/capu_log
chown www-data:www-data /tmp/capu_log
chmod 0600 /tmp/capu_log
```

如果系统会在重启时清理 `/tmp`，应通过系统临时文件规则重新创建同权限文件，并将其纳入隐私和日志轮转管理。

## 九、配置 PHP-FPM 和上传限制

仓库根目录的 `php.ini` 是参考配置，不保证会被 PHP-FPM 自动加载。必须修改 PHP-FPM 实际使用的配置：

```ini
upload_max_filesize = 500M
post_max_size = 520M
display_errors = Off
display_startup_errors = Off
log_errors = On
```

同时确认：

- `upload_tmp_dir` 所在分区空间充足且不可由 Web 直接访问。
- PHP-FPM 和反向代理的请求超时足以完成 500 MiB 上传。
- PHP 错误日志写入受控目录并配置日志轮转。
- GD 处理大图时有足够内存。

修改后先检查配置，再重启 PHP-FPM。服务名按正式服务器实际值替换：

```bash
systemctl restart php8.5-fpm
systemctl status php8.5-fpm --no-pager
```

## 十、部署 `new-dist`

不要直接在正在提供服务的 Web 根目录执行 `git pull`。应把指定提交检出到独立发布目录，核对提交号后再同步。

发布负责人可以交付带 SHA-256 的归档包；或者由管理员在非 Web 目录检出 `new-dist` 的指定提交。无论采用哪种方式，都要确认实际内容对应审批过的提交，而不是未经锁定的分支头。

发布目录检查示例：

```bash
git -C /srv/releases/capubbs-new-dist rev-parse HEAD
find /srv/releases/capubbs-new-dist -type f \
  \( -name '*.sql' -o -name 'AGENTS.md' -o -name 'CLAUDE.md' -o -name 'GEMINI.md' \) \
  -print
test -f /srv/releases/capubbs-new-dist/forum/index.html
test -f /srv/releases/capubbs-new-dist/php.ini
```

`rev-parse` 必须得到本次审批的提交号；`find` 不应输出任何文件。若使用归档包，还要先执行 `sha256sum -c` 验证发布负责人提供的校验文件。

同步前先执行一次 `--dry-run`：

```bash
rsync -a --delete --dry-run \
  --exclude='config.php' \
  --exclude='bbs/attachment/' \
  --exclude='bbs/images/' \
  --exclude='bbsimg/' \
  --exclude='assets/downloads/' \
  --exclude='assets/images/posters/' \
  --exclude='documents/' \
  --exclude='dump/' \
  --exclude='log/' \
  --exclude='msgxml.xml' \
  /srv/releases/capubbs-new-dist/ \
  /var/www/capubbs/
```

这只是仓库已知服务器数据的排除清单。管理员还必须先盘点正式服中所有不受 Git 管理的目录；发现额外数据时，先增加排除项和备份。人工检查输出，确认不会删除配置、头像、帖子图片、附件或其他服务器数据，再去掉 `--dry-run` 执行正式同步。

如果 `.well-known/` 由证书系统单独维护，也需要加入排除项；仓库自带的 `apple-app-site-association` 则应保留或在部署后单独恢复。

部署后再次确认：

- `config.php` 仍存在且权限未改变。
- `php.ini`、`README.md`、`.git` 和备份文件不能被 HTTP 下载。
- `forum/index.html` 和 `forum/assets/` 来自同一次构建，不能混用不同版本的哈希资源。
- `new-dist` 中不存在 SQL 和 Agent 文档。

## 十一、配置 Nginx

以下配置展示关键路由。证书路径、日志、PHP-FPM 套接字和安全策略应合并到服务器现有配置中：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name chexie.net www.chexie.net;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name chexie.net www.chexie.net;

    root /var/www/capubbs;
    index index.php index.html;
    charset utf-8;
    client_max_body_size 520m;

    # 域名根路径显示新论坛。
    location = / {
        try_files /forum/index.html =404;
    }

    # 规范化新论坛入口。
    location = /forum {
        return 308 /forum/;
    }

    # HTML 入口不做长期缓存，确保新版本能及时引用新的哈希资源。
    location = /forum/index.html {
        add_header Cache-Control "no-cache";
    }

    # 带内容哈希的构建资源可长期缓存。
    location ^~ /forum/assets/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React 路由深链回退。
    location /forum/ {
        try_files $uri $uri/ /forum/index.html;
    }

    # 兼容旧构建的 /assets/*，同时保留原站 assets。
    location /assets/ {
        try_files /forum$uri $uri =404;
    }

    # API、老 BBS、图片和其他真实文件优先；不存在的前端路由回退到新论坛。
    location / {
        try_files $uri $uri/ /forum/index.html;
    }

    location ~ \.php$ {
        try_files $uri =404;
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
    }

    location = /config.php {
        deny all;
    }

    location = /config.sample.php {
        deny all;
    }

    location = /php.ini {
        deny all;
    }

    location = /README.md {
        deny all;
    }

    location ~* \.(sql|ini|md|log|bak|dump)$ {
        deny all;
    }

    location ~ /\.(?!well-known/) {
        deny all;
    }
}
```

若域名前面还有 CDN 或反向代理：

- 同步设置最大请求体和超时。
- 正确配置可信代理和真实客户端 IP，否则下载记录和安全日志只会记录代理 IP。
- 不缓存登录、用户资料、消息、管理和上传 API。
- `forum/assets/` 可以长缓存，但 `forum/index.html` 应使用短缓存或不缓存。

检查并平滑重载：

```bash
nginx -t
systemctl reload nginx
```

## 十二、上线前命令行检查

先在服务器本机通过域名和 HTTPS 检查：

```bash
curl -fsS https://chexie.net/forum/ > /dev/null
curl -fsS https://chexie.net/config/client.php
curl -fsS 'https://chexie.net/api/api.php?ask=bbsinfo'
curl -fsSI https://chexie.net/bbs/index/
```

确认敏感文件不可访问：

```bash
curl -o /dev/null -sS -w '%{http_code}\n' https://chexie.net/config.php
curl -o /dev/null -sS -w '%{http_code}\n' https://chexie.net/php.ini
curl -o /dev/null -sS -w '%{http_code}\n' https://chexie.net/README.md
curl -o /dev/null -sS -w '%{http_code}\n' https://chexie.net/.git/config
```

这些地址应返回 `403` 或 `404`，绝不能返回 `200`。

同时检查 PHP 和 Nginx 错误日志中没有：

- 数据库连接错误。
- 缺表、缺列或外键错误。
- PHP 警告混入 JSON。
- 文件目录不可写。
- `imagewebp`、`finfo`、`mbstring` 等函数缺失。
- 前端哈希资源 `404`。

## 十三、上线验收

命令行检查通过后，由指定验收人员使用正式测试账号依次验证。不要使用生产用户的密码，也不要把本地或测试服务器密码约定带到正式环境。

### 公开访问

- `/` 能打开新论坛首页。
- `/forum/` 和一个新论坛深链刷新后都能正常打开。
- 游客能查看允许公开的版面、主题和用户资料。
- 游客无法读取受限版面正文。
- 老 BBS `/bbs/index/` 仍可访问。

### 账号和消息

- 登录、注销和会话保持正常。
- 注册、邮箱验证码、密码重置和管理员联系邮箱正常。
- 站内消息、新消息计数和系统通知正常。

### 帖子

- 版面列表、分页、搜索、随机帖子和全局置顶正常。
- 发帖、回复、编辑、删除和恢复正常。
- 老帖子 BBCode、签名档、引用和嵌入 HTML 正常。
- 新论坛图廊在新旧论坛均能显示。
- 图片上传和附件上传、下载正常。

### 活动

- 创建活动时能保存活动日期和报名窗口。
- 报名、修改、取消、恢复和汇总正常。
- 报名窗口关闭后服务端会拒绝新报名。
- 老 BBS 的活动入口仍可使用。
- CSV 报名表能下载并用表格软件打开。

### 标签、勋章和装饰

- 管理员能创建标签、授予和移除标签。
- 用户只能佩戴自己拥有的标签，且最多两枚。
- 管理员能创建勋章、上传图片、授予和撤销。
- 用户最多展示三枚勋章，三种展示状态正确。
- 亮色和暗色楼层装饰可以分别上传、显示和删除。
- 勋章及装饰生成的 WebP 文件权限和 URL 正常。

### 档案室

- 普通登录用户能浏览和下载。
- 管理员能创建文件夹、上传、移动、重命名和遮蔽。
- 500 MiB 上限在 Nginx、PHP 和应用层一致。
- 下载记录和统计能写入数据库。
- 无法通过 URL 直接访问档案室物理目录。

全部通过后才能结束维护窗口并开放写入。

## 十四、上线后观察

上线后至少持续观察：

- Nginx 4xx、5xx 数量。
- PHP-FPM 错误、慢请求和进程占用。
- MySQL 错误日志、慢查询和连接数。
- `archive_downloads`、标签、勋章、活动表的写入情况。
- `bbsimg/`、附件目录、档案室和 PHP 临时目录的磁盘增长。
- SMTP 退信和验证码发送失败。
- CDN 是否缓存了用户相关 API 或旧版 `forum/index.html`。

保留本次发布的提交号、数据库脚本校验值、开始/结束时间、执行人、验证结果和异常处理记录。

## 十五、回滚

出现以下情况应立即考虑回滚：

- 大量 5xx 或数据库错误。
- 登录、发帖、回复等核心功能不可用。
- 新代码写入错误数据。
- 用户上传或档案室文件出现丢失、覆盖风险。
- 敏感配置、SQL、备份或用户数据可以通过 HTTP 下载。

回滚步骤：

1. 重新进入维护模式并停止写入。
2. 保存故障时间段的 Nginx、PHP 和 MySQL 日志。
3. 恢复上一版代码，保留当前 `config.php` 和所有用户文件目录。
4. 恢复上一版 Nginx 路由；必要时将域名根路径重新指向旧入口。
5. 重启 PHP-FPM，执行 `nginx -t` 后重载 Nginx。
6. 验证老 BBS 的登录、读帖、发帖和附件。
7. 只有确认新代码已经写坏旧表数据时，才在维护窗口内恢复数据库备份。

新增的 11 张表是附加结构，旧代码通常不会使用。单纯回滚应用代码时不要仓促删除这些表；保留它们能避免丢失上线期间产生的新数据，也不会妨碍老论坛运行。

## 十六、最终签字清单

- [ ] 已记录 `new-dist` 精确提交号。
- [ ] 已核对数据库脚本来源和 SHA-256。
- [ ] 已完成可恢复的数据库和文件备份。
- [ ] 已在同版本环境完成演练和回滚演练。
- [ ] 11 张新增表全部存在，结构和外键正确。
- [ ] 正式 `config.php` 已补充新配置且权限正确。
- [ ] 档案室位于 Web 根目录外。
- [ ] PHP-FPM、Nginx、CDN 的上传限制一致。
- [ ] 用户上传目录被保留且只有必要目录可写。
- [ ] Nginx 深链回退和敏感文件保护已生效。
- [ ] API、老 BBS 和新论坛均通过命令行检查。
- [ ] 全部功能验收通过。
- [ ] 错误日志、监控和回滚负责人已就绪。
- [ ] SQL、备份、`.git` 和秘密配置不能被 HTTP 访问。
