// routes/adminCategoryRoutes.js
import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  createCategory,
  createSubCategory,
  getCategories,
  getSubCategories,
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/create-category", protect, adminOnly, createCategory);
router.post("/create-subcategory", protect, adminOnly, createSubCategory);

router.get("/categories", getCategories);
router.get("/subcategories", getSubCategories);

export default router;
