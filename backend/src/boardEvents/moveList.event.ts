import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid, number } from "zod";
import { list, List } from "../schema/list.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

export const MoveListEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "MOVE_LIST", {
      message: "Event must be 'MOVE_LIST'",
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
      fromIndex: number("From index must be a number"),
      toIndex: number("To index must be a number"),
      position: number("Position must be a number"),
    }),
  }),
});

export type MoveListEvent = z.infer<typeof MoveListEventSchema>["body"];

export type MoveListEventResponse = MoveListEvent & {
  userId: string;
  version: number;
  entityType: string;
};

export const moveListEvent = async (
  eventData: MoveListEvent,
  userId: string
): Promise<MoveListEventResponse> => {
  const {
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
      ...eventData,
      userId,
      version: boardVersionInfo.newBoardVersion,
      entityType: "List",
    };

    // 3. Log the event to board_events table
    await tx.insert(boardEvent).values({
      ...eventResponse,
    });

    return eventResponse;
  });

  return result;
};
