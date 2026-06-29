import { CommentModel } from "../models/comment.model.js";
import { ModModel } from "../models/mod.model.js";
import { AppError } from "../utils/appError.js";
import {
  CreateCommentInput,
  PatchCommentInput,
  GetCommentsQueryInput,
} from "../schemas/comment.schema.js";
import { ownerOrAdmin } from "../utils/authHelper.js";
import { UserRole } from "../config/constants.js";

const create = async (
  modId: string,
  userId: string,
  data: CreateCommentInput,
) => {
  const modExists = await ModModel.exists({ _id: modId });
  if (!modExists) throw new AppError(404, "MOD_NOT_FOUND", "mod not found");

  let finalParentId: string | null = null;
  let finalReplyTo: string | null = data.replyTo || null;

  if (data.parentId) {
    const parentComment = await CommentModel.findById(data.parentId);
    if (!parentComment)
      throw new AppError(404, "COMMENT_NOT_FOUND", "parent comment not found");

    finalParentId = parentComment.parentId
      ? parentComment.parentId.toString()
      : parentComment._id.toString();

    if (!finalReplyTo) {
      finalReplyTo = parentComment.userId.toString();
    }
  }

  const comment = await CommentModel.create({
    modId,
    userId,
    text: data.text,
    parentId: finalParentId,
    replyTo: finalReplyTo,
  });

  return comment.populate([
    { path: "userId", select: "username" },
    { path: "replyTo", select: "username" },
  ]);
};

const patch = async (
  commentId: string,
  userId: string,
  userRole: UserRole,
  data: PatchCommentInput,
) => {
  const comment = await CommentModel.findById(commentId);
  if (!comment)
    throw new AppError(404, "COMMENT_NOT_FOUND", "comment not found");

  await ownerOrAdmin(comment.userId, userId, userRole);

  const updatedComment = await CommentModel.findByIdAndUpdate(
    commentId,
    { text: data.text },
    { new: true, runValidators: true },
  ).populate([
    { path: "userId", select: "username" },
    { path: "replyTo", select: "username" },
  ]);

  return updatedComment;
};

const list = async (modId: string, query: GetCommentsQueryInput) => {
  const { parentId, page, limit } = query;
  const skip = (page - 1) * limit;

  const filter = {
    modId,
    parentId: parentId || null,
  };

  const sortOrder = parentId ? 1 : -1;

  const comments = await CommentModel.find(filter)
    .populate([
      { path: "userId", select: "username" },
      { path: "replyTo", select: "username" },
    ])
    .sort({ createdAt: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await CommentModel.countDocuments(filter);

  return { comments, total, page, limit };
};

const remove = async (
  commentId: string,
  userId: string,
  userRole: UserRole,
) => {
  const comment = await CommentModel.findById(commentId);
  if (!comment)
    throw new AppError(404, "COMMENT_NOT_FOUND", "comment not found");

  await ownerOrAdmin(comment.userId, userId, userRole);

  await CommentModel.findByIdAndDelete(commentId);
  await CommentModel.deleteMany({ parentId: commentId });
};

export const commentService = { create, list, patch, remove };
