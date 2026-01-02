import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { board } from "../schema/board.schema";
import { eq } from "drizzle-orm";

export const authorizeResource = (resourceType: 'board') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            if (resourceType === 'board') {
                const [foundBoard] = await db.select().from(board).where(eq(board.id, id));

                if (!foundBoard) {
                    return res.status(404).json({ message: "Board not found" });
                }

                if (foundBoard.userId !== userId) {
                    return res.status(403).json({ message: "Forbidden" });
                }

                req.board = foundBoard;
            }

            // Future expansion for list/ticket would go here
            // if (resourceType === 'list') { ... }

            next();
        } catch (error) {
            req.log.error({ err: error }, `Authorization Error (${resourceType})`);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    };
};
