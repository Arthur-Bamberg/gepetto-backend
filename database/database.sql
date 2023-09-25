-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.25 - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             12.5.0.6677
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for gepetto
CREATE DATABASE IF NOT EXISTS `gepetto` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `gepetto`;

-- Dumping structure for table gepetto.message
CREATE TABLE IF NOT EXISTS `message` (
  `guidMessage` char(32) NOT NULL DEFAULT 'AUTO_INCREMENT',
  `type` enum('PROMPT','ANSWER') NOT NULL,
  `content` varchar(500) NOT NULL,
  `FK_idSection` int(11) unsigned NOT NULL,
  `isAlternativeAnswer` tinyint(1) unsigned NOT NULL,
  `isActive` tinyint(1) unsigned NOT NULL,
  PRIMARY KEY (`guidMessage`) USING BTREE,
  KEY `FK_idSection` (`FK_idSection`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`FK_idSection`) REFERENCES `section` (`idSection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table gepetto.message_history
CREATE TABLE IF NOT EXISTS `message_history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `guidMessage` char(32) NOT NULL DEFAULT '',
  `type` enum('PROMPT','ANSWER') NOT NULL,
  `content` varchar(500) NOT NULL,
  `FK_idSection` int(11) unsigned NOT NULL,
  `isAlternativeAnswer` tinyint(1) unsigned NOT NULL,
  `isActive` tinyint(1) unsigned NOT NULL,
  `action` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table gepetto.section
CREATE TABLE IF NOT EXISTS `section` (
  `idSection` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `temperature` float unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `FK_guidLastMessage` char(32) DEFAULT NULL,
  `isActive` tinyint(1) unsigned NOT NULL,
  PRIMARY KEY (`idSection`),
  KEY `FK_guidLastMessage` (`FK_guidLastMessage`),
  CONSTRAINT `FK_guidLastMessage` FOREIGN KEY (`FK_guidLastMessage`) REFERENCES `message` (`guidMessage`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table gepetto.user
CREATE TABLE IF NOT EXISTS `user` (
  `idUser` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `isActive` tinyint(1) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table gepetto.userSection
CREATE TABLE IF NOT EXISTS `userSection` (
  `FK_idUser` int(11) unsigned NOT NULL,
  `FK_idSection` int(11) unsigned NOT NULL,
  PRIMARY KEY (`FK_idUser`,`FK_idSection`),
  KEY `FK_idSection` (`FK_idSection`),
  CONSTRAINT `userSection_ibfk_1` FOREIGN KEY (`FK_idUser`) REFERENCES `user` (`idUser`),
  CONSTRAINT `userSection_ibfk_2` FOREIGN KEY (`FK_idSection`) REFERENCES `section` (`idSection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table gepetto.userSection_history
CREATE TABLE IF NOT EXISTS `userSection_history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `FK_idUser` int(11) unsigned NOT NULL,
  `FK_idSection` int(11) unsigned NOT NULL,
  `action` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
