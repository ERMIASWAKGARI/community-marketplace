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

  // Check if user exists & select password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new AppError(
      "Email not verified. Please verify your email first.",
      403
    );
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate token
  const token = generateToken(user._id, process.env.JWT_SECRET, "7d");

  // Return user data without password
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
