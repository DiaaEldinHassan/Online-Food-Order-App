import { Request, Response, NextFunction } from "express";
import {ZodError, z} from "zod"
export const validate=(schema:any)=>async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.body);

      req.body = parsed;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "fail",
          errors: error.flatten().fieldErrors,
        });
      }

      return res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
}


export const validateFile = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      schema.parse(req.file);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "fail",
          errors: error.issues.map((issue) => issue.message),
        });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};