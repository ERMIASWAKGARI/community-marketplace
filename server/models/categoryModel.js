import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Optional: for hierarchical categories (main -> subcategories)
    slug: { type: String, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true, // link to parent
    },
    slug: { type: String, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export const SubCategory = mongoose.model("SubCategory", subCategorySchema);
