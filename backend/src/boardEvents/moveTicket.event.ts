import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid, number } from "zod";
import { ticket, Ticket } from "../schema/ticket.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

export const MoveTicketEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "MOVE_TICKET", {
      message: "Event must be 'MOVE_TICKET'",
    }),
    boardId: uuid({
      version: "v7",
      message: "Invalid board ID",
    }),
    payload: object({
      id: uuid({
        version: "v7",
        message: "Invalid ticket ID",
      }),
      fromListId: uuid({
        version: "v7",
        message: "Invalid from list ID",
      }),
      toListId: uuid({
        version: "v7",
        message: "Invalid to list ID",
      }),
      fromIndex: number("From index must be a number"),
      toIndex: number("To index must be a number"),
      position: number("Position must be a number"),
    }),
  }),
});

export type MoveTicketEvent = z.infer<typeof MoveTicketEventSchema>["body"];

export type MoveTicketEventResponse = {
  boardId: string;
  userId: string;
  version: number;
  eventType: string;
  entityType: string;
  payload: {
    id: string;
    fromListId: string;
    toListId: string;
    fromIndex: number;
    toIndex: number;
    position: number;
  };
};

export const moveTicketEvent = async (
  eventData: MoveTicketEvent,
  userId: string
): Promise<MoveTicketEventResponse> => {
  const {
    eventType,
    boardId,
    payload: { id, fromListId, toListId, fromIndex, toIndex, position },
  } = eventData;

  // Use transaction to ensure all operations succeed or fail together
  const result = await db.transaction(async (tx) => {
    // 1. Update the ticket position and potentially the listId
    await tx
      .update(ticket)
      .set({
        position,
        listId: toListId,
        updatedAt: new Date(),
      })
      .where(eq(ticket.id, id));

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
      entityType: "Ticket",
    };

    // 3. Log the event to board_events table
    await tx.insert(boardEvent).values({
      ...eventResponse,
    });

    return eventResponse;
  });

  return result;
};
