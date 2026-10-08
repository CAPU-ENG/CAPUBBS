<?php
/**
 * Configuration for CAPUBBS.
 *
 * You need to copy this file to `config.php` to make it work.
 *
 * This file contains the following configrations:
 *
 * - MySQL settings.
 *
 * Reference:
 * - https://github.com/WordPress/WordPress/blob/master/wp-config-sample.php
 */

//** MySQL settings. **//

/** Do not expose PHP warnings, deprecations, or stack details in HTTP responses. */
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('log_errors', '1');

/** The database username. */
define('CAPUBBS_DB_USERNAME', 'database_username_here');

/** The database password. */
define('CAPUBBS_DB_PASSWORD', 'database_password_here');

/** The database hostname. */
define('CAPUBBS_DB_HOSTNAME', 'localhost');

/**
 * Primary host name.  Change to 'chexie.net' in production.
 * All API URLs and cookie domains are derived from this value.
 */
define('CAPUBBS_HOST', 'localhost');

/** 管理员联系方式 */
define('ADMIN_EMAIL', 'admin@example.com');

/** oss地址 */
// define('OSS_ADDRESS', '');
define('OSS_ADDRESS', 'https://example.oss-cn-beijing.aliyuncs.com');

/** CDN 地址（留空则不启用 CDN 重写，如 https://cdn.chexie.net） */
define('CAPUBBS_CDN_URL', '');

/**
 * 对象存储（腾讯云 COS，见 storage.php）。未定义或为 'local' 时与原来完全一致。
 * 设为 'cos' 时：上传仍先保存到本地目录，再同步写入 COS（失败则本次上传失败）；附件与档案室下载改为跳转到短时签名链接。
 * 图片的读取由 Web 服务器把 /bbs/images、/bbsimg 等路径重定向到 COS，旧论坛帖子图片可同时设置 CAPUBBS_CDN_URL 为 COS 地址。
 */
// define('CAPUBBS_STORAGE', 'cos');
// define('CAPUBBS_COS_BUCKET', 'examplebucket-1250000000');
// define('CAPUBBS_COS_REGION', 'ap-beijing');
// define('CAPUBBS_COS_SECRET_ID', '');
// define('CAPUBBS_COS_SECRET_KEY', '');
// define('CAPUBBS_COS_PUBLIC_BASE', '');       // 留空则为 https://<bucket>.cos.<region>.myqcloud.com
// define('CAPUBBS_COS_KEY_PREFIX', '');        // 本地测试可用 'dev/'
// define('CAPUBBS_COS_SIGNED_URL_TTL', 600);   // 签名下载链接有效期（秒）

/** 移动端浏览器推荐弹窗的下载链接。 */
define('CAPUBBS_BROWSER_DOWNLOAD_URL', 'https://frostember.lanzoup.com/b00oe4ba4j');

/** 档案室物理根目录：本地可使用 __DIR__ . '/pan'，生产环境应放在 Web 根目录之外。 */
define('CAPUBBS_ARCHIVE_ROOT', __DIR__ . '/pan');

/** 档案项 ID 哈希密钥：生产环境请替换为独立随机值。 */
define('CAPUBBS_ARCHIVE_ID_SECRET', 'replace-with-a-random-archive-id-secret');

/** 档案室单个文件最大大小：500 MiB。 */
define('CAPUBBS_ARCHIVE_MAX_BYTES', 500 * 1024 * 1024);

// ========== 邮箱认证体系功能开关 ==========

// 邮箱验证功能总开关（前后端）。关闭后不强制PKU邮箱、不显示验证UI、sendVerifyCode/verifyEmail API 拒绝服务
define('CAPUBBS_ENABLE_EMAIL_VERIFY', true);

// 邮箱禁言管理开关（管理后台）。关闭后隐藏管理页面入口、muteEmail/unmuteEmail API 拒绝服务
// 注意：关闭此开关后已存在的禁言记录仍然有效（已禁言的仍然维持禁言）
define('CAPUBBS_ENABLE_EMAIL_MUTE', true);

// 发帖权限控制开关（前后端）。关闭后跳过所有禁言检查，用户无论是否验证都能发帖
define('CAPUBBS_ENABLE_POST_CONTROL', true);

// ========== SMTP 邮件配置 ==========

define('CAPUBBS_SMTP_SERVER', 'smtpdm.aliyun.com');
define('CAPUBBS_SMTP_PORT', 465);
define('CAPUBBS_SMTP_USER', 'your_smtp_user@example.com');
define('CAPUBBS_SMTP_PASS', 'your_smtp_password_here');
define('CAPUBBS_SMTP_FROM_NAME', 'CAPUBBS');
define('CAPUBBS_VERIFY_CODE_EXPIRE', 10);
