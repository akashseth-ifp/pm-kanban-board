// create a schema for comment
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { ticket } from "./ticket.schema";

export const comment = pgTable("comments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()` as any),
  content: text("content").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => ticket.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Comment = typeof comment.$inferSelect;
export type NewComment = typeof comment.$inferInsert;

export type CommentWithUser = Comment & {
  user: {
    id: string;
    name: string;
    image: string | null;
  };
};
