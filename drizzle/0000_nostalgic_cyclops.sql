CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`step` text NOT NULL,
	`schedule` text NOT NULL,
	`next_run_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`next_run_at` integer NOT NULL
);
