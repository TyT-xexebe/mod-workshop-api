import { UserModel } from "../models/user.model.js";
import { ModModel } from "../models/mod.model.js";
import { UpdateUserInput } from "../schemas/user.schema.js";
import { AppError } from "../utils/appError.js";
import { modService } from "./mod.service.js";
import { GetModQueryInput } from "../schemas/mod.schema.js";
import { UserRole } from "../config/constants.js";

const find = async (id: string) => {
  const user = await UserModel.findById(id).select("-passwordHash");
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "user not found");
  return user;
};

const patch = async (body: UpdateUserInput, userId: string) => {
  const { username, email, description } = body;
  const patchData = { username, email, description };

  if (username || email) {
    const candidate = await UserModel.findOne({
      _id: { $ne: userId },
      $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
    });
    if (candidate)
      throw new AppError(400, "USER_EXIST", "username or email already in use");
  }

  return UserModel.findByIdAndUpdate(userId, patchData, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");
};

const findMods = async (
  id: string,
  query: GetModQueryInput,
  userId?: string,
) => {
  await find(id);
  return modService.list(query, { author: id }, userId);
};

const updateRole = async (id: string, role: UserRole) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true },
  ).select("-passwordHash");
  if (!updatedUser) throw new AppError(404, "USER_NOT_FOUND", "user not found");
  return updatedUser;
};

export const userService = {
  find,
  patch,
  findMods,
  updateRole,
};
