import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid, number } from "zod";
import { List, list } from "../schema/list.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

export const AddListEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "ADD_LIST", {
      message: "Event must be 'ADD_LIST'",
    }),
    boardId: uuid({
      version: "v7",
      message: "Invalid board ID",
    }),
    payload: object({
      title: string().min(3, "Title must be at least 3 characters long."),
      position: number("Position must be a number"),
    }),
  }),
});

export type AddListEvent = z.infer<typeof AddListEventSchema>["body"];

export type AddListEventResponse = Omit<AddListEvent, "payload"> & {
  payload: List;
  userId: string;
  version: number;
  entityType: string;
};

export const addListEvent = async (eventData: AddListEvent, userId: string) => {
  const {
    eventType,
    boardId,
    payload: { title, position },
  } = eventData;

  // Use transaction to ensure all operations succeed or fail together
  const result = await db.transaction(async (tx) => {
    // 1. Create the list
    const [newList] = await tx
      .insert(list)
      .values({
        title,
        position,
        boardId,
      })
      .returning();

    // Update the board with version
    const [boardVersionInfo] = await tx
      .update(board)
      .set({
        version: sql`${board.version} + 1`,
      })
      .where(eq(board.id, boardId))
      .returning({ newBoardVersion: board.version });

    const eventResponse = {
      boardId,
      userId,
      version: boardVersionInfo.newBoardVersion,
      eventType,
      entityType: "List",
      payload: newList,
    };
    // 3. Log the event to board_events table
    await tx.insert(boardEvent).values(eventResponse);

    return eventResponse;
  });

  return result;
};
