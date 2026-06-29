import { Schema, model, Types } from "mongoose";

export interface IComment {
  modId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  parentId: Types.ObjectId | null;
  replyTo: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    modId: { type: Schema.Types.ObjectId, ref: "Mod", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    replyTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

commentSchema.index({ modId: 1, parentId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1, createdAt: 1 });

export const CommentModel = model<IComment>("Comment", commentSchema);
