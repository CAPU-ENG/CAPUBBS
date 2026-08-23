-- CAPUBBS user-tag schema.
--
-- Timestamps are Unix seconds, matching the existing API tables and PHP
-- time() usage. The API formats them as YYYY-MM-DD for the management UI.
--
-- user_tag_members.username intentionally has no foreign key to userinfo:
-- userinfo is currently MyISAM, while foreign keys require an InnoDB parent.
-- Tag handlers must validate usernames against userinfo before inserting.

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

CREATE TABLE IF NOT EXISTS `user_tag_members` (
  `tag_id` bigint(20) unsigned NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `added_at` bigint(20) unsigned NOT NULL,
  `added_by` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`tag_id`, `username`),
  KEY `idx_user_tag_members_username` (`username`),
  KEY `idx_user_tag_members_tag_added` (`tag_id`, `added_at`, `username`),
  CONSTRAINT `fk_user_tag_members_tag`
    FOREIGN KEY (`tag_id`) REFERENCES `user_tags` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_tag_displays` (
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag_id` bigint(20) unsigned NOT NULL,
  `display_order` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`username`, `tag_id`),
  UNIQUE KEY `uq_user_tag_displays_order` (`username`, `display_order`),
  KEY `idx_user_tag_displays_membership` (`tag_id`, `username`),
  CONSTRAINT `fk_user_tag_displays_membership`
    FOREIGN KEY (`tag_id`, `username`) REFERENCES `user_tag_members` (`tag_id`, `username`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
