import { db } from "../db";
import { board } from "../schema/board.schema";
import { boardEvent } from "../schema/board-events.schema";
import { z, object, string, number } from "zod";
import { ALLOWED_BACKGROUNDS } from "../schema/board.schema";
import { eq, sql } from "drizzle-orm";

// Schema for validateResource middleware (expects body/params/query structure)
export const UpdateBoardEventSchema = object({
    body: object({
        eventType: string().refine(val => val === 'UPDATE_BOARD', {
            message: "Event must be 'UPDATE_BOARD'"
        }),
        version: number(),
        boardId: string().uuid("Valid board ID is required"),
        payload: object({
            title: string().min(3, "Title must be at least 3 characters long.").optional(),
            background: z.enum(ALLOWED_BACKGROUNDS).optional()
        }).refine(data => data.title || data.background, {
            message: "At least one field (title or background) must be provided"
        })
    })
});

export type UpdateBoardEvent = z.infer<typeof UpdateBoardEventSchema>['body'];

export const updateBoardEvent = async (eventData: UpdateBoardEvent, userId: string) => {
    const { eventType, version: oldVersion, boardId, payload } = eventData;

    // Use transaction to ensure all operations succeed or fail together
    const result = await db.transaction(async (tx) => {
        // 1. Update the board with version increment in the same query
        const updateData: any = {
            updatedAt: new Date(),
            // Increment version atomically using SQL
            version: sql`${board.version} + 1`,
            ...payload
        };

        const [updatedBoard] = await tx
            .update(board)
            .set(updateData)
            .where(eq(board.id, boardId))
            .returning();

        if (!updatedBoard) {
            throw new Error("Board not found");
        }

        // 2. Log the event to board_events table
        await tx.insert(boardEvent).values({
            boardId: updatedBoard.id,
            userId,
            version: updatedBoard.version,
            eventType,
            entityType: 'Board',
            payload
        });

        return {
            newVersion: updatedBoard.version,
            data: updatedBoard
        };
    });

    return result;
};
