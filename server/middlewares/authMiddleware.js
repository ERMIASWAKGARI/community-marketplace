import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized, token missing", 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object (excluding password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      throw new AppError("User not found", 404);
    }

    next();
  } catch (error) {
    throw new AppError("Not authorized, token invalid", 401);
  }
});

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    // Shouldn't happen if protect is used first
    throw new AppError("Not authorized", 401);
  }

  if (req.user.role !== "admin") {
    throw new AppError("Admin access required", 403);
  }

  next();
};

export const providerOnly = (req, res, next) => {
  if (!req.user) {
    // Shouldn't happen if protect is used first
    throw new AppError("Not authorized", 401);
  }

  if (req.user.role !== "provider") {
    throw new AppError("Provider access required", 403);
  }

  next();
};
