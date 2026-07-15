import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";

const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${ENV.APP_URL}/api/auth/verify?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_SECURE,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: ENV.SMTP_FROM,
    to,
    subject: "Verify Your Account",
    html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
  });
};

export const mailService = {
  sendVerificationEmail,
};
