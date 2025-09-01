// middlewares/paginateAndFilter.js
import { asyncHandler } from "../utils/asyncHandler.js";

const paginateAndFilter = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || options.defaultSortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Filtering
    let filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status)
      filter["providerVerification.status"] = req.query.status;
    // if (options.filter) Object.assign(filter, options.filter);

    if (options.filter) {
      const customFilter =
        typeof options.filter === "function"
          ? options.filter(req)
          : options.filter;
      filter = { ...filter, ...customFilter };
    }

    if (req.query.search) {
      filter.$or =
        options.searchFields?.map((field) => ({
          [field]: { $regex: req.query.search, $options: "i" },
        })) || [];
    }
    console.log(filter);

    // Count total
    const total = await Model.countDocuments(filter);

    // Query with projection if specified
    let query = Model.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    if (options.select) {
      query = query.select(options.select);
    }

    const results = await query.lean();

    // Attach to response for controllers
    res.paginatedResults = {
      results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    next();
  });

export default paginateAndFilter;
