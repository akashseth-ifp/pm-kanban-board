import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  doublePrecision,
  check,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { list } from "./list.schema";
import { board } from "./board.schema";

export const ticket = pgTable(
  "tickets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()` as any),
    title: text("title").notNull(),
    description: text("description"),
    assignee_id: uuid("assignee_id").references(() => user.id),
    reporter_id: uuid("reporter_id").references(() => user.id),
    priority: text("priority").notNull().default("Low"),
    status: text("status").notNull().default("Todo"),
    position: doublePrecision("position").notNull().default(0),
    listId: uuid("list_id")
      .notNull()
      .references(() => list.id, { onDelete: "cascade" }),
    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    check(
      "status_check",
      sql`${table.status} IN ('Backlog', 'Todo', 'In Progress', 'In Review', 'Blocked', 'Done')`
    ),
    check(
      "priority_check",
      sql`${table.priority} IN ('Critical', 'High', 'Medium', 'Low')`
    ),
  ]
);

export type Ticket = typeof ticket.$inferSelect;
export type NewTicket = typeof ticket.$inferInsert;
