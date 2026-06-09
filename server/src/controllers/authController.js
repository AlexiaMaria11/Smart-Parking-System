import { authService } from "../services/authService.js";
import { ok, created } from "../utils/response.js";

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return created(res, result, "Account created");
    } catch (error) {
      return next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return ok(res, result, "Login successful");
    } catch (error) {
      return next(error);
    }
  }
};
