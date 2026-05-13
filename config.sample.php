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
