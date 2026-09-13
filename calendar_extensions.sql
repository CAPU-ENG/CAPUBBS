-- Run once before deploying the calendar API changes. Keeps existing data and engine.
ALTER TABLE `capubbs`.`calendar`
  ADD COLUMN `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ADD COLUMN `url` VARCHAR(2048) DEFAULT NULL,
  ADD COLUMN `end` DATETIME DEFAULT NULL,
  ADD PRIMARY KEY (`id`);
