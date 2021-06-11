create table IF NOT EXISTS `t_fateboard_user`(
    `user_id` bigint(20) not null auto_increment COMMENT 'primary key',
    `name` varchar(128) NOT NULL UNIQUE COMMENT 'user name for cloud manager',
    `password` varchar(256) NOT NULL COMMENT 'password for user',
    `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '1 vaild, 2 deleted',
    `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP  COMMENT 'Create Time',
    `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON update CURRENT_TIMESTAMP COMMENT 'Update Time',
    PRIMARY KEY(`user_id`)
)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE='utf8_general_ci' COMMENT='fateboard user information';
