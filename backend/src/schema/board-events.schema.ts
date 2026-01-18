import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  bigint,
  jsonb,
  check,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { board } from "./board.schema";
import { coerce, object, uuidv7 } from "zod";

export const ALLOWED_EVENT_TYPES = [
  "GET_BOARDS",
  "ADD_BOARD",
  "GET_BOARD",
  "UPDATE_BOARD",
  "DELETE_BOARD",
  "GET_LISTS",
  "ADD_LIST",
  "UPDATE_LIST",
  "MOVE_LIST",
  "DELETE_LIST",
  "GET_TICKETS",
  "ADD_TICKET",
  "GET_TICKET",
  "MOVE_TICKET",
  "UPDATE_TICKET",
  "DELETE_TICKET",
] as const;

export const ALLOWED_ENTITY_TYPES = [
  "Ticket",
  "List",
  "Board",
  "Member",
] as const;

export const boardEvent = pgTable(
  "board_events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()` as any),
    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    entityType: text("entity_type").notNull(),
    payload: jsonb("payload"),
    version: bigint("version", { mode: "number" }).default(0).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    check(
      "event_type_check",
      sql`${table.eventType} IN ('GET_BOARDS', 'ADD_BOARD', 'GET_BOARD', 'UPDATE_BOARD', 'DELETE_BOARD', 'GET_LISTS', 'ADD_LIST', 'UPDATE_LIST', 'MOVE_LIST', 'DELETE_LIST', 'GET_TICKETS', 'ADD_TICKET', 'GET_TICKET', 'MOVE_TICKET', 'UPDATE_TICKET', 'DELETE_TICKET')`
    ),
    check(
      "entity_type_check",
      sql`${table.entityType} IN ('Ticket', 'List', 'Board', 'Member')`
    ),
  ]
);

export const getBoardEventsSchema = object({
  params: object({
    boardId: uuidv7("A valid board id is required."),
  }).strict(),
  query: object({
    from_version: coerce.number().optional(),
  }),
});

export type NewBoardEvent = typeof boardEvent.$inferInsert;
export type BoardEvent = typeof boardEvent.$inferSelect;
