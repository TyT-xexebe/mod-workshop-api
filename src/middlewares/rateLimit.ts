import rateLimit from "express-rate-limit";
import { AppError } from "../utils/appError.js";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, next) => {
    next(
      new AppError(
        429,
        "TOO_MANY_REQUESTS",
        "Too many tries, try again later.",
      ),
    );
  },
});
