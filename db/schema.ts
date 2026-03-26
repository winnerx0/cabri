import { relations } from "drizzle-orm";
import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import z from "zod";
import { v4 as uuid } from "uuid";

export const stepTypesEnum = [
  "HTTP_REQUEST",
  "CONDITION",
  "SEND_MAIL",
] as const;

export const jobs = sqliteTable("jobs", {
  id: text().primaryKey().$defaultFn(() => uuid()),
  name: text().notNull(),
  schedule: text().notNull(),
  nextRunAt: integer("next_run_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const steps = sqliteTable("steps", {
  id: text().primaryKey().$defaultFn(() => uuid()),
  name: text().notNull(),
  type: text("type", { enum: stepTypesEnum }).notNull(),
  config: text("config", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  jobId: text('job_id').notNull().references(() => jobs.id),
});