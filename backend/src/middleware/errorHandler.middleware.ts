// middleware/errorHandler.ts
import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error";
import { DrizzleQueryError } from "drizzle-orm";
import { PostgresError } from "postgres";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  req.log.error(
    `Global Error Handler: [${req.method}] ${req.path} >> ${JSON.stringify(
      err
    )}`
  );

  if (err instanceof DrizzleQueryError) {
    // 1. Handle Postgres/Drizzle Specific Errors
    console.log(err.cause);
    if (err.cause instanceof PostgresError) {
      if (err.cause.code === "23505") {
        // Unique Violation
        error = new AppError("This record already exists.", 409);
      } else if (err.cause.code === "23503") {
        // Foreign Key Violation
        error = new AppError("Referenced record not found.", 400);
      }
    }
  }

  // 3. Send Response to Client
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Internal Server Error";

  res.status(statusCode).json({
    status: statusCode < 500 ? "fail" : "error",
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
