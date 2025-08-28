import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";
import { sendEmailVerification } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const generateEmailToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

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
