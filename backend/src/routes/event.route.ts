import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { eventPostHandler, eventGetHandler } from "../controllers/event.controller";
import { eventMiddleware } from "../middleware/event.middleware";
const router: express.Router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(eventMiddleware);

// 1. Handle Events (POST)
router.post("/", eventPostHandler);

// 2. Get Events for a Board
router.get("/", eventGetHandler);

export default router;