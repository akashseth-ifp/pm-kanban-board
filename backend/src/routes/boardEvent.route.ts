import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  boardEventGetHandler,
  boardEventPostHandler,
} from "../controllers/boardEvent.controller";
import { boardEventMiddleware } from "../middleware/boardEvent.middleware";
const router: express.Router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(boardEventMiddleware);

// 1. Handle Events (POST)
router.post("/", boardEventPostHandler);

// 2. Handle Events (GET)
router.get("/", boardEventGetHandler);

export default router;
