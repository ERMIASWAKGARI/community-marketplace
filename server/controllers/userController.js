import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { successResponse } from "../utils/response.js";
import { sendEmailVerification } from "../utils/sendEmail.js";
import { AppError } from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import { generateToken } from "../utils/token.js";
import { moderateImage } from "../utils/moderateImage.js";

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

  const user = await User.findById(id);

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

export const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!req.file) throw new AppError("No image uploaded", 400);

  // 1. Moderate before upload
  moderateImage(req.file.path);

  // 2. Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "avatars",
    width: 300,
    height: 300,
    crop: "fill",
  });

  // 3. Update user avatar
  const user = await User.findById(userId);
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  user.avatar = {
    url: result.secure_url,
    public_id: result.public_id,
  };
  await user.save();

  return successResponse(res, 200, { user }, "Avatar updated successfully");
});

export const requestProviderVerification = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Check if user already requested verification
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (user.role === "provider") {
    throw new AppError("You are already a verified provider", 400);
  }

  if (!req.files || req.files.length === 0) {
    throw new AppError("Please upload at least one document", 400);
  }

  // Upload documents to Cloudinary
  const uploadedDocs = [];
  for (const file of req.files) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `provider_docs/${userId}`,
      });

      uploadedDocs.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new AppError("Document upload failed", 500);
    }
  }

  // Save documents and request status in user
  user.providerVerification = {
    status: "pending",
    documents: uploadedDocs,
    requestedAt: new Date(),
  };

  await user.save();

  return successResponse(
    res,
    200,
    { user },
    "Provider verification request submitted successfully"
  );
});
