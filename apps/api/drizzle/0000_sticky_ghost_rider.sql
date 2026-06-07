CREATE TABLE `document_events` (
	`id` varchar(36) NOT NULL,
	`document_id` varchar(36) NOT NULL,
	`event_type` varchar(80) NOT NULL,
	`from_status_id` varchar(36),
	`to_status_id` varchar(36),
	`note` text,
	`metadata` json NOT NULL DEFAULT ('{}'),
	`created_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_statuses` (
	`id` varchar(36) NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` varchar(255),
	`sort_order` int NOT NULL,
	`is_terminal` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_statuses_id` PRIMARY KEY(`id`),
	CONSTRAINT `document_statuses_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `document_types` (
	`id` varchar(36) NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `document_types_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` varchar(36) NOT NULL,
	`office_number` varchar(100) NOT NULL,
	`case_number` varchar(100),
	`actor` varchar(255),
	`defendant` varchar(255),
	`document_type_id` varchar(36) NOT NULL,
	`office_date` date,
	`received_date` date NOT NULL,
	`annexes` text,
	`physical_location_id` varchar(36),
	`current_status_id` varchar(36) NOT NULL,
	`observations` text,
	`created_by` varchar(36) NOT NULL,
	`updated_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `documents_office_number_unique_idx` UNIQUE(`office_number`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(36) NOT NULL,
	`code` varchar(100) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `physical_locations` (
	`id` varchar(36) NOT NULL,
	`name` varchar(150) NOT NULL,
	`drawer` varchar(100),
	`reference` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `physical_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`last_activity_at` timestamp NOT NULL,
	`revoked_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by_ip` varchar(100),
	`user_agent` varchar(500),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_sessions_token_hash_idx` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` varchar(80) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`full_name` varchar(150) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`must_change_password` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_by_user_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_idx` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `document_events` ADD CONSTRAINT `document_events_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_events` ADD CONSTRAINT `document_events_from_status_id_document_statuses_id_fk` FOREIGN KEY (`from_status_id`) REFERENCES `document_statuses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_events` ADD CONSTRAINT `document_events_to_status_id_document_statuses_id_fk` FOREIGN KEY (`to_status_id`) REFERENCES `document_statuses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_events` ADD CONSTRAINT `document_events_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_document_type_id_document_types_id_fk` FOREIGN KEY (`document_type_id`) REFERENCES `document_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_physical_location_id_physical_locations_id_fk` FOREIGN KEY (`physical_location_id`) REFERENCES `physical_locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_current_status_id_document_statuses_id_fk` FOREIGN KEY (`current_status_id`) REFERENCES `document_statuses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `document_events_document_idx` ON `document_events` (`document_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `document_events_type_idx` ON `document_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `documents_office_number_idx` ON `documents` (`office_number`);--> statement-breakpoint
CREATE INDEX `documents_case_number_idx` ON `documents` (`case_number`);--> statement-breakpoint
CREATE INDEX `documents_received_date_idx` ON `documents` (`received_date`);--> statement-breakpoint
CREATE INDEX `documents_status_idx` ON `documents` (`current_status_id`);--> statement-breakpoint
CREATE INDEX `documents_type_idx` ON `documents` (`document_type_id`);--> statement-breakpoint
CREATE INDEX `documents_location_idx` ON `documents` (`physical_location_id`);--> statement-breakpoint
CREATE INDEX `user_sessions_user_id_idx` ON `user_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_role_id_idx` ON `users` (`role_id`);