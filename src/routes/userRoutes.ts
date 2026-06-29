import express from "express";
import { userController } from "../controllers/userController.js";
import { protect, requireRole } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  getUserIdSchema,
  updateUserSchema,
  updateRoleSchema,
} from "../schemas/user.schema.js";
import { spamLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.get("/me", protect, userController.getMe);
router.patch(
  "/me",
  protect,
  spamLimiter,
  validate(updateUserSchema),
  userController.patchMe,
);

router.get("/:id", validate(getUserIdSchema), userController.getUser);
router.get("/:id/mods", validate(getUserIdSchema), userController.getUserMods);

router.patch(
  "/:id/role",
  protect,
  spamLimiter,
  requireRole("admin"),
  validate(updateRoleSchema),
  userController.updateRole,
);

export default router;
