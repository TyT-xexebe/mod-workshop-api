import express from "express";
import { authController } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../schemas/user.schema.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/verify", authLimiter, authController.verify);

export default router;
