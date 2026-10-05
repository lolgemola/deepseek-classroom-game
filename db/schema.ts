// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', { code: text('code').primaryKey(), host: text('host').notNull(), phase: text('phase').notNull(), round: integer('round').notNull(), version: integer('version').notNull(), events: text('events').notNull(), created: integer('created').notNull() });
export const players = sqliteTable('players', { id: text('id').primaryKey(), room: text('room').notNull(), name: text('name').notNull(), token: text('token').notNull() }, t => [index('players_room').on(t.room)]);
export const choices = sqliteTable('choices', { room: text('room').notNull(), player: text('player').notNull(), round: integer('round').notNull(), option: integer('option').notNull() }, t => [primaryKey({columns:[t.room,t.player,t.round]})]);
