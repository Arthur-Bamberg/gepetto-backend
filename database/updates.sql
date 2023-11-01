ALTER TABLE `message`
	CHANGE COLUMN `content` `content` VARCHAR(10000) NOT NULL COLLATE 'utf8mb4_general_ci' AFTER `type`;

ALTER TABLE `message_history`
	CHANGE COLUMN `content` `content` VARCHAR(10000) NOT NULL COLLATE 'utf8mb4_general_ci' AFTER `type`;