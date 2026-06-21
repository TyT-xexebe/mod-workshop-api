import { Request, Response } from "express";
import { UpdateUserInput } from "../schemas/user.schema.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { userService } from "../services/user.service.js";
import { getModQuerySchema } from "../schemas/mod.schema.js";

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.find(req.user!.userId);
  return res.status(200).json({
    status: "success",
    user,
  });
});

const patchMe = asyncHandler(
  async (req: Request<{}, {}, UpdateUserInput>, res: Response) => {
    const updatedUser = await userService.patch(req.body, req.user!.userId);
    return res.status(200).json({
      status: "success",
      user: updatedUser,
    });
  },
);

const getUser = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const user = await userService.find(id);
    return res.status(200).json({
      status: "success",
      user,
    });
  },
);

const getUserMods = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const query = getModQuerySchema.shape.query.parse(req.query);

    const { mods, totalMods, page, limit } = await userService.findMods(
      id,
      query,
    );
    return res.status(200).json({
      status: "success",
      meta: {
        totalResults: totalMods,
        page,
        limit,
        totalPages: Math.ceil(totalMods / limit),
      },
      mods,
    });
  },
);

export const userController = {
  getMe,
  patchMe,
  getUser,
  getUserMods,
};
