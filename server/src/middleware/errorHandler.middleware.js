function errorHandler(err, req, res, next) {
  const isUploadError = err.name === "MulterError" || /image files are allowed/i.test(err.message || "");
  const statusCode = err.statusCode || (isUploadError ? 400 : 500);
  if (statusCode === 500) {
    console.error(err); // full stack trace for unexpected errors
  }
  res.status(statusCode).json({
    error: err.message || "Something went wrong.",
  });
}

module.exports = errorHandler;
