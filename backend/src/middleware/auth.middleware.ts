import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { AppError } from "../lib/app-error";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sessionData = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!sessionData || !sessionData.session) {
    throw new AppError("Unauthorized", 401);
  }

  req.user = sessionData.user;
  req.session = sessionData.session;

  next();
};
