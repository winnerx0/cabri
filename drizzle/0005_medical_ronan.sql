PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`created_at` integer NOT NULL,
	`job_id` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_steps`("id", "name", "type", "config", "created_at", "job_id") SELECT "id", "name", "type", "config", "created_at", "job_id" FROM `steps`;--> statement-breakpoint
DROP TABLE `steps`;--> statement-breakpoint
ALTER TABLE `__new_steps` RENAME TO `steps`;--> statement-breakpoint
PRAGMA foreign_keys=ON;