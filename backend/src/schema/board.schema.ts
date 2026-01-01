import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, doublePrecision, check } from "drizzle-orm/pg-core";
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

export const list = pgTable("lists", {
    id: uuid("id").primaryKey().default(sql`uuidv7()` as any),
    title: text("title").notNull(),
    position: doublePrecision("position").notNull().default(0),
    boardId: uuid("board_id").notNull().references(() => board.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const ticket = pgTable("tickets", {
    id: uuid("id").primaryKey().default(sql`uuidv7()` as any),
    title: text("title").notNull(),
    description: text("description"),
    assignee: uuid("assignee").references(() => user.id),
    priority: text("priority").notNull().default('Low'),
    status: text("status").notNull().default('Todo'),
    position: doublePrecision("position").notNull().default(0),
    listId: uuid("list_id").notNull().references(() => list.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
    check("status_check", sql`${table.status} IN ('Backlog', 'Todo', 'In Progress', 'In Review', 'Blocked', 'Done')`),
    check("priority_check", sql`${table.priority} IN ('Critical', 'High', 'Medium', 'Low')`)
]);

export type Board = typeof board.$inferSelect;
export type NewBoard = typeof board.$inferInsert;

export type List = typeof list.$inferSelect;
export type NewList = typeof list.$inferInsert;

export type Ticket = typeof ticket.$inferSelect;
export type NewTicket = typeof ticket.$inferInsert;