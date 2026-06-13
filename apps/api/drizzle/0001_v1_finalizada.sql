SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `roles` ADD `updated_at` timestamp NOT NULL DEFAULT (now())', 'SELECT 1') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'roles' AND column_name = 'updated_at');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `permissions` ADD `is_system` boolean NOT NULL DEFAULT false', 'SELECT 1') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'permissions' AND column_name = 'is_system');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `permissions` ADD `is_active` boolean NOT NULL DEFAULT true', 'SELECT 1') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'permissions' AND column_name = 'is_active');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `permissions` ADD `updated_at` timestamp NOT NULL DEFAULT (now())', 'SELECT 1') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'permissions' AND column_name = 'updated_at');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD `refresh_token_hash` varchar(255) NOT NULL', 'SELECT 1') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'refresh_token_hash');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD `rotated_at` timestamp', 'SELECT 1') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'rotated_at');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `user_sessions` ADD `revoked_reason` varchar(100)', 'SELECT 1') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND column_name = 'revoked_reason');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
UPDATE `user_sessions` SET `refresh_token_hash` = CONCAT('legacy:', `id`), `revoked_at` = COALESCE(`revoked_at`, now()), `revoked_reason` = COALESCE(`revoked_reason`, 'legacy_session') WHERE `refresh_token_hash` = '';--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE UNIQUE INDEX `user_sessions_refresh_token_hash_idx` ON `user_sessions` (`refresh_token_hash`)', 'SELECT 1') FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'user_sessions' AND index_name = 'user_sessions_refresh_token_hash_idx');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(36) NOT NULL,
  `actor_user_id` varchar(36),
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` varchar(36),
  `metadata` json NOT NULL,
  `ip` varchar(100),
  `user_agent` varchar(500),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_user_id_users_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action', 'SELECT 1') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND constraint_name = 'audit_logs_actor_user_id_users_id_fk');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX `audit_logs_actor_idx` ON `audit_logs` (`actor_user_id`)', 'SELECT 1') FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND index_name = 'audit_logs_actor_idx');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`)', 'SELECT 1') FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND index_name = 'audit_logs_entity_idx');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;--> statement-breakpoint
SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`)', 'SELECT 1') FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND index_name = 'audit_logs_action_idx');--> statement-breakpoint
PREPARE stmt FROM @sql;--> statement-breakpoint
EXECUTE stmt;--> statement-breakpoint
DEALLOCATE PREPARE stmt;
