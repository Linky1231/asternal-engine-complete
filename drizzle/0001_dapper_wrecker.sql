CREATE TABLE `cloud_migration_skips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceBucket` varchar(128),
	`sourcePath` varchar(512),
	`sourceTable` varchar(128),
	`sourceId` varchar(191),
	`reason` text NOT NULL,
	`details` text,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cloud_migration_skips_id` PRIMARY KEY(`id`),
	CONSTRAINT `cloud_migration_skip_asset_unique` UNIQUE(`sourceBucket`,`sourcePath`),
	CONSTRAINT `cloud_migration_skip_record_unique` UNIQUE(`sourceTable`,`sourceId`)
);
