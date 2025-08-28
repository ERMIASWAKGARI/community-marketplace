import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";

export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

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
