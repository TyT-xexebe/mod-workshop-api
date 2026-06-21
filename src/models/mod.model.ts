import { Schema, model, Types } from "mongoose";
import { MOD_TAGS, ModTag } from "../config/constants.js";

export interface IMod {
  title: string;
  description: string;
  version: string;
  author: Types.ObjectId;
  tags: ModTag[];
  fileUrl: string;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const modSchema = new Schema<IMod>(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    version: { type: String, required: true, default: "1.0.0" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: { type: [String], enum: MOD_TAGS, default: [] },
    fileUrl: { type: String, required: true },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ModModel = model<IMod>("Mod", modSchema);
