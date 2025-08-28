import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";
import { sendEmailVerification } from "../utils/sendEmail.js";
import { AppError } from "../utils/appError.js";

const generateEmailToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User with this email is not found!", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("User with this email is already verified!", 400);
  }

  const token = generateEmailToken(user._id);
  await sendEmailVerification(user.email, token);

  return successResponse(res, 200, null, "Email verification link sent");
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const newUser = await User.create({ name, email, password, role });

  const userToReturn = newUser.toObject();
  delete userToReturn.password;

  // Generate email verification token (expires in 24h)
  const token = generateEmailToken(newUser._id);

  await sendEmailVerification(newUser.email, token);

  return successResponse(
    res,
    201,
    { user: userToReturn },
    "User created. Check your email to verify your account."
  );
});
