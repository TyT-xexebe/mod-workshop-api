import { Schema, model } from "mongoose";
import { ROLES, UserRole } from "../config/constants.js";

export interface IUser {
  username: string;
  passwordHash: string;
  description: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    description: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ROLES,
      default: "user" satisfies UserRole,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<IUser>("User", userSchema);
