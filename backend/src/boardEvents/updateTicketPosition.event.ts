import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid, number } from "zod";
import { ticket, Ticket } from "../schema/ticket.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

export const UpdateTicketPositionEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "UPDATE_TICKET_POSITION", {
      message: "Event must be 'UPDATE_TICKET_POSITION'",
    }),
    boardId: uuid({
      version: "v7",
      message: "Invalid board ID",
    }),
    listId: uuid({
      version: "v7",
      message: "Invalid list ID",
    }),
    payload: object({
      id: uuid({
        version: "v7",
        message: "Invalid ticket ID",
      }),
      position: number("Position must be a number"),
      listId: uuid({
        version: "v7",
        message: "Invalid list ID",
      }),
    }),
  }),
});

export type UpdateTicketPositionEvent = z.infer<
  typeof UpdateTicketPositionEventSchema
>["body"];

export type UpdateTicketPositionEventResponse = {
  boardId: string;
  userId: string;
  version: number;
  eventType: string;
  entityType: string;
  listId: string; // The new listId where the ticket is moved
  fromListId?: string; // The old listId (if different from new listId)
  payload: {
    id: string;
    position: number;
    listId: string;
  };
};

export const updateTicketPositionEvent = async (
  eventData: UpdateTicketPositionEvent,
  userId: string
): Promise<UpdateTicketPositionEventResponse> => {
  const {
    eventType,
    boardId,
    listId: oldListId,
    payload: { id, position, listId: newListId },
  } = eventData;

  // Use transaction to ensure all operations succeed or fail together
  const result = await db.transaction(async (tx) => {
    // 1. Update the ticket position and potentially the listId
    await tx
      .update(ticket)
      .set({
        position,
        listId: newListId,
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
      boardId,
      userId,
      version: boardVersionInfo.newBoardVersion,
      eventType,
      entityType: "Ticket",
      listId: newListId,
      fromListId: oldListId !== newListId ? oldListId : undefined,
      payload: {
        id,
        position,
        listId: newListId,
      },
    };

    // 3. Log the event to board_events table
    await tx.insert(boardEvent).values({
      boardId,
      userId,
      version: eventResponse.version,
      eventType,
      entityType: "Ticket",
      payload: eventResponse.payload,
    });

    return eventResponse;
  });

  return result;
};
