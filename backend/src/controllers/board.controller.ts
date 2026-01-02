import { Request, Response } from "express";
import { db } from "../db";
import { board } from "../schema/board.schema";
import { eq, desc } from "drizzle-orm";

export const createBoardHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, background } = req.body;
        const userId = req.user!.id;

        const [newBoard] = await db.insert(board).values({
            title,
            background,
            userId
        }).returning();

        res.status(201).json(newBoard);
    } catch (error) {
        req.log.error(`Create Board Error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getBoardsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const boards = await db.select().from(board).where(eq(board.userId, userId)).orderBy(desc(board.createdAt));
        res.json(boards);
    } catch (error) {
        req.log.error(`Get Boards Error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getBoardHandler = async (req: Request, res: Response): Promise<void> => {
    // Middleware handles 404 and 403, and attaches board to req.board
    res.json(req.board);
};

export const updateBoardHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const [updatedBoard] = await db.update(board)
            .set({ 
                ...req.body,
                updatedAt: new Date() 
            })
            .where(eq(board.id, id))
            .returning();

        res.json(updatedBoard);
    } catch (error) {
        req.log.error(`Update Board Error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteBoardHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await db.delete(board).where(eq(board.id, id));
        res.json({ message: "Board deleted successfully" });
    } catch (error) {
        req.log.error(`Delete Board Error: ${error}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};