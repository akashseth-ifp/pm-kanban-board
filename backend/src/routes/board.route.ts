import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getBoardsHandler } from "../controllers/board.controller";

const router: express.Router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// 2. Get All Boards (for logged-in user)
router.get("/", getBoardsHandler);

export default router;
