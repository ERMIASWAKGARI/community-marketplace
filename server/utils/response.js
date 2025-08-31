export const successResponse = (
  res,
  statusCode,
  data,
  message = "Success",
  length = 0
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    results: length ? length : undefined,
    data,
  });
};
