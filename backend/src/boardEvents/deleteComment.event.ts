import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid } from "zod";
import { comment } from "../schema/comment.schema";
import { board } from "../schema/board.schema";
import { eq, sql, and } from "drizzle-orm";
import { AppError } from "../lib/app-error";

export const DeleteCommentEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "DELETE_COMMENT", {
      message: "Event must be 'DELETE_COMMENT'",
    }),
    boardId: uuid({
      version: "v7",
      message: "Invalid board ID",
    }),
    payload: object({
      id: uuid({
        version: "v7",
        message: "Invalid comment ID",
      }),
    }),
  }),
});

export type DeleteCommentEvent = z.infer<
  typeof DeleteCommentEventSchema
>["body"];

export type DeleteCommentEventResponse = {
  boardId: string;
  userId: string;
  version: number;
  eventType: string;
  entityType: string;
  payload: { id: string; ticketId: string };
};

export const deleteCommentEvent = async (
  eventData: DeleteCommentEvent,
  userId: string,
): Promise<DeleteCommentEventResponse> => {
  const {
    eventType,
    boardId,
    payload: { id },
  } = eventData;

  const result = await db.transaction(async (tx) => {
    // 1. Delete the comment (ensure user owns it)
    const [deletedComment] = await tx
      .delete(comment)
      .where(and(eq(comment.id, id), eq(comment.userId, userId)))
      .returning({ id: comment.id, ticketId: comment.ticketId });

    if (!deletedComment) {
      throw new AppError("Comment not found or access denied", 403);
    }

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
      entityType: "Comment",
      payload: { id, ticketId: deletedComment.ticketId },
    };

    // 3. Log the event
    await tx.insert(boardEvent).values({
      boardId,
      userId,
      version: eventResponse.version,
      eventType,
      entityType: "Comment",
      payload: JSON.parse(
        JSON.stringify({ id, ticketId: deletedComment.ticketId }),
      ),
    });

    return eventResponse;
  });

  return result;
};
