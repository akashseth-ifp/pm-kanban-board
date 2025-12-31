import { toNodeHandler } from "better-auth/node";
import express from "express";
import { auth } from "../lib/auth";

const router: express.Router = express.Router();

router.all("/*path", (req, res) => {
    return toNodeHandler(auth)(req, res);
});

export default router;