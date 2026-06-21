import express from "express";
import {
  createModSchema,
  getModIdSchema,
  patchModSchema,
  getModQuerySchema,
} from "../schemas/mod.schema.js";
import { modController } from "../controllers/modController.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/",
  protect,
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
  upload.single("file"),
  validate(getModIdSchema),
  validate(patchModSchema),
  modController.patchMod,
);
router.get("/", modController.getAllMods);
router.get(
  "/:id/download",
  validate(getModIdSchema),
  modController.downloadMod,
);

export default router;
