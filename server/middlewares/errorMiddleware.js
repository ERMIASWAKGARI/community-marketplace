export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Handle Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle Mongoose duplicate key error
  if (err.code && err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue);
    message = `${field} already exists`;
  }

  // Handle invalid ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, please log in again";
  }

  // Handle token expiration
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired, please log in again";
  }

  // Final response
  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
