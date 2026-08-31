-- MySQL dump 10.13  Distrib 5.7.23, for Linux (x86_64)
--
-- Host: localhost    Database: capubbs
-- ------------------------------------------------------
-- Server version       5.7.23-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_join_remind`
--

DROP TABLE IF EXISTS `activity_join_remind`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_join_remind` (
  `activity_id` int(11) NOT NULL,
  `text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int(11) NOT NULL,
  `uploader` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `ref` int(11) NOT NULL DEFAULT '0',
  `count` int(11) NOT NULL DEFAULT '0',
  `price` int(11) NOT NULL,
  `auth` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=689 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `boardinfo`
--

DROP TABLE IF EXISTS `boardinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `boardinfo` (
  `bid` tinyint(4) NOT NULL,
  `name` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bbstitle` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hide` tinyint(4) NOT NULL DEFAULT '0',
  `m1` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `m2` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `m3` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `m4` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `need` tinyint(4) DEFAULT NULL,
  KEY `bid` (`bid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `borrow`
--

DROP TABLE IF EXISTS `borrow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `borrow` (
  `number` int(11) NOT NULL AUTO_INCREMENT,
  `type` tinyint(4) NOT NULL,
  `id` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sex` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(13) COLLATE utf8mb4_unicode_ci NOT NULL,
  `height` int(11) DEFAULT NULL,
  `bike` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condition` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `length` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hint` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` bigint(20) NOT NULL,
  `state` tinyint(4) NOT NULL,
  PRIMARY KEY (`number`),
  KEY `type` (`type`,`id`,`state`)
) ENGINE=MyISAM AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci PACK_KEYS=0;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `calendar`
--

DROP TABLE IF EXISTS `calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calendar` (
  `year` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `day` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `captcha_codes`
--

DROP TABLE IF EXISTS `captcha_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `captcha_codes` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `namespace` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_display` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` int(11) NOT NULL,
  PRIMARY KEY (`id`,`namespace`),
  KEY `created` (`created`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `codes`
--

DROP TABLE IF EXISTS `codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `codes` (
  `id` int(11) NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `times` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_2` (`code`),
  KEY `code` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `downloads`
--

DROP TABLE IF EXISTS `downloads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `downloads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `times` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lzl`
--

DROP TABLE IF EXISTS `lzl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lzl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fid` int(11) NOT NULL,
  `author` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` int(11) NOT NULL,
  `visible` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_lzl_fid_visible_id` (`fid`,`visible`,`id`)
) ENGINE=MyISAM AUTO_INCREMENT=185500 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mainpage`
--

DROP TABLE IF EXISTS `mainpage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mainpage` (
  `number` int(11) NOT NULL AUTO_INCREMENT,
  `id` tinyint(4) NOT NULL,
  `field1` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `field2` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `field3` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `field4` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `field5` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`number`)
) ENGINE=MyISAM AUTO_INCREMENT=1966 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci PACK_KEYS=0;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receiver` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` int(11) NOT NULL,
  `hasread` int(11) NOT NULL DEFAULT '0',
  `rbid` int(11) NOT NULL,
  `rtid` int(11) NOT NULL,
  `rpid` int(11) NOT NULL,
  `ruser` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `rmsg` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `receiver` (`receiver`,`sender`)
) ENGINE=MyISAM AUTO_INCREMENT=498305 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `null`
--

DROP TABLE IF EXISTS `null`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `null` (
  `number` int(11) NOT NULL AUTO_INCREMENT,
  `bid` tinyint(4) NOT NULL,
  `tid` int(11) NOT NULL,
  `pid` int(11) NOT NULL,
  `title` text,
  `text` longtext,
  `author` varchar(50) NOT NULL,
  `deleter` varchar(50) NOT NULL,
  `replytime` bigint(20) NOT NULL,
  `updatetime` bigint(20) NOT NULL,
  `deletetime` bigint(20) NOT NULL,
  `replyip` varchar(20) NOT NULL,
  `deleteip` varchar(20) NOT NULL,
  PRIMARY KEY (`number`,`bid`,`tid`,`pid`)
) ENGINE=MyISAM AUTO_INCREMENT=9949 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `bid` tinyint(4) NOT NULL,
  `tid` int(11) NOT NULL,
  `pid` int(11) NOT NULL,
  `fid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` text COLLATE utf8mb4_unicode_ci,
  `author` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` longtext COLLATE utf8mb4_unicode_ci,
  `ishtml` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachs` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `replytime` bigint(20) DEFAULT NULL,
  `updatetime` bigint(20) DEFAULT NULL,
  `sig` tinyint(4) DEFAULT NULL,
  `type` text COLLATE utf8mb4_unicode_ci,
  `ip` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lzl` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`fid`),
  UNIQUE KEY `unique_btp_id` (`bid`,`tid`,`pid`),
  KEY `bid` (`bid`),
  KEY `tid` (`tid`),
  KEY `fid` (`fid`),
  KEY `updatetime` (`updatetime`),
  KEY `replytime` (`replytime`),
  KEY `author` (`author`),
  KEY `pid` (`pid`)
) ENGINE=MyISAM AUTO_INCREMENT=604767 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `punishment`
--

DROP TABLE IF EXISTS `punishment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `punishment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distance` int(11) NOT NULL,
  `addition` tinyint(4) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_end` tinyint(4) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=203 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `punishment_test`
--

DROP TABLE IF EXISTS `punishment_test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `punishment_test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distance` int(11) NOT NULL,
  `addition` tinyint(4) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_end` tinyint(4) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=440 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season`
--

DROP TABLE IF EXISTS `season`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season` (
  `season_id` int(11) NOT NULL AUTO_INCREMENT,
  `year` int(11) NOT NULL,
  `is_spring` tinyint(4) NOT NULL,
  `comments` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`season_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season_activity_join`
--

DROP TABLE IF EXISTS `season_activity_join`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season_activity_join` (
  `join_id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_id` int(11) NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_fid` int(11) NOT NULL,
  `cancel` tinyint(4) NOT NULL DEFAULT '0',
  `attendance` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`join_id`),
  UNIQUE KEY `unique_join` (`activity_id`,`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4514 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season_activity_option`
--

DROP TABLE IF EXISTS `season_activity_option`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season_activity_option` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `option_name` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `required` tinyint(4) NOT NULL,
  `hiden` tinyint(4) NOT NULL DEFAULT '0',
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=954 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season_join_option_value`
--

DROP TABLE IF EXISTS `season_join_option_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season_join_option_value` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `join_id` int(11) NOT NULL,
  `option_id` int(11) NOT NULL,
  `value` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49927 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season_leader`
--

DROP TABLE IF EXISTS `season_leader`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season_leader` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `season_id` int(11) NOT NULL DEFAULT '-1',
  `leader_username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season_option_case`
--

DROP TABLE IF EXISTS `season_option_case`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season_option_case` (
  `case_id` int(11) NOT NULL AUTO_INCREMENT,
  `option_id` int(11) NOT NULL,
  `case_name` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `need_value` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`case_id`),
  KEY `option_id` (`option_id`)
) ENGINE=InnoDB AUTO_INCREMENT=588 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season_option_type`
--

DROP TABLE IF EXISTS `season_option_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season_option_type` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `type_id_UNIQUE` (`type_id`),
  UNIQUE KEY `type_name_UNIQUE` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season_threads_activity`
--

DROP TABLE IF EXISTS `season_threads_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season_threads_activity` (
  `activity_id` int(11) NOT NULL AUTO_INCREMENT,
  `bid` int(11) NOT NULL,
  `tid` int(11) NOT NULL,
  `season_id` int(11) NOT NULL DEFAULT '-1',
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `leader_username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`activity_id`),
  UNIQUE KEY `unique_thread_activity` (`bid`,`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season_activity_schedule`
--

DROP TABLE IF EXISTS `season_activity_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season_activity_schedule` (
  `activity_id` int(11) NOT NULL,
  `starts_on` date NOT NULL COMMENT '活动开始日期',
  `ends_on` date NOT NULL COMMENT '活动结束日期',
  PRIMARY KEY (`activity_id`),
  KEY `activity_starts_on` (`starts_on`),
  KEY `activity_ends_on` (`ends_on`),
  CONSTRAINT `fk_activity_schedule_activity` FOREIGN KEY (`activity_id`) REFERENCES `season_threads_activity` (`activity_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `season_activity_signup_window`
--

DROP TABLE IF EXISTS `season_activity_signup_window`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `season_activity_signup_window` (
  `activity_id` int(11) NOT NULL,
  `starts_at` bigint(20) unsigned NOT NULL COMMENT '报名开始时间，Unix 秒',
  `ends_at` bigint(20) unsigned NOT NULL COMMENT '报名截止时间，Unix 秒',
  PRIMARY KEY (`activity_id`),
  KEY `signup_starts_at` (`starts_at`),
  KEY `signup_ends_at` (`ends_at`),
  CONSTRAINT `fk_signup_window_activity` FOREIGN KEY (`activity_id`) REFERENCES `season_threads_activity` (`activity_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sign`
--

DROP TABLE IF EXISTS `sign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sign` (
  `year` int(11) NOT NULL,
  `month` tinyint(4) NOT NULL,
  `day` tinyint(4) NOT NULL,
  `hour` tinyint(4) NOT NULL,
  `minute` tinyint(4) NOT NULL,
  `second` tinyint(4) NOT NULL,
  `week` tinyint(4) NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  KEY `username` (`username`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sms`
--

DROP TABLE IF EXISTS `sms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms` (
  `number` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(13) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  PRIMARY KEY (`number`)
) ENGINE=MyISAM AUTO_INCREMENT=226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test`
--

DROP TABLE IF EXISTS `test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `test` (
  `id` int(11) NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='此表仅供学习sql的时候测试使用。';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test2`
--

DROP TABLE IF EXISTS `test2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `test2` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FirstName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `City` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test3`
--

DROP TABLE IF EXISTS `test3`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `test3` (
  `bid` tinyint(4) NOT NULL,
  `tid` int(11) NOT NULL,
  `pid` int(11) NOT NULL,
  `fid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`fid`),
  UNIQUE KEY `bid` (`bid`,`tid`,`fid`),
  UNIQUE KEY `bid_2` (`bid`,`tid`,`pid`)
) ENGINE=MyISAM AUTO_INCREMENT=1000008 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `thread_global_top`
--

DROP TABLE IF EXISTS `thread_global_top`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `thread_global_top` (
  `bid` int(11) NOT NULL,
  `tid` int(11) NOT NULL,
  PRIMARY KEY (`bid`,`tid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `threads`
--

DROP TABLE IF EXISTS `threads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `threads` (
  `bid` tinyint(4) NOT NULL,
  `tid` int(11) NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci,
  `author` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `replyer` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `click` int(11) DEFAULT NULL,
  `reply` int(11) DEFAULT NULL,
  `guesture` tinyint(4) DEFAULT NULL,
  `extr` tinyint(4) DEFAULT NULL,
  `top` tinyint(4) DEFAULT NULL,
  `locked` tinyint(4) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `postdate` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  UNIQUE KEY `unique_thread_per_board` (`bid`,`tid`),
  KEY `bid` (`bid`),
  KEY `postdate` (`postdate`),
  KEY `extr` (`extr`),
  KEY `tid` (`tid`),
  KEY `timestamp` (`timestamp`),
  KEY `top` (`top`),
  KEY `author` (`author`),
  KEY `top_2` (`top`,`timestamp`),
  KEY `bid_2` (`bid`,`extr`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userinfo`
--

DROP TABLE IF EXISTS `userinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userinfo` (
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokentime` bigint(20) unsigned DEFAULT NULL,
  `sex` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` text COLLATE utf8mb4_unicode_ci,
  `intro` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sig1` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sig2` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sig3` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hobby` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qq` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mail` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `place` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `regdate` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastdate` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastip` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `star` smallint(3) unsigned DEFAULT NULL,
  `score` int(11) NOT NULL DEFAULT '0',
  `post` smallint(5) unsigned DEFAULT NULL,
  `reply` smallint(5) unsigned DEFAULT NULL,
  `water` smallint(5) unsigned DEFAULT NULL,
  `sign` smallint(5) unsigned DEFAULT NULL,
  `rights` tinyint(4) unsigned DEFAULT NULL,
  `newmsg` tinyint(3) unsigned DEFAULT NULL,
  `extr` tinyint(3) unsigned DEFAULT NULL,
  `lastpost` text COLLATE utf8mb4_unicode_ci,
  `nowboard` smallint(6) DEFAULT NULL,
  `onlinetype` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logininfo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other2` text COLLATE utf8mb4_unicode_ci,
  `other3` text COLLATE utf8mb4_unicode_ci,
  `other4` text COLLATE utf8mb4_unicode_ci,
  `other5` text COLLATE utf8mb4_unicode_ci,
  `other6` text COLLATE utf8mb4_unicode_ci,
  `userid` int(11) NOT NULL AUTO_INCREMENT,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_visible` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`userid`),
  UNIQUE KEY `unique_username` (`username`),
  KEY `token` (`token`),
  KEY `mail_verified` (`mail`,`verified`),
  FULLTEXT KEY `username_2` (`username`)
) ENGINE=MyISAM AUTO_INCREMENT=14963 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `username_lastip`
--

DROP TABLE IF EXISTS `username_lastip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `username_lastip` (
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastip` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`username`,`lastip`),
  KEY `lastip` (`lastip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- API-derived table structures
--
-- The following tables were inferred from the complete set of API SQL reads
-- and writes.  They intentionally avoid foreign keys because several parent
-- tables use MyISAM and because trash/history rows must survive parent deletion.
--

--
-- Table structure for table `email_mutes`
--

DROP TABLE IF EXISTS `email_mutes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_mutes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `muted_by` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `created_at` bigint(20) unsigned NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `active_created_at` (`active`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_verification`
--

DROP TABLE IF EXISTS `email_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_verification` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` bigint(20) unsigned NOT NULL,
  `expires_at` bigint(20) unsigned NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `email_code_lookup` (`email`,`type`,`code`,`used`,`id`),
  KEY `username_code_lookup` (`username`,`type`,`code`,`used`,`id`),
  KEY `email_rate_limit` (`email`,`type`,`created_at`),
  KEY `username_rate_limit` (`username`,`email`,`type`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favorites` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bid` tinyint(4) NOT NULL,
  `tid` int(11) NOT NULL,
  `timestamp` bigint(20) unsigned NOT NULL,
  `last_read_time` bigint(20) unsigned NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_thread` (`username`,`bid`,`tid`),
  KEY `thread_favorites` (`bid`,`tid`),
  KEY `user_time` (`username`,`timestamp`),
  KEY `user_sort` (`username`,`sort_order`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_edit_history`
--

DROP TABLE IF EXISTS `post_edit_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_edit_history` (
  `version_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `fid` int(10) unsigned NOT NULL,
  `bid` tinyint(4) NOT NULL,
  `tid` int(11) NOT NULL,
  `pid` int(11) NOT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `author` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'edit',
  `edit_time` bigint(20) unsigned NOT NULL,
  `edit_by` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `edit_ip` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`version_id`),
  KEY `fid_version` (`fid`,`version_id`),
  KEY `fid_editor_version` (`fid`,`edit_by`,`version_id`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trash_posts`
--

DROP TABLE IF EXISTS `trash_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trash_posts` (
  `trash_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bid` tinyint(4) NOT NULL,
  `tid` int(11) NOT NULL,
  `pid` int(11) NOT NULL,
  `fid` int(10) unsigned NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci,
  `author` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` longtext COLLATE utf8mb4_unicode_ci,
  `ishtml` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachs` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `replytime` bigint(20) DEFAULT NULL,
  `updatetime` bigint(20) DEFAULT NULL,
  `sig` tinyint(4) DEFAULT NULL,
  `type` text COLLATE utf8mb4_unicode_ci,
  `ip` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lzl` int(11) NOT NULL DEFAULT '0',
  `deleter` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deletetime` bigint(20) unsigned NOT NULL,
  `deleteip` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`trash_id`),
  KEY `thread_post` (`bid`,`tid`,`pid`),
  KEY `fid` (`fid`),
  KEY `board_deleted` (`bid`,`deletetime`),
  KEY `deletetime` (`deletetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trash_threads`
--

DROP TABLE IF EXISTS `trash_threads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trash_threads` (
  `trash_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bid` tinyint(4) NOT NULL,
  `tid` int(11) NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci,
  `author` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `replyer` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `click` int(11) DEFAULT NULL,
  `reply` int(11) DEFAULT NULL,
  `guesture` tinyint(4) DEFAULT NULL,
  `extr` tinyint(4) DEFAULT NULL,
  `top` tinyint(4) DEFAULT NULL,
  `locked` tinyint(4) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `postdate` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleter` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deletetime` bigint(20) unsigned NOT NULL,
  `deleteip` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`trash_id`),
  UNIQUE KEY `unique_thread_per_board` (`bid`,`tid`),
  KEY `board_deleted` (`bid`,`deletetime`),
  KEY `deletetime` (`deletetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_sig`
--

DROP TABLE IF EXISTS `user_sig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_sig` (
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sig_num` tinyint(3) unsigned NOT NULL,
  `sig` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `sig_type` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'null',
  PRIMARY KEY (`username`,`sig_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `username_view`
--

DROP TABLE IF EXISTS `username_view`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `username_view` (
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `date` date NOT NULL,
  `bid` tinyint(4) NOT NULL,
  `tid` int(11) NOT NULL,
  `ip` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`username`,`date`,`bid`,`tid`,`ip`),
  KEY `thread_date` (`bid`,`tid`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-08  1:21:54
