import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid } from "zod";
import { ticket } from "../schema/ticket.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

export const DeleteTicketEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "DELETE_TICKET", {
      message: "Event must be 'DELETE_TICKET'",
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
    }),
    listId: uuid({
      version: "v7",
      message: "Invalid list ID",
    }),
  }),
});

export type DeleteTicketEvent = z.infer<typeof DeleteTicketEventSchema>["body"];

export type DeleteTicketEventResponse = DeleteTicketEvent & {
  userId: string;
  version: number;
  entityType: string;
};

export const deleteTicketEvent = async (
  eventData: DeleteTicketEvent,
  userId: string
): Promise<DeleteTicketEventResponse> => {
  const {
    eventType,
    boardId,
    payload: { id },
  } = eventData;

  // Use transaction to ensure all operations succeed or fail together
  const result = await db.transaction(async (tx) => {
    // 1. Delete the ticket
    const [deletedTicket] = await tx
      .delete(ticket)
      .where(eq(ticket.id, id))
      .returning();

    if (!deletedTicket) {
      throw new Error("Ticket not found");
    }

    // Update the board with version
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
      boardId,
      userId,
      version: eventResponse.version,
      eventType,
      entityType: "Ticket",
      payload: eventData.payload,
    });

    return eventResponse;
  });

  return result;
};
