import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGO;

if (!jwtSecret) {
  console.log("jwt secret not found");
  process.exit(1);
}

if (!mongoUri) {
  console.log("mongo uri not found");
  process.exit(1);
}

export const ENV = {
  JWT_SECRET: jwtSecret,
  MONGO_URI: mongoUri,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "",
};
