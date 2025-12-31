import express, { Request, Response } from "express";
import auth from "./auth";

const router: express.Router = express.Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

router.use('/auth', auth);
export default router;
