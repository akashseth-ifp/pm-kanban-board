import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid } from "zod";
import { ticket } from "../schema/ticket.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

export const UpdateTicketEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "UPDATE_TICKET", {
      message: "Event must be 'UPDATE_TICKET'",
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
      title: string().min(1, "Title is required").optional(),
      description: string().optional(),
    }),
  }),
});

export type UpdateTicketEvent = z.infer<typeof UpdateTicketEventSchema>["body"];

export type UpdateTicketEventResponse = UpdateTicketEvent & {
  userId: string;
  version: number;
  entityType: string;
};

export const updateTicketEvent = async (
  eventData: UpdateTicketEvent,
  userId: string
): Promise<UpdateTicketEventResponse> => {
  const {
    eventType,
    boardId,
    payload: { id, ...patch },
  } = eventData;

  // Use transaction to ensure all operations succeed or fail together
  const result = await db.transaction(async (tx) => {
    // 1. Update the ticket
    const [updatedTicket] = await tx
      .update(ticket)
      .set({
        ...patch,
        updatedAt: new Date(),
      })
      .where(eq(ticket.id, id))
      .returning();

    if (!updatedTicket) {
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
