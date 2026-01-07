import express, { Request, Response } from "express";
import auth from "./auth.route";
import eventRoute from "./event.route";
import boardRoute from "./board.route";

const router: express.Router = express.Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

router.use('/auth', auth);
router.use('/boards', boardRoute);
router.use('/event', eventRoute);

export default router;
