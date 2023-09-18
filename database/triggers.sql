DELIMITER //
CREATE TRIGGER `userSection_after_insert` AFTER INSERT ON `userSection` FOR EACH ROW
BEGIN
  INSERT INTO `userSection_history` (`FK_idUser`, `FK_idSection`, `action`) VALUES (NEW.`FK_idUser`, NEW.`FK_idSection`, 'INSERT');
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER `userSection_after_update` AFTER UPDATE ON `userSection` FOR EACH ROW
BEGIN
  INSERT INTO `userSection_history` (`FK_idUser`, `FK_idSection`, `action`) VALUES (NEW.`FK_idUser`, NEW.`FK_idSection`, 'UPDATE');
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER `userSection_after_delete` AFTER DELETE ON `userSection` FOR EACH ROW
BEGIN
  INSERT INTO `userSection_history` (`FK_idUser`, `FK_idSection`, `action`) VALUES (OLD.`FK_idUser`, OLD.`FK_idSection`, 'DELETE');
END;
//
DELIMITER ;

DELIMITER //

CREATE TRIGGER `message_after_insert` AFTER INSERT ON `message` FOR EACH ROW
BEGIN
  INSERT INTO `message_history` (`idMessage`, `type`, `content`, `FK_idSection`, `isAlternativeAnswer`, `isActive`, `action`) VALUES (NEW.`idMessage`, NEW.`type`, NEW.`content`, NEW.`FK_idSection`, NEW.`isAlternativeAnswer`, NEW.`isActive`, 'INSERT');
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER `message_after_update` AFTER UPDATE ON `message` FOR EACH ROW
BEGIN
  INSERT INTO `message_history` (`idMessage`, `type`, `content`, `FK_idSection`, `isAlternativeAnswer`, `isActive`, `action`) VALUES (NEW.`idMessage`, NEW.`type`, NEW.`content`, NEW.`FK_idSection`, NEW.`isAlternativeAnswer`, NEW.`isActive`, 'UPDATE');
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER `message_after_delete` AFTER DELETE ON `message` FOR EACH ROW
BEGIN
  INSERT INTO `message_history` (`idMessage`, `type`, `content`, `FK_idSection`, `isAlternativeAnswer`, `isActive`, `action`) VALUES (OLD.`idMessage`, OLD.`type`, OLD.`content`, OLD.`FK_idSection`, OLD.`isAlternativeAnswer`, OLD.`isActive`, 'DELETE');
END;
//
DELIMITER ;
