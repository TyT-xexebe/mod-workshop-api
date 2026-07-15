import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserModel } from "../models/user.model.js";
import { RegisterInput, LoginInput } from "../schemas/user.schema.js";
import { AppError } from "../utils/appError.js";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { mailService } from "./mail.service.js";

const register = async (body: RegisterInput) => {
  const { username, password, email } = body;

  const candidates = await UserModel.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (candidates) {
    if (candidates.isVerified) {
      throw new AppError(
        400,
        "USER_EXIST",
        "User with this username or email already exist",
      );
    }
    await UserModel.deleteOne({ _id: candidates._id });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await UserModel.create({
    username,
    passwordHash,
    email,
    verificationToken: hashedToken,
    verificationTokenExpiredAt: tokenExpires,
  });

  await mailService.sendVerificationEmail(email, rawToken);

  return user;
};

const login = async (body: LoginInput) => {
  const { password, email } = body;

  const user = await UserModel.findOne({ email: email.toLowerCase() });

  if (!user)
    throw new AppError(401, "INVALID_CREDENTIALS", "invalid email or password");

  if (!user.isVerified)
    throw new AppError(403, "EMAIL_NOT_VERIFIED", "email not virified");

  const passwordCheck = await bcrypt.compare(password, user.passwordHash);
  if (!passwordCheck)
    throw new AppError(401, "INVALID_CREDENTIALS", "invalid email or password");

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    ENV.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return { user, token };
};

const verifyEmail = async (token: string) => {
  if (!token || typeof token !== "string")
    throw new AppError(400, "INVALID_TOKEN", "invalid token");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiredAt: { $gt: new Date() },
  });

  if (!user) throw new AppError(404, "TOKEN_EXPIRED", "token is expired");

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiredAt = null;
  await user.save();

  return user;
};

export const authService = {
  register,
  login,
  verifyEmail,
};
