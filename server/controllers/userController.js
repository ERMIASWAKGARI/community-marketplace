import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";
import { sendEmailVerification } from "../utils/sendEmail.js";
import { AppError } from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import { generateToken } from "../utils/token.js";

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

// Update avatar
export const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) throw new AppError("No image uploaded", 400);

  try {
    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      width: 300,
      height: 300,
      crop: "fill",
    });

    // Find the user
    const user = await User.findById(userId);

    if (user.avatar?.public_id) {
      // Delete previous image
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // Update user avatar
    user.avatar = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await user.save();

    return successResponse(res, 200, { user }, "Avatar updated successfully");
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new AppError("Image upload failed", 500);
  }
});
