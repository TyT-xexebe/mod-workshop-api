import { z } from "zod";
import { ROLES } from "../config/constants.js";
import { mongoIdRegex } from "../config/constants.js";

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, "username too short")
      .max(20, "username too long"),
    password: z.string().min(6, "password too short"),
    email: z.string().email(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6, "password too short"),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "username too short")
    .max(20, "username too long"),
  password: z.string().min(6, "password too short"),
  email: z.string().email(),
  description: z.string().max(200, "description too long").optional(),
  role: z.enum(ROLES),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(3, "username too short")
        .max(20, "username too long")
        .optional(),
      description: z.string().max(200, "description too long").optional(),
      email: z.string().email("invalid email format").optional(),
    })
    .strict(),
});

export const getUserIdSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, "invalid user id format"),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
export type UserInput = z.infer<typeof userSchema>;

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, "invalid user id format"),
  }),
  body: z
    .object({
      role: z.enum(ROLES),
    })
    .strict(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>["body"];
