import express, { Request, Response } from "express";
import { db } from "../db";
import { board } from "../schema/board";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.middleware";

const router: express.Router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// 1. Create Board
router.post("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, background } = req.body;
        const userId = req.user!.id; // Middleware guarantees user exists

        if (!title) {
            res.status(400).json({ message: "Title is required" });
            return;
        }

        const [newBoard] = await db.insert(board).values({
            title,
            background,
            userId
        }).returning();

        res.status(201).json(newBoard);
    } catch (error) {
        console.error("Create Board Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 2. Get All Boards (for logged-in user)
router.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const boards = await db.select().from(board).where(eq(board.userId, userId)).orderBy(desc(board.createdAt));
        res.json(boards);
    } catch (error) {
        console.error("Get Boards Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 3. Get Single Board
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        
        const [foundBoard] = await db.select().from(board).where(eq(board.id, id));

        if (!foundBoard) {
            res.status(404).json({ message: "Board not found" });
            return;
        }

        if (foundBoard.userId !== userId) {
             res.status(403).json({ message: "Forbidden" });
             return;
        }

        res.json(foundBoard);
    } catch (error) {
        console.error("Get Board Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 4. Update Board
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, background } = req.body;
        const userId = req.user!.id;

        // Verify ownership
        const [existingBoard] = await db.select().from(board).where(eq(board.id, id));
        if (!existingBoard) {
             res.status(404).json({ message: "Board not found" });
             return;
        }
        if (existingBoard.userId !== userId) {
             res.status(403).json({ message: "Forbidden" });
             return;
        }

        const [updatedBoard] = await db.update(board)
            .set({ 
                title, 
                background, 
                updatedAt: new Date() 
            })
            .where(eq(board.id, id))
            .returning();

        res.json(updatedBoard);
    } catch (error) {
        console.error("Update Board Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 5. Delete Board
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        // Verify ownership
        const [existingBoard] = await db.select().from(board).where(eq(board.id, id));
        if (!existingBoard) {
             res.status(404).json({ message: "Board not found" });
             return;
        }
        if (existingBoard.userId !== userId) {
             res.status(403).json({ message: "Forbidden" });
             return;
        }

        await db.delete(board).where(eq(board.id, id));
        res.json({ message: "Board deleted successfully" });
    } catch (error) {
        console.error("Delete Board Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
