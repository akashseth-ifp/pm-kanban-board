import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z, object, uuidv7 } from "zod";
import { user } from "./auth-schema";

export const board = pgTable("boards", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()` as any),
  title: text("title").notNull(),
  version: bigint("version", { mode: "number" }).default(0).notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Board = typeof board.$inferSelect;
export type NewBoard = typeof board.$inferInsert;

export const createBoardSchema = z.object({
  body: createInsertSchema(board)
    .pick({
      title: true,
    })
    .extend({
      title: z.string().min(3, "Title must be at least 3 characters long."),
    }),
});

export const getBoardSchema = z.object({
  params: object({
    id: uuidv7("A valid board id is required."),
  }).strict(),
});

export const updateBoardSchema = z.object({
  params: object({
    id: uuidv7("A valid board id is required."),
  }).strict(),
  body: createInsertSchema(board)
    .pick({
      title: true,
    })
    .extend({
      title: z
        .string()
        .min(3, "Title must be at least 3 characters long.")
        .optional(),
    }),
});

export const deleteBoardSchema = z.object({
  params: object({
    id: uuidv7("A valid board id is required."),
  }).strict(),
});
