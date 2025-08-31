import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/userModel.js";
import { AppError } from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import { successResponse } from "../utils/response.js";

// List all pending provider verification requests
export const getPendingVerifications = asyncHandler(async (req, res) => {
  const users = await User.find({ "providerVerification.status": "pending" })
    .select("name email providerVerification")
    .lean();

  return successResponse(
    res,
    200,
    { users },
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
  user.role = "provider"; // upgrade user role

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
      await cloudinary.uploader.destroy(doc.public_id, {
        resource_type: "auto",
      });
    }
  }

  await user.save();

  return successResponse(
    res,
    200,
    { user: user.providerVerification },
    "Provider verification rejected"
  );
});
