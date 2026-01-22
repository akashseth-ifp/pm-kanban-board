import { db } from "../db";
import { board } from "../schema/board.schema";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, number, uuid } from "zod";
import { eq, sql } from "drizzle-orm";
import { AppError } from "../lib/app-error";

// Schema for validateResource middleware (expects body/params/query structure)
export const UpdateBoardEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "UPDATE_BOARD", {
      message: "Event must be 'UPDATE_BOARD'",
    }),
    version: number(),
    boardId: uuid({
      version: "v7",
      message: "Invalid board ID",
    }),
    payload: object({
      title: string().min(3, "Title must be at least 3 characters long."),
    }).refine((data) => data.title, {
      message: "Title must be provided",
    }),
  }),
});

export type UpdateBoardEvent = z.infer<typeof UpdateBoardEventSchema>["body"];

export type UpdateBoardEventResponse = UpdateBoardEvent & {
  userId: string;
  version: number;
  entityType: string;
};

export const updateBoardEvent = async (
  eventData: UpdateBoardEvent,
  userId: string
): Promise<UpdateBoardEventResponse> => {
  const { eventType, version: oldVersion, boardId, payload } = eventData;

  // Use transaction to ensure all operations succeed or fail together
  const result = await db.transaction(async (tx) => {
    // 1. Update the board with version increment in the same query
    const updateData: any = {
      updatedAt: new Date(),
      // Increment version atomically using SQL
      version: sql`${board.version} + 1`,
      ...payload,
    };

    const [updatedBoard] = await tx
      .update(board)
      .set(updateData)
      .where(eq(board.id, boardId))
      .returning();

    if (!updatedBoard) {
      throw new AppError("Board not found", 404);
    }

    const eventResponse = {
      ...eventData,
      userId,
      version: updatedBoard.version,
      entityType: "Board",
    };

    // 2. Log the event to board_events table
    await tx.insert(boardEvent).values(eventResponse);

    return eventResponse;
  });

  return result;
};
