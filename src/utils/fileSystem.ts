import fs from "fs/promises";

export const deleteFileSafe = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete file at ${filePath}:`, error);
    }
  }
};
