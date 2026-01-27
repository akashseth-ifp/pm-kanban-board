import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid } from "zod";
import { comment, CommentWithUser } from "../schema/comment.schema";
import { board } from "../schema/board.schema";
import { eq, sql, and } from "drizzle-orm";
import { AppError } from "../lib/app-error";
import { user } from "../schema/auth-schema";

export const UpdateCommentEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "UPDATE_COMMENT", {
      message: "Event must be 'UPDATE_COMMENT'",
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
      content: string().min(1, "Comment content is required"),
    }),
  }),
});

export type UpdateCommentEvent = z.infer<
  typeof UpdateCommentEventSchema
>["body"];

export type UpdateCommentEventResponse = {
  boardId: string;
  userId: string;
  version: number;
  eventType: string;
  entityType: string;
  payload: CommentWithUser;
};

export const updateCommentEvent = async (
  eventData: UpdateCommentEvent,
  userId: string,
): Promise<UpdateCommentEventResponse> => {
  const {
    eventType,
    boardId,
    payload: { id, content },
  } = eventData;

  const result = await db.transaction(async (tx) => {
    // 1. Update the comment (ensure user owns it)
    const [updated] = await tx
      .update(comment)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(and(eq(comment.id, id), eq(comment.userId, userId)))
      .returning();

    if (!updated) {
      throw new AppError("Comment not found or access denied", 403);
    }

    // 2. Fetch the joined comment with user info
    const [updatedComment] = await tx
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
      .where(eq(comment.id, updated.id));

    // 3. Update the board version
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
      payload: updatedComment,
    };

    // 4. Log the event
    await tx.insert(boardEvent).values({
      boardId,
      userId,
      version: eventResponse.version,
      eventType,
      entityType: "Comment",
      payload: JSON.parse(JSON.stringify(updatedComment)),
    });

    return eventResponse;
  });

  return result;
};
