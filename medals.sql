-- CAPUBBS user-medal schema.
--
-- Timestamps are Unix seconds, matching the existing API tables and PHP
-- time() usage. Image paths are generated and owned by the medal API. Each
-- medal stores a large image below 1 MiB and a small image below 64 KiB.
--
-- Username columns intentionally have no foreign key to userinfo: userinfo is
-- currently MyISAM, while foreign keys require an InnoDB parent. Medal handlers
-- must validate usernames with a case-sensitive lookup before inserting.

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
  KEY `idx_user_medals_updated` (`updated_at`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_medal_members` (
  `medal_id` bigint(20) unsigned NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_bin NOT NULL,
  `activity_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `awarded_at` bigint(20) unsigned NOT NULL,
  `awarded_by` varchar(30) COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`medal_id`, `username`),
  KEY `idx_user_medal_members_user_awarded` (`username`, `awarded_at`, `medal_id`),
  KEY `idx_user_medal_members_medal_awarded` (`medal_id`, `awarded_at`, `username`),
  CONSTRAINT `fk_user_medal_members_medal`
    FOREIGN KEY (`medal_id`) REFERENCES `user_medals` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Every medal membership receives one display row. The API creates new rows
-- as retain, limits display to at most three medals per user, and sorts all
-- presentation modes by user_medal_members.awarded_at rather than user order.
--
-- display: shown on floors, hover cards, and personal profiles
-- retain:  shown only on personal profiles
-- hidden:  not shown on floors, hover cards, or personal profiles
CREATE TABLE IF NOT EXISTS `user_medal_displays` (
  `username` varchar(30) COLLATE utf8mb4_bin NOT NULL,
  `medal_id` bigint(20) unsigned NOT NULL,
  `state` enum('display','retain','hidden') CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'retain',
  `updated_at` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`username`, `medal_id`),
  KEY `idx_user_medal_displays_state` (`username`, `state`, `medal_id`),
  KEY `idx_user_medal_displays_membership` (`medal_id`, `username`),
  CONSTRAINT `fk_user_medal_displays_membership`
    FOREIGN KEY (`medal_id`, `username`) REFERENCES `user_medal_members` (`medal_id`, `username`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
