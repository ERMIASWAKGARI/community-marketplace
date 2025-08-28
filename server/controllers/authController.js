import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";
import { sendEmailVerification } from "../utils/sendEmail.js";
import { AppError } from "../utils/appError.js";
import { generateEmailToken } from "./userController.js";

export const resendVerificationEmail = asyncHandler(async (req, res) => {
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
