// controllers/serviceController.js
import Service from "../models/serviceModel.js";
import { Category } from "../models/categoryModel.js";
import { AppError } from "../utils/appError.js";
import { successResponse } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js"; // make sure you have config
import { moderateImage } from "../utils/moderateImage.js"; // same as your avatar check

export const createService = asyncHandler(async (req, res) => {
  const { title, description, category, subcategory, price, tags } = req.body;

  if (!req.files || req.files.length === 0) {
    throw new AppError("At least one service image is required", 400);
  }

  // 1. Moderate + upload all images to Cloudinary
  const uploadResults = [];
  for (const file of req.files) {
    await moderateImage(file.path);

    const result = await cloudinary.uploader.upload(file.path, {
      folder: `services/${req.user._id}`,
      transformation: [{ width: 800, height: 600, crop: "limit" }], // standard resize
    });

    uploadResults.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  // 2. Create the service
  const newService = await Service.create({
    provider: req.user._id,
    title,
    description,
    category,
    subcategory,
    price,
    tags,
    images: uploadResults, // Cloudinary results only
  });

  return successResponse(
    res,
    201,
    { service: newService },
    "Service created successfully"
  );
});

// Get All Services (public marketplace)
export const getServices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: "active", isApproved: true };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.subcategory) filter.subcategory = req.query.subcategory;
  if (req.query.search) {
    filter.$or = [
      { title: new RegExp(req.query.search, "i") },
      { description: new RegExp(req.query.search, "i") },
      { tags: { $in: [req.query.search.toLowerCase()] } },
    ];
  }

  const total = await Service.countDocuments(filter);
  const services = await Service.find(filter)
    .populate("provider", "name email")
    .populate("category", "name")
    .populate("subcategory", "name")
    .skip(skip)
    .limit(limit)
    .lean();

  return successResponse(
    res,
    200,
    { services, page, totalPages: Math.ceil(total / limit) },
    "Services retrieved"
  );
});

// Provider's Services
export const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ provider: req.user._id });
  return successResponse(res, 200, { services }, "Your services retrieved");
});

// Admin approval
export const approveService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new AppError("Service not found", 404);

  service.isApproved = true;
  service.status = "active";
  await service.save();

  return successResponse(res, 200, { service }, "Service approved");
});
