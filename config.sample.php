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
