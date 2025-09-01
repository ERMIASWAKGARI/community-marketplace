import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
} from "../utils/sendEmail.js";
import { AppError } from "../utils/appError.js";
import { generateToken, generateResetToken } from "../utils/token.js";

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User with this email is not found!", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("User with this email is already verified!", 400);
  }

  const token = generateToken(user._id, process.env.JWT_EMAIL_SECRET);
  await sendEmailVerification(user.email, token);

  return successResponse(res, 200, null, "Email verification link sent");
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Email verification check
  if (!user.isEmailVerified) {
    throw new AppError(
      "Email not verified. Please verify your email first.",
      403
    );
  }

  // Account moderation checks
  if (user.status === "deactivated") {
    throw new AppError(
      "This account has been deactivated. Do you want to reactivate it?",
      403
    );
  }

  if (user.status === "suspended") {
    throw new AppError(
      "This account is temporarily suspended. Please try again later or contact support.",
      403
    );
  }

  if (user.status === "banned") {
    throw new AppError("This account has been permanently banned.", 403);
  }

  // Password check
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate token
  const token = generateToken(user._id, process.env.JWT_SECRET, "7d");

  const userToReturn = user.toObject();
  delete userToReturn.password;

  return successResponse(
    res,
    200,
    { user: userToReturn, token },
    "Login successful"
  );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) throw new AppError("Verification token missing", 400);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired token", 400);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("User not found", 404);

  if (user.isEmailVerified)
    return successResponse(res, 200, {}, "Email already verified");

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  await user.save();

  return successResponse(res, 200, {}, "Email verified successfully");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found with this email", 404);

  // Generate reset token
  const { resetToken, hashedToken } = generateResetToken();

  // Save token in DB (expires in 1 hour)
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Send password reset email
  await sendPasswordResetEmail(user.email, resetToken);

  return successResponse(res, 200, {}, "Password reset email sent!");
});

import crypto from "crypto";

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    throw new AppError("Token and new password required", 400);

  // Hash token to compare with DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new AppError("Invalid or expired token", 400);

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return successResponse(res, 200, {}, "Password reset successful!");
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Both current and new passwords are required", 400);
  }

  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError("User not found", 404);

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) throw new AppError("Current password is incorrect", 401);

  // Update password
  user.password = newPassword;
  await user.save(); // pre-save middleware will hash it

  return successResponse(res, 200, {}, "Password changed successfully");
});
