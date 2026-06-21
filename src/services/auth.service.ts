import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model.js";
import { RegisterInput, LoginInput } from "../schemas/user.schema.js";
import { AppError } from "../utils/appError.js";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

const register = async (body: RegisterInput) => {
  const { username, password, email } = body;

  const candidates = await UserModel.findOne({
    $or: [{ username }, { email }],
  });

  if (candidates) {
    throw new AppError(
      400,
      "USER_EXIST",
      "User with this username or email already exist",
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return UserModel.create({
    username,
    passwordHash,
    email,
  });
};

const login = async (body: LoginInput) => {
  const { password, email } = body;

  const user = await UserModel.findOne({ email });

  if (!user)
    throw new AppError(401, "INVALID_CREDENTIALS", "invalid email or password");

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

export const authService = {
  register,
  login,
};
