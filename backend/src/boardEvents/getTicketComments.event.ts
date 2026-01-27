import { db } from "../db";
import { comment, Comment, ticket, CommentWithUser } from "../schema";
import { z, object, uuid, string } from "zod";
import { eq, asc } from "drizzle-orm";
import { AppError } from "../lib/app-error";
import { user } from "../schema/auth-schema";

export const GetTicketCommentsSchema = object({
  body: object({
    eventType: string().refine((val) => val === "GET_TICKET_COMMENTS", {
      message: "Event must be 'GET_TICKET_COMMENTS'",
    }),
    boardId: uuid({
      version: "v7",
      message: "Valid board ID is required",
    }),
    ticketId: uuid({
      version: "v7",
      message: "Valid ticket ID is required",
    }),
  }),
});

export type GetTicketCommentsEvent = z.infer<
  typeof GetTicketCommentsSchema
>["body"];

export type GetTicketCommentsResponse = CommentWithUser[];

export const getTicketCommentsEvent = async (
  eventData: GetTicketCommentsEvent,
  userId: string,
): Promise<GetTicketCommentsResponse> => {
  const { ticketId } = eventData;

  // Verify ticket exists
  const [foundTicket] = await db
    .select()
    .from(ticket)
    .where(eq(ticket.id, ticketId));

  if (!foundTicket) {
    throw new AppError("Ticket not found", 404);
  }

  // Fetch all comments for the ticket joined with user info
  const foundComments = await db
    .select({
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      ticketId: comment.ticketId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(comment)
    .innerJoin(user, eq(comment.userId, user.id))
    .where(eq(comment.ticketId, ticketId))
    .orderBy(asc(comment.createdAt));

  return foundComments;
};
