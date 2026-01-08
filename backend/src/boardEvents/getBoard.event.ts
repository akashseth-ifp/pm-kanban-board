import { db } from "../db";
import { board } from "../schema/board.schema";
import { z, object, uuid, string } from "zod";
import { eq } from "drizzle-orm";

export const GetBoardEventSchema = object({
	body: object({
		eventType: string().refine(val => val === 'GET_BOARD', {
            message: "Event must be 'GET_BOARD'"
        }),
		boardId: uuid({
            version: "v7",
            message: "Valid board ID is required"
        })
	})
});

export type GetBoardEvent = z.infer<typeof GetBoardEventSchema>['body'];

export const getBoardEvent = async (eventData: GetBoardEvent, userId: string) => {
    const { boardId } = eventData;

    const [foundBoard] = await db
            .select()
            .from(board)
            .where(eq(board.id, boardId));

    if (!foundBoard) {
        throw new Error("Board not found");
    }

    return foundBoard;
};
