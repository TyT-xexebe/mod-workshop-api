import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;
const mongoUri = process.env.MONGO;

if (!jwtSecret) {
  console.error("Critical Error: JWT_SECRET not found in .env");
  process.exit(1);
}

if (!mongoUri) {
  console.error("Critical Error: MONGO (URI) not found in .env");
  process.exit(1);
}

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpUser || !smtpPass) {
  console.warn(
    "Warning: SMTP credentials not fully configured. Email features might fail.",
  );
}

export const ENV = {
  JWT_SECRET: jwtSecret,
  MONGO_URI: mongoUri,
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "",

  // SMTP
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 465,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: smtpUser || "",
  SMTP_PASS: smtpPass || "",
  SMTP_FROM: process.env.SMTP_FROM || `"Workshop" <${smtpUser}>`,
  APP_URL: process.env.APP_URL || "http://localhost:5000",
};
