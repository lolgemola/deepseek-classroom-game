CREATE TABLE `choices` (
	`room` text NOT NULL,
	`player` text NOT NULL,
	`round` integer NOT NULL,
	`option` integer NOT NULL,
	PRIMARY KEY(`room`, `player`, `round`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`name` text NOT NULL,
	`token` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `players_room` ON `players` (`room`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host` text NOT NULL,
	`phase` text NOT NULL,
	`round` integer NOT NULL,
	`version` integer NOT NULL,
	`events` text NOT NULL,
	`created` integer NOT NULL
);
