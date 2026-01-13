import { db } from "../db";
import { board } from "../schema/board.schema";
import { z, object, string } from "zod";
import { eq } from "drizzle-orm";

export const DeleteBoardEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "DELETE_BOARD", {
      message: "Event must be 'DELETE_BOARD'",
    }),
    boardId: string().uuid("Valid board ID is required"),
  }),
});

export type DeleteBoardEvent = z.infer<typeof DeleteBoardEventSchema>["body"];

export type DeleteBoardEventResponse = DeleteBoardEvent & {
  userId: string;
  version: number;
  entityType: string;
};

export const deleteBoardEvent = async (
  eventData: DeleteBoardEvent,
  userId: string
): Promise<DeleteBoardEventResponse> => {
  const { boardId } = eventData;

  const [deletedBoard] = await db
    .delete(board)
    .where(eq(board.id, boardId))
    .returning();

  if (!deletedBoard) {
    throw new Error("Board not found or already deleted");
  }

  return {
    ...eventData,
    userId,
    version: deletedBoard.version,
    entityType: "Board",
  };
};
