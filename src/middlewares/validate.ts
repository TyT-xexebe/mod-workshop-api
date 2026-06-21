import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { deleteFileSafe } from "../utils/fileSystem.js";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.body = parsed.body;
      if (parsed.params) Object.assign(req.params, parsed.params);
      if (parsed.query) Object.assign(req.query, parsed.query);
      next();
    } catch (error) {
      if (req.file) await deleteFileSafe(req.file.path);
      next(error);
    }
  };
};
