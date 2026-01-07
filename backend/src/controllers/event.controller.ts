import { Request, Response, NextFunction } from "express";
import { addBoardEvent } from "../events/addBoard.event";
import { updateBoardEvent } from "../events/updateBoard.event";
import { deleteBoardEvent } from "../events/deleteBoard.event";
import { db } from "../db";
import { boardEvent } from "../schema/board-events.schema";
import { eq } from "drizzle-orm";

export const eventPostHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { eventType } = req.body;
        const userId = req.user!.id;

        req.log.info(`Event Data: ${JSON.stringify({userId, ...req.body}, null, 2)}`);

        let result;
        
        if (eventType === 'ADD_BOARD') {
            result = await addBoardEvent(req.body, userId);
        } else if (eventType === 'UPDATE_BOARD') {
            result = await updateBoardEvent(req.body, userId);
        }else if (eventType === 'DELETE_BOARD') {
            result = await deleteBoardEvent(req.body, userId);
        } else {
            res.status(400).json({ message: "Event not found: " + eventType });
            return;
        }

        res.status(200).json(result);
    } catch (error) {
        req.log.error(`Event Post Handler Error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const eventGetHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { boardId } = req.params;

        // Get all events for a specific board
        const events = await db
            .select()
            .from(boardEvent)
            .where(eq(boardEvent.boardId, boardId))
            .orderBy(boardEvent.createdAt);

        res.json(events);
    } catch (error) {
        req.log.error(`Event Get Handler Error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
