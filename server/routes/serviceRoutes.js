// routes/serviceRoutes.js
import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  createService,
  getServices,
  getMyServices,
  approveService,
} from "../controllers/serviceController.js";
import { uploadServiceImages } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/", getServices);

// Providers
router.post(
  "/",
  protect,
  uploadServiceImages.array("images", 5),
  createService
);
router.get("/me", protect, getMyServices);

// Admin
router.put("/:id/approve", protect, adminOnly, approveService);

export default router;
