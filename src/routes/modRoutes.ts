import express from "express";
import {
  createModSchema,
  getModIdSchema,
  patchModSchema,
  getModQuerySchema,
} from "../schemas/mod.schema.js";
import { modController } from "../controllers/modController.js";
import { validate } from "../middlewares/validate.js";
import { protect, optionalProtect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import { commentController } from "../controllers/commentController.js";
import {
  createCommentSchema,
  patchCommentSchema,
  deleteCommentSchema,
} from "../schemas/comment.schema.js";
import { uploadLimiter, spamLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post(
  "/",
  protect,
  uploadLimiter,
  upload.single("file"),
  validate(createModSchema),
  modController.createMod,
);
router.get("/:id", validate(getModIdSchema), modController.getModById);
router.delete(
  "/:id",
  protect,
  validate(getModIdSchema),
  modController.deleteMod,
);
router.patch(
  "/:id",
  protect,
  uploadLimiter,
  upload.single("file"),
  validate(getModIdSchema),
  validate(patchModSchema),
  modController.patchMod,
);
router.get("/", optionalProtect, modController.getAllMods);
router.get(
  "/:id/download",
  validate(getModIdSchema),
  modController.downloadMod,
);
router.post(
  "/:id/like",
  protect,
  spamLimiter,
  validate(getModIdSchema),
  modController.toggleLike,
);

router.post(
  "/:id/comments",
  protect,
  spamLimiter,
  validate(createCommentSchema),
  commentController.addComment,
);

router.get(
  "/:id/comments",
  validate(getModIdSchema),
  commentController.getComments,
);

router.patch(
  "/comments/:id",
  protect,
  spamLimiter,
  validate(patchCommentSchema),
  commentController.patchComment,
);
router.delete(
  "/comments/:id",
  protect,
  validate(deleteCommentSchema),
  commentController.deleteComment,
);

export default router;
