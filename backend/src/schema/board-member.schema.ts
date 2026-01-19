import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  check,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z, object, uuidv7, email } from "zod";
import { user } from "./auth-schema";
import { board } from "./board.schema";

export const ALLOWED_ROLES = ["Admin", "Member", "Viewer"] as const;
export const ALLOWED_STATUSES = ["Pending", "Active"] as const;

export const boardMember = pgTable(
  "board_members",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()` as any),
    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("Member"),
    status: text("status").notNull().default("Pending"),
    email: text("email"),
    invitedBy: uuid("invited_by").references(() => user.id, {
      onDelete: "set null",
    }),
    inviteToken: text("invite_token"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    check("role_check", sql`${table.role} IN ('Admin', 'Member', 'Viewer')`),
    check("status_check", sql`${table.status} IN ('Pending', 'Active')`),
    uniqueIndex("unique_pending_invite")
      .on(table.boardId, table.email)
      .where(sql`${table.status} = 'Pending'`),
  ]
);

export type BoardMember = typeof boardMember.$inferSelect;
export type NewBoardMember = typeof boardMember.$inferInsert;

export const createBoardMemberSchema = z.object({
  body: createInsertSchema(boardMember)
    .pick({
      boardId: true,
      userId: true,
      role: true,
      status: true,
      email: true,
      invitedBy: true,
      inviteToken: true,
    })
    .extend({
      boardId: uuidv7("A valid board id is required."),
      role: z.enum(ALLOWED_ROLES).default("Member").optional(),
      status: z.enum(ALLOWED_STATUSES).default("Pending").optional(),
      userId: uuidv7("A valid user id is required.").optional(),
      email: email("A valid email is required.").optional(),
      invitedBy: uuidv7("A valid user id is required.").optional(),
      inviteToken: uuidv7("A valid invite token is required.").optional(),
    })
    .refine(
      (data) => data.userId || data.email,
      "Either userId or email is required."
    ),
});

export const getBoardMemberSchema = z.object({
  params: object({
    id: uuidv7("A valid board member id is required."),
  }).strict(),
});

export const updateBoardMemberSchema = z.object({
  params: object({
    id: uuidv7("A valid board member id is required."),
  }).strict(),
  body: createInsertSchema(boardMember)
    .pick({
      role: true,
    })
    .extend({
      role: z.enum(ALLOWED_ROLES),
    }),
});

export const deleteBoardMemberSchema = z.object({
  params: object({
    id: uuidv7("A valid board member id is required."),
  }).strict(),
});

export const inviteBoardMemberSchema = z.object({
  params: object({
    boardId: uuidv7("A valid board id is required."),
  }).strict(),
  body: createInsertSchema(boardMember)
    .pick({
      email: true,
      role: true,
    })
    .extend({
      email: email("A valid email is required."),
      role: z.enum(ALLOWED_ROLES),
    }),
});
