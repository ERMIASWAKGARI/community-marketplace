// routes/serviceRoutes.js
import express from "express";
import Service from "../models/serviceModel.js";
import {
  protect,
  adminOnly,
  providerOnly,
} from "../middlewares/authMiddleware.js";
import {
  createService,
  getServices,
  getMyServices,
  approveService,
} from "../controllers/serviceController.js";
import { uploadServiceImages } from "../middlewares/uploadMiddleware.js";
import paginateAndFilter from "../middlewares/paginateAndFilter.js";

const router = express.Router();

// Public
router.get(
  "/",
  paginateAndFilter(Service, {
    searchFields: ["title", "description", "tags"],
  }),
  getServices
);

// Providers
router.post(
  "/create-service",
  protect,
  providerOnly,
  uploadServiceImages.array("images", 5),
  createService
);
router.get(
  "/me",
  protect,
  paginateAndFilter(Service, {
    searchFields: ["title", "description", "tags"],
    filter: (req) => ({ provider: req.user._id }), // 👈 function, returns object
  }),
  getMyServices
);

// Admin
router.put("/:id/approve", protect, adminOnly, approveService);

export default router;
