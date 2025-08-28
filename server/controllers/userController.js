import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";

export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Custom validation
  if (!name || !email || !password) {
    return next(new AppError("Name, email, and password are required", 400));
  }

  // Optional: extra check before hitting DB
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email is already registered", 400));
  }

  const newUser = await User.create({ name, email, password, role });

  const userToReturn = newUser.toObject();
  delete userToReturn.password;

  return successResponse(
    res,
    201,
    { user: userToReturn },
    "User created successfully"
  );
});
