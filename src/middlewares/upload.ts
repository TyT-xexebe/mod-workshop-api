import { Request } from "express";
import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError.js";
import { FILE_UPLOAD } from "../config/constants.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if ((FILE_UPLOAD.EXTENSIONS as readonly string[]).includes(ext))
    return cb(null, true);

  cb(
    new AppError(
      400,
      "INVALID_FILE_TYPE",
      `Invalid file type. Only ${FILE_UPLOAD.EXTENSIONS.join(" ,")} are allowed`,
    ),
  );
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE,
  },
});
