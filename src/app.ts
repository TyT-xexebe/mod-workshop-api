import express, { Request, Response } from "express";

import authRoutes from "./routes/authRoutes.js";
import modRoutes from "./routes/modRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./config/env.js";
import { globalLimiter } from "./middlewares/rateLimit.js";

const app = express();

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.use(express.json());

app.use(
  cors({
    origin: ENV.NODE_ENV === "production" ? [ENV.ALLOWED_ORIGIN] : true,
  }),
);
app.use(helmet());

app.use("/api", globalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/mods", modRoutes);
app.use("/api/users", userRoutes);

app.get("/api/ping", (req: Request, res: Response) => {
  res.json({ answer: "pong" });
});

app.use(errorHandler);
export default app;
