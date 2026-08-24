-- CAPUBBS floor-decoration schema.
--
-- A missing path disables the decoration for that theme. userinfo is MyISAM,
-- so this table intentionally does not declare a foreign key.

CREATE TABLE IF NOT EXISTS `user_floor_decoration` (
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `light_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dark_image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
