import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { UserRole } from "../config/constants.js";
import { ENV } from "../config/env.js";
import { ObjectId } from "mongoose";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      throw new AppError(
        401,
        "NO_TOKEN",
        "You are not logged in. Provide a token",
      );
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      next();
    } catch (err) {
      throw new AppError(401, "INVALID_TOKEN", "invalid or expired token");
    }
  },
);
