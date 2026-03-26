ALTER TABLE `steps` ADD `jobId` text NOT NULL;--> statement-breakpoint
ALTER TABLE `jobs` DROP COLUMN `step`;