ALTER TABLE `steps` RENAME COLUMN "next_run_at" TO "created_at";--> statement-breakpoint
ALTER TABLE `jobs` ADD `created_at` integer NOT NULL;