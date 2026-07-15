function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) {
    console.error(err); // full stack trace for unexpected errors
  }
  res.status(statusCode).json({
    error: err.message || "Something went wrong.",
  });
}

module.exports = errorHandler;
