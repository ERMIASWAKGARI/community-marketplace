import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";
import { sendEmailVerification } from "../utils/sendEmail.js";
import { AppError } from "../utils/appError.js";

export const generateToken = (userId, secret, expiresIn = "1d") => {
  return jwt.sign({ id: userId }, secret, {
    expiresIn,
  });
};

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const newUser = await User.create({ name, email, password, role });

  const userToReturn = newUser.toObject();
  delete userToReturn.password;

  // Generate email verification token (expires in 24h)
  const token = generateToken(newUser._id, process.env.JWT_EMAIL_SECRET, "24h");

  await sendEmailVerification(newUser.email, token);

  return successResponse(
    res,
    201,
    { user: userToReturn },
    "User created. Check your email to verify your account."
  );
});

export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return successResponse(res, 200, { user }, "User retrieved successfully");
});

export const deleteUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return successResponse(res, 200, null, "User deleted successfully");
});
