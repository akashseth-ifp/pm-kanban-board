import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid } from "zod";
import { comment, CommentWithUser } from "../schema/comment.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";
import { user } from "../schema/auth-schema";

export const AddCommentEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "ADD_COMMENT", {
      message: "Event must be 'ADD_COMMENT'",
    }),
    boardId: uuid({
      version: "v7",
      message: "Invalid board ID",
    }),
    ticketId: uuid({
      version: "v7",
      message: "Invalid ticket ID",
    }),
    payload: object({
      content: string().min(1, "Comment content is required"),
    }),
  }),
});

export type AddCommentEvent = z.infer<typeof AddCommentEventSchema>["body"];

export type AddCommentEventResponse = {
  boardId: string;
  userId: string;
  version: number;
  eventType: string;
  entityType: string;
  payload: CommentWithUser;
};

export const addCommentEvent = async (
  eventData: AddCommentEvent,
  userId: string,
): Promise<AddCommentEventResponse> => {
  const {
    eventType,
    boardId,
    ticketId,
    payload: { content },
  } = eventData;

  const result = await db.transaction(async (tx) => {
    // 1. Create the comment
    const [insertedComment] = await tx
      .insert(comment)
      .values({
        content,
        ticketId,
        userId,
      })
      .returning();

    // 2. Fetch the joined comment with user info
    const [newComment] = await tx
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
      .where(eq(comment.id, insertedComment.id));

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
      payload: newComment,
    };

    // 4. Log the event
    await tx.insert(boardEvent).values({
      boardId,
      userId,
      version: eventResponse.version,
      eventType,
      entityType: "Comment",
      payload: newComment,
    });

    return eventResponse;
  });

  return result;
};
