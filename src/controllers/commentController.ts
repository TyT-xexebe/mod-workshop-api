import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { commentService } from "../services/comment.service.js";
import {
  CreateCommentInput,
  PatchCommentInput,
} from "../schemas/comment.schema.js";
import { getCommentsQuerySchema } from "../schemas/comment.schema.js";

const addComment = asyncHandler(
  async (
    req: Request<{ id: string }, {}, CreateCommentInput>,
    res: Response,
  ) => {
    const comment = await commentService.create(
      req.params.id,
      req.user!.userId,
      req.body,
    );
    return res.status(201).json({ status: "success", comment });
  },
);

const patchComment = asyncHandler(
  async (
    req: Request<{ id: string }, {}, PatchCommentInput>,
    res: Response,
  ) => {
    const { userId, role } = req.user!;
    const comment = await commentService.patch(
      req.params.id,
      userId,
      role,
      req.body,
    );
    return res.status(203).json({ status: "success", comment });
  },
);

const getComments = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const query = getCommentsQuerySchema.shape.query.parse(req.query);
    const { comments, total, page, limit } = await commentService.list(
      req.params.id,
      query,
    );

    return res.status(200).json({
      status: "success",
      meta: {
        totalResults: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      comments,
    });
  },
);

const deleteComment = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const commentId = req.params.id;
    const { userId, role } = req.user!;

    await commentService.remove(commentId, userId, role);

    return res
      .status(200)
      .json({ status: "success", message: "comment deleted" });
  },
);

export const commentController = {
  addComment,
  getComments,
  patchComment,
  deleteComment,
};
