import nodemailer from "nodemailer";
import { AppError } from "./appError.js";

const sendEmail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: '"Community-Marketplace Support" <support@community-marketplace.com>',
      to: email,
      subject,
      html,
    });
    console.log("Email sent successfully");
  } catch (error) {
    // Just throw; the controller will catch it via asyncHandler
    throw new AppError("Error sending email", 400);
  }
};

export const sendEmailVerification = async (email, token) => {
  const subject = "Verify Your Email - Community Marketplace";

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #333; text-align: center;">Welcome to Community Marketplace!</h2>
    <p style="color: #555; font-size: 16px;">
      Thanks for signing up. Please verify your email by clicking the button below:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:8000/api/v1/auth/verify-email?token=${token}"
         style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Verify Email
      </a>
    </div>
    <p style="color: #999; font-size: 14px; text-align: center;">
      If you didn’t sign up, you can safely ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
    <p style="color: #999; font-size: 12px; text-align: center;">
      Community Marketplace, 2025
    </p>
  </div>
  `;

  await sendEmail(email, subject, html);
};

export const sendPasswordResetEmail = async (email, token) => {
  const subject = "Password Reset Request - Community Marketplace";

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
    <p style="color: #555; font-size: 16px;">
      You requested a password reset. Please click the button below to reset your password:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:8000/api/v1/auth/reset-password?token=${token}"
         style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color: #999; font-size: 14px; text-align: center;">
      If you didn’t request this, you can safely ignore this email.
    </p>
    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
    <p style="color: #999; font-size: 12px; text-align: center;">
      Community Marketplace, 2025
    </p>
  </div>
  `;

  await sendEmail(email, subject, html);
};
