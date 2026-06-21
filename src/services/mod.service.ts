import { ModModel, IMod } from "../models/mod.model.js";
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

  return { mods, totalMods, page, limit };
};

export const modService = {
  incDownload,
  create,
  modById,
  remove,
  patch,
  list,
};
