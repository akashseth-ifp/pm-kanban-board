import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, check } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const board = pgTable("boards", {
    id: uuid("id").primaryKey().default(sql`uuidv7()` as any),
    title: text("title").notNull(),
    background: text("background").notNull().default('gradient1'),
    userId: uuid("user_id").notNull().references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
    check("background_check", sql`${table.background} IN ('gradient1', 'gradient2', 'gradient3', 'gradient4', 'gradient5', 'gradient6', 'gradient7', 'gradient8', 'gradient9', 'gradient10', 'gradient11', 'gradient12', 'gradient13', 'gradient14', 'gradient15', 'gradient16', 'gradient17', 'gradient18', 'gradient19', 'gradient20')`)
]);

export type Board = typeof board.$inferSelect;
export type NewBoard = typeof board.$inferInsert;