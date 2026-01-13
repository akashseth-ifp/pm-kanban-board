import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid, number } from "zod";
import { Ticket, ticket } from "../schema/ticket.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

export const AddTicketEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "ADD_TICKET", {
      message: "Event must be 'ADD_TICKET'",
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
      title: string().min(1, "Title is required"),
      position: number("Position must be a number"),
    }),
  }),
});

export type AddTicketEvent = z.infer<typeof AddTicketEventSchema>["body"];

export type AddTicketEventResponse = {
  boardId: string;
  userId: string;
  version: number;
  eventType: string;
  entityType: string;
  payload: Ticket;
};

export const addTicketEvent = async (
  eventData: AddTicketEvent,
  userId: string
): Promise<AddTicketEventResponse> => {
  const {
    eventType,
    boardId,
    listId,
    payload: { title, position },
  } = eventData;

  // Use transaction to ensure all operations succeed or fail together
  const result = await db.transaction(async (tx) => {
    // 1. Create the ticket
    const [newTicket] = await tx
      .insert(ticket)
      .values({
        title,
        position,
        listId,
        boardId,
        assignee_id: userId,
        reporter_id: userId,
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
      ...eventData,
      userId,
      version: boardVersionInfo.newBoardVersion,
      entityType: "Ticket",
      payload: newTicket,
    };

    // 3. Log the event to board_events table
    await tx.insert(boardEvent).values({
      boardId,
      userId,
      version: eventResponse.version,
      eventType,
      entityType: "Ticket",
      payload: newTicket,
    });

    return eventResponse;
  });

  return result;
};
