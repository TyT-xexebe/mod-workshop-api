import express, { Request, Response } from "express";

import authRoutes from "./routes/authRoutes.js";
import modRoutes from "./routes/modRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./config/env.js";

const app = express();

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.use(express.json());

app.use(
  cors({
    origin: ENV.NODE_ENV === "production" ? [ENV.ALLOWED_ORIGIN] : true,
  }),
);
app.use(helmet());

app.use("/auth", authRoutes);
app.use("/mods", modRoutes);
app.use("/users", userRoutes);

app.get("/ping", (req: Request, res: Response) => {
  res.json({ answer: "pong" });
});

app.use(errorHandler);
export default app;
