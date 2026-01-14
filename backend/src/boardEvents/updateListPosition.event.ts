import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid, number } from "zod";
import { list, List } from "../schema/list.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

export const UpdateListPositionEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "UPDATE_LIST_POSITION", {
      message: "Event must be 'UPDATE_LIST_POSITION'",
    }),
    boardId: uuid({
      version: "v7",
      message: "Invalid board ID",
    }),
    payload: object({
      id: uuid({
        version: "v7",
        message: "Invalid list ID",
      }),
      position: number("Position must be a number"),
    }),
  }),
});

export type UpdateListPositionEvent = z.infer<
  typeof UpdateListPositionEventSchema
>["body"];

export type UpdateListPositionEventResponse = {
  boardId: string;
  userId: string;
  version: number;
  eventType: string;
  entityType: string;
  payload: {
    id: string;
    position: number;
  };
};

export const updateListPositionEvent = async (
  eventData: UpdateListPositionEvent,
  userId: string
): Promise<UpdateListPositionEventResponse> => {
  const {
    eventType,
    boardId,
    payload: { id, position },
  } = eventData;

  // Use transaction to ensure all operations succeed or fail together
  const result = await db.transaction(async (tx) => {
    // 1. Update the list position
    await tx
      .update(list)
      .set({
        position,
        updatedAt: new Date(),
      })
      .where(eq(list.id, id));

    // 2. Update the board version
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
      payload: {
        id,
        position,
      },
    };

    // 3. Log the event to board_events table
    await tx.insert(boardEvent).values({
      ...eventResponse,
      eventType: "MOVE_LIST",
    });

    return eventResponse;
  });

  return result;
};
