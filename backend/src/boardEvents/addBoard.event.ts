import { db } from "../db";
import { board } from "../schema/board.schema";
import { boardMember } from "../schema/board-member.schema";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string } from "zod";

export const AddBoardEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "ADD_BOARD", {
      message: "Event must be 'ADD_BOARD'",
    }),
    payload: object({
      title: string().min(3, "Title must be at least 3 characters long."),
    }),
  }),
});

export type AddBoardEvent = z.infer<typeof AddBoardEventSchema>["body"];

export const addBoardEvent = async (
  eventData: AddBoardEvent,
  userId: string
) => {
  const { title } = eventData.payload;

  // Use transaction to ensure all operations succeed or fail together
  const result = await db.transaction(async (tx) => {
    // 1. Create the board
    const [newBoard] = await tx
      .insert(board)
      .values({
        title,
        userId,
      })
      .returning();

    // 2. Add user as Admin member
    await tx.insert(boardMember).values({
      boardId: newBoard.id,
      userId,
      role: "Admin",
    });

    // 3. Log the event to board_events table
    await tx.insert(boardEvent).values({
      boardId: newBoard.id,
      userId,
      version: newBoard.version,
      eventType: eventData.eventType,
      entityType: "Board",
      payload: eventData.payload,
    });

    return newBoard;
  });

  return result;
};
