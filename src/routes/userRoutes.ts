import express from "express";
import { userController } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { getUserIdSchema, updateUserSchema } from "../schemas/user.schema.js";

const router = express.Router();

router.get("/me", protect, userController.getMe);
router.patch(
  "/me",
  protect,
  validate(updateUserSchema),
  userController.patchMe,
);

router.get("/:id", validate(getUserIdSchema), userController.getUser);
router.get("/:id/mods", validate(getUserIdSchema), userController.getUserMods);

export default router;
