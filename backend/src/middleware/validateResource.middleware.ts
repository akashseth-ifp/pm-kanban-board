import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateResource =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  };
