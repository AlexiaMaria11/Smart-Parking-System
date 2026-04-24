import { authService } from "../services/authService.js";
import { ok } from "../utils/response.js";

export const authController = {
  login(req, res, next) {
    try {
      const result = authService.login(req.body);
      return ok(res, result, "Login successful");
    } catch (error) {
      return next(error);
    }
  }
};
