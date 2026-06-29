import { z } from "zod";
import { mongoIdRegex } from "../config/constants.js";

export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, "invalid mod id format"),
  }),
  body: z
    .object({
      text: z.string().min(1, "cannot be empty").max(500, "too long"),
      parentId: z.string().regex(mongoIdRegex).optional(),
      replyTo: z.string().regex(mongoIdRegex).optional(),
    })
    .strict(),
});

export const getCommentsQuerySchema = z.object({
  query: z.object({
    parentId: z.string().regex(mongoIdRegex).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>["body"];
export type GetCommentsQueryInput = z.infer<
  typeof getCommentsQuerySchema
>["query"];

export const patchCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, "invalid comment id format"),
  }),
  body: z
    .object({
      text: z.string().min(1, "cannot be empty").max(500, "too long"),
      replyTo: z.string().regex(mongoIdRegex).optional(),
    })
    .strict(),
});

export type PatchCommentInput = z.infer<typeof patchCommentSchema>["body"];

export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, "invalid comment id format"),
  }),
});
