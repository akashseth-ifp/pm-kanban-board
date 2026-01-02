import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, doublePrecision } from "drizzle-orm/pg-core";
import { board } from "./board.schema";

export const list = pgTable("lists", {
    id: uuid("id").primaryKey().default(sql`uuidv7()` as any),
    title: text("title").notNull(),
    position: doublePrecision("position").notNull().default(0),
    boardId: uuid("board_id").notNull().references(() => board.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type List = typeof list.$inferSelect;
export type NewList = typeof list.$inferInsert;