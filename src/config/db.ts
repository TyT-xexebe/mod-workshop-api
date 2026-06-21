import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("mongo connected");
  } catch (error) {
    console.log("mongo error ", error);
    process.exit(1);
  }
};
