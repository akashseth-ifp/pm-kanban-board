import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getBoardsHandler } from "../controllers/board.controller";
import { createBoardHandler } from "../controllers/board.controller";
import { validateResource } from "../middleware/validateResource.middleware";
import { createBoardSchema } from "../schema/board.schema";
const router: express.Router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// 2. Get All Boards (for logged-in user)
router.get("/", getBoardsHandler);

router.post("/", validateResource(createBoardSchema), createBoardHandler);

export default router;
