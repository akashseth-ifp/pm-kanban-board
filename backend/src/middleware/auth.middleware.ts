import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionData = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!sessionData || !sessionData.session) {
             res.status(401).json({ message: "Unauthorized" });
             return;
        }

        req.user = sessionData.user;
        req.session = sessionData.session;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
         res.status(500).json({ message: "Internal Server Error" });
         return;
    }
};
