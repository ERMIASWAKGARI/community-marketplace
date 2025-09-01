import slugify from "slugify";
import { Category, SubCategory } from "../models/categoryModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { successResponse } from "../utils/response.js";

// Create a main category
export const createCategory = asyncHandler(async (req, res) => {
  console.log("Creating category...", req.body);
  const { name, description } = req.body;
  const slug = slugify(name, { lower: true });

  const existing = await Category.findOne({ slug });
  if (existing) throw new AppError("Category already exists", 400);

  const category = await Category.create({ name, description, slug });
  return successResponse(
    res,
    201,
    { category },
    "Category created successfully"
  );
});

// Create a subcategory
export const createSubCategory = asyncHandler(async (req, res) => {
  const { name, categoryId } = req.body;
  const slug = slugify(name, { lower: true });

  const parent = await Category.findById(categoryId);
  if (!parent) throw new AppError("Parent category not found", 404);

  const existing = await SubCategory.findOne({ slug, category: categoryId });
  if (existing) throw new AppError("Subcategory already exists", 400);

  const subcategory = await SubCategory.create({
    name,
    category: categoryId,
    slug,
  });

  return successResponse(
    res,
    201,
    { subcategory },
    "Subcategory created successfully"
  );
});

// Optional: fetch lists
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().lean();
  return successResponse(
    res,
    200,
    { categories },
    "Categories fetched successfully"
  );
});

export const getSubCategories = asyncHandler(async (req, res) => {
  const subcategories = await SubCategory.find()
    .populate("category", "name")
    .lean();
  return successResponse(
    res,
    200,
    { subcategories },
    "Subcategories fetched successfully"
  );
});
