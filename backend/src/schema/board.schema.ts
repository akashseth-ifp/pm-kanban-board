import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, check, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z, object, uuidv7 } from "zod";
import { user } from "./auth-schema";

export const ALLOWED_BACKGROUNDS = [
    'gradient1', 'gradient2', 'gradient3', 'gradient4', 'gradient5',
    'gradient6', 'gradient7', 'gradient8', 'gradient9', 'gradient10',
    'gradient11', 'gradient12', 'gradient13', 'gradient14', 'gradient15',
    'gradient16', 'gradient17', 'gradient18', 'gradient19', 'gradient20'
] as const;

export const board = pgTable("boards", {
    id: uuid("id").primaryKey().default(sql`uuidv7()` as any),
    title: text("title").notNull(),
    background: text("background").notNull().default('gradient1'),
    version: bigint("version", { mode: 'number' }).default(0),
    userId: uuid("user_id").notNull().references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
    check("background_check", sql`${table.background} IN ('gradient1', 'gradient2', 'gradient3', 'gradient4', 'gradient5', 'gradient6', 'gradient7', 'gradient8', 'gradient9', 'gradient10', 'gradient11', 'gradient12', 'gradient13', 'gradient14', 'gradient15', 'gradient16', 'gradient17', 'gradient18', 'gradient19', 'gradient20')`)
]);

export type Board = typeof board.$inferSelect;
export type NewBoard = typeof board.$inferInsert;

export const createBoardSchema = z.object({
    body: createInsertSchema(board).pick({ 
        title: true, 
        background: true 
    }).extend({
        title: z.string().min(3, "Title must be at least 3 characters long.")
    })
});

export const getBoardSchema = z.object({
    params: object({
		id: uuidv7("A valid board id is required.")
	}).strict()
});

export const updateBoardSchema = z.object({
    params: object({
		id: uuidv7("A valid board id is required.")
	}).strict(),
    body: createInsertSchema(board).pick({ 
        title: true, 
        background: true 
    }).extend({
        title: z.string().min(3, "Title must be at least 3 characters long.").optional(),
        background: z.enum(ALLOWED_BACKGROUNDS).optional()
    })
});

export const deleteBoardSchema = z.object({
    params: object({
		id: uuidv7("A valid board id is required.")
	}).strict()
});