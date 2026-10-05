CREATE TABLE `founders` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`name` text NOT NULL,
	`token` text NOT NULL,
	`hub` text NOT NULL,
	`release` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `founders_room` ON `founders` (`room`);--> statement-breakpoint
CREATE TABLE `plans` (
	`room` text NOT NULL,
	`player` text NOT NULL,
	`round` integer NOT NULL,
	`plan` text NOT NULL,
	PRIMARY KEY(`room`, `player`, `round`)
);
--> statement-breakpoint
CREATE TABLE `simulation_rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host` text NOT NULL,
	`phase` text NOT NULL,
	`round` integer NOT NULL,
	`version` integer NOT NULL,
	`rules_version` integer NOT NULL,
	`snapshot` text NOT NULL,
	`created` integer NOT NULL
);
