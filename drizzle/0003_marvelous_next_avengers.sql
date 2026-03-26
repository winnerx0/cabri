PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`schedule` text NOT NULL,
	`next_run_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_jobs`("id", "name", "schedule", "next_run_at", "created_at") SELECT "id", "name", "schedule", "next_run_at", "created_at" FROM `jobs`;--> statement-breakpoint
DROP TABLE `jobs`;--> statement-breakpoint
ALTER TABLE `__new_jobs` RENAME TO `jobs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`created_at` integer NOT NULL,
	`jobId` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_steps`("id", "name", "type", "config", "created_at", "jobId") SELECT "id", "name", "type", "config", "created_at", "jobId" FROM `steps`;--> statement-breakpoint
DROP TABLE `steps`;--> statement-breakpoint
ALTER TABLE `__new_steps` RENAME TO `steps`;