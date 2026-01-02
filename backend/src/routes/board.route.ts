import express from "express";
import { 
    createBoardSchema, 
    deleteBoardSchema, 
    getBoardSchema, 
    updateBoardSchema 
} from "../schema/board.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateResource } from "../middleware/validateResource.middleware";
import { authorizeResource } from "../middleware/authorize.middleware";
import { 
    createBoardHandler, 
    deleteBoardHandler, 
    getBoardHandler, 
    getBoardsHandler, 
    updateBoardHandler 
} from "../controllers/board.controller";

const router: express.Router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// 1. Create Board
router.post("/", validateResource(createBoardSchema), createBoardHandler);

// 2. Get All Boards (for logged-in user)
router.get("/", getBoardsHandler);

// 3. Get Single Board
router.get("/:id", validateResource(getBoardSchema), authorizeResource('board'), getBoardHandler);

// 4. Update Board
router.patch("/:id", validateResource(updateBoardSchema), authorizeResource('board'), updateBoardHandler);

// 5. Delete Board
router.delete("/:id", validateResource(deleteBoardSchema), authorizeResource('board'), deleteBoardHandler);

export default router;
