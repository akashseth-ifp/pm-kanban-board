import { Request, Response, NextFunction } from "express";
import { addBoardEvent } from "../boardEvents/addBoard.event";
import { updateBoardEvent } from "../boardEvents/updateBoard.event";
import { deleteBoardEvent } from "../boardEvents/deleteBoard.event";
import { getBoardEvent } from "../boardEvents/getBoard.event";

export const boardEventPostHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        }else if (eventType === 'GET_BOARD') {
            result = await getBoardEvent(req.body, userId);
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
