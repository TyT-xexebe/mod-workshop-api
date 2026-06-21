import { z } from "zod";
import { MOD_TAGS } from "../config/constants.js";

const modBodySchema = z.object({
  title: z.string().min(3, "title too short").max(50, "title too long"),
  description: z
    .string()
    .min(10, "description too short")
    .max(1000, "description too long"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "version must be in semver format (e.g. 1.0.0)"),
  tags: z.array(z.enum(MOD_TAGS)).min(1).optional(),
});

export const createModSchema = z.object({
  body: modBodySchema,
});

export const patchModSchema = z.object({
  body: modBodySchema.partial().strict(),
});

export type CreateModInput = z.infer<typeof createModSchema>["body"];
export type PatchModInput = z.infer<typeof patchModSchema>["body"];

export const getModIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const getModQuerySchema = z.object({
  query: z.object({
    tag: z
      .preprocess(
        (val) => {
          if (!val) return undefined;
          return Array.isArray(val) ? val : [val];
        },
        z.array(z.enum(MOD_TAGS)),
      )
      .optional(),
    search: z.string().max(50, "search queary too long").optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(["newest", "oldest", "downloads", "title"]).default("newest"),
  }),
});

export type GetModQueryInput = z.infer<typeof getModQuerySchema>["query"];
