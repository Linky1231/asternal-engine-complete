CREATE TABLE `cloud_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceBucket` varchar(128) NOT NULL,
	`sourcePath` varchar(512) NOT NULL,
	`manusKey` varchar(512) NOT NULL,
	`contentType` varchar(255),
	`byteSize` bigint,
	`contentHash` varchar(128),
	`sourceUpdatedAt` timestamp,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cloud_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `cloud_assets_source_unique` UNIQUE(`sourceBucket`,`sourcePath`),
	CONSTRAINT `cloud_assets_manus_key_unique` UNIQUE(`manusKey`)
);
--> statement-breakpoint
CREATE TABLE `cloud_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceTable` varchar(128) NOT NULL,
	`sourceId` varchar(191) NOT NULL,
	`ownerOpenId` varchar(64),
	`payload` text NOT NULL,
	`contentHash` varchar(128) NOT NULL,
	`sourceUpdatedAt` timestamp,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`deletedAt` timestamp,
	CONSTRAINT `cloud_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `cloud_records_source_unique` UNIQUE(`sourceTable`,`sourceId`)
);
--> statement-breakpoint
CREATE TABLE `cloud_sync_cursors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scope` varchar(191) NOT NULL,
	`cursor` varchar(512),
	`status` enum('pending','running','complete','failed') NOT NULL DEFAULT 'pending',
	`details` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cloud_sync_cursors_id` PRIMARY KEY(`id`),
	CONSTRAINT `cloud_sync_scope_unique` UNIQUE(`scope`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `cloud_records_table_idx` ON `cloud_records` (`sourceTable`);--> statement-breakpoint
CREATE INDEX `cloud_records_owner_idx` ON `cloud_records` (`ownerOpenId`);