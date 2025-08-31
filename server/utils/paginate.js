export const paginate = (model) => {
  return async (req, res, next) => {
    try {
      // Get page & limit from query params or use defaults
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Optional: sorting
      const sortBy = req.query.sortBy || "createdAt";
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

      // Optional: filtering (query parameters can be used as filters)
      const filter = { ...req.query };
      delete filter.page;
      delete filter.limit;
      delete filter.sortBy;
      delete filter.sortOrder;

      // Execute query
      const results = await model
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

      // Count total documents
      const total = await model.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      // Attach pagination info to response
      res.paginatedResults = {
        page,
        limit,
        total,
        totalPages,
        results,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};
