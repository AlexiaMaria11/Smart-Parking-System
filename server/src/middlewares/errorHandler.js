export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(error, req, res, next) {
  res.status(500).json({
    message: error.message || "Server error"
  });
}
