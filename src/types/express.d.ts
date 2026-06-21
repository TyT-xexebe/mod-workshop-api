import { UserRole } from "../config/constants.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      role: UserRole;
    };
  }
}
