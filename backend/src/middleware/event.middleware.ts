import { NextFunction, Request, Response } from 'express'
import { validateResource } from './validateResource.middleware';
import { authorizeResource } from './authorize.middleware';
import { AddBoardEventSchema } from '../events/addBoard.event';
import { UpdateBoardEventSchema } from '../events/updateBoard.event';
import { DeleteBoardEventSchema } from '../events/deleteBoard.event';

export const eventMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { eventType } = req.body;

        if (eventType === 'ADD_BOARD') {
            return validateResource(AddBoardEventSchema)(req, res, next);
        }
        
        if (eventType === 'UPDATE_BOARD') {
            return validateResource(UpdateBoardEventSchema)(req, res, (validationErr) => {
                if (validationErr) return next(validationErr);
                return authorizeResource('Admin')(req, res, next);
            });
        }

        if (eventType === 'DELETE_BOARD') {
            return validateResource(DeleteBoardEventSchema)(req, res, (validationErr) => {
                if (validationErr) return next(validationErr);
                return authorizeResource('Admin')(req, res, next);
            });
        }
        
        return res.status(400).send({ error: `Invalid event type, ${eventType}` });
    } catch (e: any) {
        req.log.error(`Event Middleware Failed: ${e}`);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};