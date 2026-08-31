-- CAPUBBS production database extensions.
--
-- Run this file after selecting the production CAPUBBS database. It creates
-- the tables and indexes required by the new forum features and does not drop
-- or overwrite existing tables or data.
--
-- Requirements:
--   - MySQL 5.7 or later.
--   - The existing `season_threads_activity` table must already be present.
--   - The executing account must be allowed to create tables, indexes, and
--     foreign keys.

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------------------------
-- Legacy thread query indexes
-- --------------------------------------------------------------------------

-- Thread detail loads visible nested replies by floor. The legacy table only
-- has an id primary key, which otherwise forces a full-table scan.
SET @capubbs_lzl_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema=DATABASE()
    AND table_name='lzl'
    AND index_name='idx_lzl_fid_visible_id'
);
SET @capubbs_lzl_index_sql = IF(
  @capubbs_lzl_index_exists > 0,
  'SELECT 1',
  'ALTER TABLE `lzl` ADD INDEX `idx_lzl_fid_visible_id` (`fid`,`visible`,`id`)'
);
PREPARE capubbs_lzl_index_statement FROM @capubbs_lzl_index_sql;
EXECUTE capubbs_lzl_index_statement;
DEALLOCATE PREPARE capubbs_lzl_index_statement;

-- --------------------------------------------------------------------------
-- Activity schedule and signup window
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `season_activity_schedule` (
  `activity_id` int(11) NOT NULL,
  `starts_on` date NOT NULL COMMENT '活动开始日期',
  `ends_on` date NOT NULL COMMENT '活动结束日期',
  PRIMARY KEY (`activity_id`),
  KEY `activity_starts_on` (`starts_on`),
  KEY `activity_ends_on` (`ends_on`),
  CONSTRAINT `fk_activity_schedule_activity`
    FOREIGN KEY (`activity_id`) REFERENCES `season_threads_activity` (`activity_id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `season_activity_signup_window` (
  `activity_id` int(11) NOT NULL,
  `starts_at` bigint(20) unsigned NOT NULL COMMENT '报名开始时间，Unix 秒',
  `ends_at` bigint(20) unsigned NOT NULL COMMENT '报名截止时间，Unix 秒',
  PRIMARY KEY (`activity_id`),
  KEY `signup_starts_at` (`starts_at`),
  KEY `signup_ends_at` (`ends_at`),
  CONSTRAINT `fk_signup_window_activity`
    FOREIGN KEY (`activity_id`) REFERENCES `season_threads_activity` (`activity_id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- Archive room
-- --------------------------------------------------------------------------

-- Store only paths relative to CAPUBBS_ARCHIVE_ROOT. Post entries contain a
-- target URL and have no relative path. Timestamps are Unix microseconds.
CREATE TABLE IF NOT EXISTS `archive_entries` (
  `entry_key` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `parent_key` char(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `entry_type` enum('folder','file','post') COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relative_path` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `byte_size` bigint(20) unsigned NOT NULL DEFAULT '0',
  `content_hash` char(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `target_url` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` bigint(20) unsigned NOT NULL,
  `updated_at` bigint(20) unsigned NOT NULL,
  `uploader_userid` int(11) unsigned DEFAULT NULL,
  `uploader_username` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `masked_at` bigint(20) unsigned DEFAULT NULL,
  `masked_by_userid` int(11) unsigned DEFAULT NULL,
  `masked_by_username` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purged_at` bigint(20) unsigned DEFAULT NULL,
  `purged_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`entry_key`),
  KEY `archive_parent_listing` (`parent_key`,`masked_at`,`entry_type`,`name`(120)),
  KEY `archive_path_lookup` (`relative_path`(191)),
  KEY `archive_uploader_lookup` (`uploader_userid`,`created_at`),
  KEY `archive_mask_lookup` (`masked_at`,`purged_at`),
  KEY `archive_content_lookup` (`content_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `archive_downloads` (
  `download_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `entry_key` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `userid` int(11) unsigned NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `downloaded_at` bigint(20) unsigned NOT NULL,
  `ip` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_agent` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `byte_size` bigint(20) unsigned NOT NULL DEFAULT '0',
  `status` enum('started','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'started',
  PRIMARY KEY (`download_id`),
  KEY `archive_download_entry_time` (`entry_key`,`downloaded_at`),
  KEY `archive_download_user_time` (`userid`,`downloaded_at`),
  KEY `archive_download_time` (`downloaded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- Theme-aware floor decoration
-- --------------------------------------------------------------------------

-- `userinfo` is MyISAM, so this table intentionally has no user foreign key.
CREATE TABLE IF NOT EXISTS `user_floor_decoration` (
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `light_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dark_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- User tags
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `user_tags` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` char(7) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `created_at` bigint(20) unsigned NOT NULL,
  `updated_at` bigint(20) unsigned NOT NULL,
  `created_by` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_by` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_tags_name` (`name`),
  KEY `idx_user_tags_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- `userinfo` is MyISAM, so username validity is enforced by the API.
CREATE TABLE IF NOT EXISTS `user_tag_members` (
  `tag_id` bigint(20) unsigned NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `added_at` bigint(20) unsigned NOT NULL,
  `added_by` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`tag_id`,`username`),
  KEY `idx_user_tag_members_username` (`username`),
  KEY `idx_user_tag_members_tag_added` (`tag_id`,`added_at`,`username`),
  CONSTRAINT `fk_user_tag_members_tag`
    FOREIGN KEY (`tag_id`) REFERENCES `user_tags` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_tag_displays` (
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag_id` bigint(20) unsigned NOT NULL,
  `display_order` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`username`,`tag_id`),
  UNIQUE KEY `uq_user_tag_displays_order` (`username`,`display_order`),
  KEY `idx_user_tag_displays_membership` (`tag_id`,`username`),
  CONSTRAINT `fk_user_tag_displays_membership`
    FOREIGN KEY (`tag_id`,`username`)
    REFERENCES `user_tag_members` (`tag_id`,`username`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- User medals
-- --------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `user_medals` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `texture_id` varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `large_image_path` varchar(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `small_image_path` varchar(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `created_at` bigint(20) unsigned NOT NULL,
  `updated_at` bigint(20) unsigned NOT NULL,
  `created_by` varchar(30) COLLATE utf8mb4_bin NOT NULL,
  `updated_by` varchar(30) COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_medals_updated` (`updated_at`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- `userinfo` is MyISAM, so username validity is enforced by the API.
CREATE TABLE IF NOT EXISTS `user_medal_members` (
  `medal_id` bigint(20) unsigned NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_bin NOT NULL,
  `activity_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `awarded_at` bigint(20) unsigned NOT NULL,
  `awarded_by` varchar(30) COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`medal_id`,`username`),
  KEY `idx_user_medal_members_user_awarded` (`username`,`awarded_at`,`medal_id`),
  KEY `idx_user_medal_members_medal_awarded` (`medal_id`,`awarded_at`,`username`),
  CONSTRAINT `fk_user_medal_members_medal`
    FOREIGN KEY (`medal_id`) REFERENCES `user_medals` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_medal_displays` (
  `username` varchar(30) COLLATE utf8mb4_bin NOT NULL,
  `medal_id` bigint(20) unsigned NOT NULL,
  `state` enum('display','retain','hidden') CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'retain',
  `updated_at` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`username`,`medal_id`),
  KEY `idx_user_medal_displays_state` (`username`,`state`,`medal_id`),
  KEY `idx_user_medal_displays_membership` (`medal_id`,`username`),
  CONSTRAINT `fk_user_medal_displays_membership`
    FOREIGN KEY (`medal_id`,`username`)
    REFERENCES `user_medal_members` (`medal_id`,`username`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
