import { Request, Response } from "express";
import {
  CreateModInput,
  PatchModInput,
  getModQuerySchema,
} from "../schemas/mod.schema.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { modService } from "../services/mod.service.js";
import path from "path";

const downloadMod = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const mod = await modService.incDownload(id);

  const fileExt = path.extname(mod.fileUrl);
  const cleanFileName = `${mod.title}_v${mod.version}${fileExt}`;

  return res.download(mod.fileUrl, cleanFileName);
});

const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const result = await modService.toggleLike(id, userId);

  return res.status(200).json({
    status: "success",
    data: result,
  });
});

const createMod = asyncHandler(
  async (req: Request<{}, {}, CreateModInput>, res: Response) => {
    if (!req.file)
      throw new AppError(400, "FILE_REQUIRED", "Please upload a mod file");

    const authorId = req.user!.userId;
    const fileUrl = req.file.path;

    const newMod = await modService.create(req.body, authorId, fileUrl);

    return res.status(201).json({
      status: "success",
      mod: newMod,
    });
  },
);

const getModById = asyncHandler(async (req: Request, res: Response) => {
  const mod = await modService.modById(req.params.id);

  return res.status(200).json({
    status: "success",
    mod,
  });
});

const deleteMod = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user!;
    await modService.remove(req.params.id, user.userId, user.role);

    return res.status(200).json({
      status: "success",
    });
  },
);

const patchMod = asyncHandler(
  async (req: Request<{ id: string }, {}, PatchModInput>, res: Response) => {
    const user = req.user!;

    const patchedMod = await modService.patch(
      req.params.id,
      req.body,
      user.userId,
      user.role,
      req.file?.path,
    );

    return res.status(200).json({
      status: "success",
      mod: patchedMod,
    });
  },
);

const getAllMods = asyncHandler(async (req: Request, res: Response) => {
  const query = getModQuerySchema.shape.query.parse(req.query);
  const { mods, totalMods, page, limit } = await modService.list(
    query,
    {},
    req.user?.userId,
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
});

export const modController = {
  createMod,
  getModById,
  deleteMod,
  patchMod,
  getAllMods,
  downloadMod,
  toggleLike,
};
