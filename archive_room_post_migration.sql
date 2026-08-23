-- Add post links to an existing CAPUBBS archive room installation.

ALTER TABLE `archive_entries`
  MODIFY COLUMN `entry_type` enum('folder','file','post') COLLATE utf8mb4_unicode_ci NOT NULL,
  MODIFY COLUMN `relative_path` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ADD COLUMN `target_url` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `content_hash`;
