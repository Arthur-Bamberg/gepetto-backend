-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.27-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.4.0.6659
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
CREATE DATABASE IF NOT EXISTS `gepetto` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `gepetto`;

-- Dumping structure for table gepetto.JWT
CREATE TABLE IF NOT EXISTS `JWT` (
  `idJWT` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `FK_idUser` int(11) unsigned NOT NULL,
  `hashToken` varchar(255) NOT NULL,
  `deviceId` varchar(255) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isExpired` tinyint(4) unsigned NOT NULL,
  PRIMARY KEY (`idJWT`),
  KEY `FK_User_JWT` (`FK_idUser`),
  CONSTRAINT `FK_User_JWT` FOREIGN KEY (`FK_idUser`) REFERENCES `user` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table gepetto.JWT: ~0 rows (approximately)

-- Dumping structure for table gepetto.message
CREATE TABLE IF NOT EXISTS `message` (
  `idMessage` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('PROMPT','ANSWER') NOT NULL,
  `content` varchar(500) NOT NULL,
  `FK_idSection` int(11) unsigned NOT NULL,
  `isAlternativeAnswer` tinyint(1) unsigned NOT NULL,
  `isActive` tinyint(1) unsigned NOT NULL,
  PRIMARY KEY (`idMessage`),
  KEY `FK_idSection` (`FK_idSection`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`FK_idSection`) REFERENCES `section` (`idSection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table gepetto.message: ~0 rows (approximately)

-- Dumping structure for table gepetto.section
CREATE TABLE IF NOT EXISTS `section` (
  `idSection` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `temperature` float unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `FK_idLastMessage` int(11) unsigned DEFAULT NULL,
  `isActive` tinyint(1) unsigned NOT NULL,
  PRIMARY KEY (`idSection`),
  KEY `FK_idLastMessage` (`FK_idLastMessage`),
  CONSTRAINT `section_ibfk_1` FOREIGN KEY (`FK_idLastMessage`) REFERENCES `message` (`idMessage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table gepetto.section: ~0 rows (approximately)

-- Dumping structure for table gepetto.user
CREATE TABLE IF NOT EXISTS `user` (
  `idUser` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `isActive` tinyint(1) unsigned NOT NULL,
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table gepetto.user: ~0 rows (approximately)

-- Dumping structure for table gepetto.userSection
CREATE TABLE IF NOT EXISTS `userSection` (
  `FK_idUser` int(11) unsigned NOT NULL,
  `FK_idSection` int(11) unsigned NOT NULL,
  PRIMARY KEY (`FK_idUser`,`FK_idSection`),
  KEY `FK_idSection` (`FK_idSection`),
  CONSTRAINT `userSection_ibfk_1` FOREIGN KEY (`FK_idUser`) REFERENCES `user` (`idUser`),
  CONSTRAINT `userSection_ibfk_2` FOREIGN KEY (`FK_idSection`) REFERENCES `section` (`idSection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table gepetto.userSection: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
