CREATE SCHEMA `weixin` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ;

CREATE TABLE `weixin`.`ticket` ( `id` INT(10) NOT NULL, `access_token` VARCHAR(600) NULL, `expires` VARCHAR(100) NULL, `jsapi_ticket` VARCHAR(600) NULL, PRIMARY KEY (`id`));