import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";
import { sendEmailVerification } from "../utils/sendEmail.js";
import { AppError } from "../utils/appError.js";
import { generateToken } from "./userController.js";

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User with this email is not found!", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("User with this email is already verified!", 400);
  }

  const token = generateToken(user._id);
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
  const token = generateToken(user._id);

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
