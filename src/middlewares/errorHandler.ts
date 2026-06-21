import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";
import { ENV } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      code: "VALIDATION_FAILED",
      message: "data validations failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      status: "error",
      code: "VALIDATION_FAILED",
      message: "data validations failed",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      status: "error",
      code: "INVALID_ID",
      message: `invalid value for field ${err.path}`,
    });
  }

  if (err instanceof MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "file is too large",
      LIMIT_UNEXPECTED_FILE: "unexpected file field",
    };
    return res.status(400).json({
      status: "error",
      code: err.code,
      message: messages[err.code] || err.message,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({
      status: "error",
      code: "DUPLICATE_RECORD",
      message: `this field ${field} already taken`,
    });
  }
  if (ENV.NODE_ENV === "development") {
    console.error(`[SYSTEM ERROR]: ${err}`);

    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "server side error",
  });
};
