import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid, number } from "zod";
import { list } from "../schema/list.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";
import { getIO } from "../socket";

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

    // 3. Log the event to board_events table
    await tx.insert(boardEvent).values({
      boardId,
      userId,
      version: boardVersionInfo.newBoardVersion,
      eventType,
      entityType: "List",
      payload: eventData.payload,
    });

    return {
      newVersion: boardVersionInfo.newBoardVersion,
      data: newList,
    };
  });

  // Emit the event to the board room
  const io = getIO();
  io.to(boardId).emit("boardEvent", {
    eventType,
    boardId,
    version: result.newVersion,
    payload: result.data,
  });

  return { success: true };
};
