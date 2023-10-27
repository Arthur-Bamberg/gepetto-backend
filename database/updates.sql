ALTER TABLE `message`
	CHANGE COLUMN `content` `content` VARCHAR(3000) NOT NULL COLLATE 'utf8mb4_0900_ai_ci' AFTER `type`;