import { AppError } from "./appError.js";
import { deleteFileSafe } from "./fileSystem.js";

export const ownerOrAdmin = async (
  authorId: string | object,
  userId: string,
  role: string,
  cleanupPath?: string,
): Promise<void> => {
  if (authorId.toString() !== userId && role !== "admin") {
    if (cleanupPath) {
      await deleteFileSafe(cleanupPath);
    }
    throw new AppError(403, "FORBIDDEN", "You cant use this");
  }
};
