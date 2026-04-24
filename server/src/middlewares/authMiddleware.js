export function mockAuth(req, res, next) {
  req.user = {
    id: "u2",
    role: req.headers["x-user-role"] || "CLIENT"
  };
  next();
}
