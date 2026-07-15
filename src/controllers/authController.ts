import { Request, Response, NextFunction } from "express";
import { RegisterInput, LoginInput } from "../schemas/user.schema.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { authService } from "../services/auth.service.js";

const register = asyncHandler(
  async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const newUser = await authService.register(req.body);

    res.status(201).json({
      status: "success",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  },
);

const login = asyncHandler(
  async (
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const { user, token } = await authService.login(req.body);
    return res.status(200).json({
      status: "success",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  },
);

const verify = asyncHandler(
  async (
    req: Request<{}, {}, {}, { token: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { token } = req.query;
    const user = await authService.verifyEmail(token);
    res.status(200).json({
      status: "success",
      user: {
        id: user._id,
        username: user.username,
        isVerified: user.isVerified,
      },
    });
  },
);

export const authController = {
  register,
  login,
  verify,
};
