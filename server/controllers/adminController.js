import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { AppError } from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import { successResponse } from "../utils/response.js";

// ✅ Get paginated, sortable, filterable list of users
export const getUsers = asyncHandler(async (req, res) => {
  console.log("Admin fetching users with query:", req.query);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  // Filtering (example: role, email, status, etc.)
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status)
    filter["providerVerification.status"] = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Query DB
  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select("name email role providerVerification createdAt")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  return successResponse(
    res,
    200,
    { users, page, limit, total },
    "Users retrieved successfully"
  );
});

// List all pending provider verification requests
export const getPendingVerifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const sortBy = req.query.sortBy || "createdAt"; // default field
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // default desc

  const filter = { "providerVerification.status": "pending" };

  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select("name email providerVerification createdAt")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  return successResponse(
    res,
    200,
    { users, page, limit, total },
    "Pending verifications retrieved successfully"
  );
});

// Approve provider
export const approveVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new AppError("User not found", 404);

  if (user.providerVerification.status !== "pending")
    throw new AppError("Verification not pending", 400);

  user.providerVerification.status = "verified";
  user.providerVerification.reviewedAt = new Date();
  user.providerVerification.reviewer = req.user._id;
  user.role = "provider";

  await user.save();

  return successResponse(
    res,
    200,
    { user: user.providerVerification },
    "Provider verified successfully"
  );
});

// Reject provider
export const rejectVerification = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const user = await User.findById(req.params.userId);
  if (!user) throw new AppError("User not found", 404);

  if (user.providerVerification.status !== "pending")
    throw new AppError("Verification not pending", 400);

  user.providerVerification.status = "rejected";
  user.providerVerification.rejectionReason = reason || "No reason specified";
  user.providerVerification.reviewedAt = new Date();
  user.providerVerification.reviewer = req.user._id;

  // Optional: remove docs from Cloudinary
  if (user.providerVerification.documents?.length) {
    for (const doc of user.providerVerification.documents) {
      await cloudinary.uploader.destroy(doc.public_id);
    }

    // Clear documents array from DB
    user.providerVerification.documents = [];
  }

  await user.save();

  return successResponse(
    res,
    200,
    { user: user.providerVerification },
    "Provider verification rejected"
  );
});
