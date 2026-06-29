import { ModModel, IMod } from "../models/mod.model.js";
import { LikeModel } from "../models/like.model.js";
import {
  CreateModInput,
  GetModQueryInput,
  PatchModInput,
} from "../schemas/mod.schema.js";
import { UserRole } from "../config/constants.js";
import { AppError } from "../utils/appError.js";
import { FilterQuery } from "mongoose";
import { deleteFileSafe } from "../utils/fileSystem.js";
import { ownerOrAdmin } from "../utils/authHelper.js";
import { escapeRegex } from "../utils/escapeRegExp.js";

const toggleLike = async (modId: string, userId: string) => {
  const mod = await ModModel.findById(modId);
  if (!mod) throw new AppError(404, "MOD_NOT_FOUND", "mod not found");

  const existingLike = await LikeModel.findOneAndDelete({ userId, modId });

  if (existingLike) {
    const updatedMod = await ModModel.findByIdAndUpdate(
      modId,
      { $inc: { likesCount: -1 } },
      { new: true },
    );
    return { liked: false, likesCount: updatedMod?.likesCount || 0 };
  }

  try {
    await LikeModel.create({ userId, modId });
    const updatedMod = await ModModel.findByIdAndUpdate(
      modId,
      { $inc: { likesCount: 1 } },
      { new: true },
    );
    return { liked: true, likesCount: updatedMod?.likesCount || 0 };
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(400, "ALREADY_LIKED", "You already liked this mod");
    }
    throw error;
  }
};

const incDownload = async (id: string) => {
  const mod = await ModModel.findByIdAndUpdate(
    id,
    { $inc: { downloads: 1 } },
    { new: true },
  );

  if (!mod) throw new AppError(404, "MOD_NOT_FOUND", "mod not found");
  return mod;
};

const create = async (
  data: CreateModInput,
  authorId: string,
  fileUrl: string,
) => {
  return ModModel.create({
    ...data,
    author: authorId,
    fileUrl,
  });
};

const modById = async (id: string) => {
  const mod = await ModModel.findById(id);

  if (!mod) throw new AppError(404, "MOD_NOT_FOUND", "mod not found");
  return mod;
};

const remove = async (id: string, userId: string, userRole: UserRole) => {
  const mod = await modById(id);

  await ownerOrAdmin(mod.author, userId, userRole);
  await deleteFileSafe(mod.fileUrl);
  await ModModel.findByIdAndDelete(id);
};

const patch = async (
  id: string,
  data: PatchModInput,
  userId: string,
  userRole: UserRole,
  filePath?: string,
) => {
  const mod = await ModModel.findById(id);
  if (!mod) {
    if (filePath) await deleteFileSafe(filePath);
    throw new AppError(404, "MOD_NOT_FOUND", "mod not found");
  }

  await ownerOrAdmin(mod.author, userId, userRole, filePath);

  const { title, description, version, tags } = data;
  const updateData: Partial<IMod> = { title, description, version, tags };
  if (filePath) updateData.fileUrl = filePath;

  return await ModModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

const list = async (
  query: GetModQueryInput,
  extraFilter: FilterQuery<IMod> = {},
  userId?: string,
) => {
  const { tag, search, page, limit, sort } = query;

  const filter: FilterQuery<IMod> = { ...extraFilter };
  if (tag?.length) filter.tags = { $all: tag };
  if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    title: { title: 1 },
    downloads: { downloads: -1 },
  };

  const totalMods = await ModModel.countDocuments(filter);
  const skip = (page - 1) * limit;

  const mods = await ModModel.find(filter)
    .populate("author", "username")
    .sort(sortMap[sort])
    .skip(skip)
    .limit(limit);

  let likedModIds: string[] = [];

  if (userId && mods.length > 0) {
    const modIds = mods.map((mod) => mod._id);
    const userLikes = await LikeModel.find({
      userId,
      modId: { $in: modIds },
    }).select("modId");

    likedModIds = userLikes.map((like) => like.modId.toString());
  }

  const modsWithLike = mods.map((mod) => {
    const modObj = mod.toObject();
    return {
      ...modObj,
      isLiked: userId ? likedModIds.includes(mod._id.toString()) : false,
    };
  });

  return { mods: modsWithLike, totalMods, page, limit };
};

export const modService = {
  toggleLike,
  incDownload,
  create,
  modById,
  remove,
  patch,
  list,
};
