import rateLimit from "express-rate-limit";
import { AppError } from "../utils/appError.js";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new AppError(
        429,
        "TOO_MANY_REQUESTS",
        "Too many requests. Try again later.",
      ),
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new AppError(
        429,
        "AUTH_LIMIT_EXCEEDED",
        "Too many auth attempts. Access temporary blocked.",
      ),
    );
  },
});

export const spamLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new AppError(429, "SPAM_PROTECTION", "Action blocked. Please slow down."),
    );
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new AppError(
        429,
        "UPLOAD_LIMIT_EXCEEDED",
        "Upload limit reached. Try again later.",
      ),
    );
  },
});
