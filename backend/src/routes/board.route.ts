import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getBoardEventsHandler,
  getBoardsHandler,
  inviteUserHandler,
} from "../controllers/board.controller";
import {
  createBoardHandler,
  getBoardHandler,
} from "../controllers/board.controller";
import { validateResource } from "../middleware/validateResource.middleware";
import { createBoardSchema, getBoardSchema } from "../schema/board.schema";
import { getBoardEventsSchema } from "../schema/board-events.schema";
import { authorizeResource } from "../middleware/authorize.middleware";
import { inviteBoardMemberSchema } from "../schema/board-member.schema";
const router: express.Router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// 2. Get All Boards (for logged-in user)
router.get("/", getBoardsHandler);

router.post("/", validateResource(createBoardSchema), createBoardHandler);

router.get("/:boardId", validateResource(getBoardSchema), getBoardHandler);

router.post(
  "/:boardId/invite",
  authorizeResource("Admin"),
  validateResource(inviteBoardMemberSchema),
  inviteUserHandler
);

// Get all the events related to a board from board-events table
router.get(
  "/:boardId/events",
  authorizeResource("Viewer"),
  validateResource(getBoardEventsSchema),
  getBoardEventsHandler
);

export default router;
