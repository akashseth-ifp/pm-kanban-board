import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, bigint, check } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z, object, uuidv7 } from "zod";
import { user } from "./auth-schema";
import { board } from "./board.schema";

export const ALLOWED_ROLES = ['Admin', 'Member', 'Viewer'] as const;

export const boardMember = pgTable("board_members", {
    id: uuid("id").primaryKey().default(sql`uuidv7()` as any),
    boardId: uuid("board_id").notNull().references(() => board.id, { onDelete: 'cascade' }),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
    role: text("role").notNull().default('Member'),
    version: bigint("version", { mode: 'number' }).default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [
    check("role_check", sql`${table.role} IN ('Admin', 'Member', 'Viewer')`)
]);

export type BoardMember = typeof boardMember.$inferSelect;
export type NewBoardMember = typeof boardMember.$inferInsert;

export const createBoardMemberSchema = z.object({
    body: createInsertSchema(boardMember).pick({ 
        boardId: true,
        userId: true,
        role: true 
    }).extend({
        boardId: uuidv7("A valid board id is required."),
        userId: uuidv7("A valid user id is required."),
        role: z.enum(ALLOWED_ROLES).default('Member')
    })
});

export const getBoardMemberSchema = z.object({
    params: object({
        id: uuidv7("A valid board member id is required.")
    }).strict()
});

export const updateBoardMemberSchema = z.object({
    params: object({
        id: uuidv7("A valid board member id is required.")
    }).strict(),
    body: createInsertSchema(boardMember).pick({ 
        role: true 
    }).extend({
        role: z.enum(ALLOWED_ROLES)
    })
});

export const deleteBoardMemberSchema = z.object({
    params: object({
        id: uuidv7("A valid board member id is required.")
    }).strict()
});
