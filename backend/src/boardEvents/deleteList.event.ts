import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, uuid } from "zod";
import { list } from "../schema/list.schema";
import { board } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

export const DeleteListEventSchema = object({
    body: object({
        eventType: string().refine(val => val === 'DELETE_LIST', {
            message: "Event must be 'DELETE_LIST'"
        }),
        boardId: uuid({
            version: "v7",
            message: "Invalid board ID"
        }),
        payload: object({
            listId: uuid({
                version: "v7",
                message: "Invalid list ID"
            })
        })
    }) 
})

export type DeleteListEvent = z.infer<typeof DeleteListEventSchema>['body'];

export const deleteListEvent = async (eventData: DeleteListEvent, userId: string) => {
    const { eventType, boardId, payload: { listId } } = eventData;

    // Use transaction to ensure all operations succeed or fail together
    const result = await db.transaction(async (tx) => {
        // 1. Create the list
        const [deletedList] = await tx.delete(list).where(eq(list.id, listId)).returning();

        // Update the board with version
        const [boardVersionInfo] = await tx.update(board).set({
            version: sql`${board.version} + 1`
        }).where(eq(board.id, boardId)).returning({ newBoardVersion: board.version });

        // 3. Log the event to board_events table
        await tx.insert(boardEvent).values({
            boardId,
            userId,
            version: boardVersionInfo.newBoardVersion,
            eventType,
            entityType: 'List',
            payload: eventData.payload
        });

        return {
            newVersion: boardVersionInfo.newBoardVersion,
            data: deletedList
        };
    });

    return result;
};