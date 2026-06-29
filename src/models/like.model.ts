import { Schema, model, Types } from "mongoose";

export interface ILike {
  userId: Types.ObjectId;
  modId: Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    modId: { type: Schema.Types.ObjectId, ref: "Mod", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

likeSchema.index({ userId: 1, modId: 1 }, { unique: true });

export const LikeModel = model<ILike>("Like", likeSchema);
