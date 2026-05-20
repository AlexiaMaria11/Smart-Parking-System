import { authService } from "../services/authService.js";
import { ok } from "../utils/response.js";

export const authController = {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return ok(res, result, "Login successful");
    } catch (error) {
      return next(error);
    }
  }
};
