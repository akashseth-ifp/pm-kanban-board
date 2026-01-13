import { db } from "../db";
import { Board, board, List, list, Ticket } from "../schema";
import { z, object, uuid, string } from "zod";
import { eq, asc } from "drizzle-orm";

export const GetBoardEventSchema = object({
  body: object({
    eventType: string().refine((val) => val === "GET_BOARD", {
      message: "Event must be 'GET_BOARD'",
    }),
    boardId: uuid({
      version: "v7",
      message: "Valid board ID is required",
    }),
  }),
});

export type GetBoardEvent = z.infer<typeof GetBoardEventSchema>["body"];
export type GetBoardEventResponse = {
  board: Board;
  lists: List[];
  tickets: Ticket[];
};

export const getBoardEvent = async (
  eventData: GetBoardEvent,
  userId: string
) => {
  const { boardId } = eventData;

  const [foundBoard] = await db
    .select()
    .from(board)
    .where(eq(board.id, boardId));

  if (!foundBoard) {
    throw new Error("Board not found");
  }

  // fectch all the list for the board sorted by position
  const foundLists = await db
    .select()
    .from(list)
    .where(eq(list.boardId, boardId))
    .orderBy(asc(list.position));

  return {
    board: foundBoard,
    lists: foundLists,
    tickets: [],
  };
};
