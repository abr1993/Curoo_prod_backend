import type { Request, Response, NextFunction } from "express";
import { z, type ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body); // overrides req.body with validated data
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          
        });
      }
      next(err);
    }
  };
