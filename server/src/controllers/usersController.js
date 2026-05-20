import { usersService } from "../services/usersService.js";
import { ok } from "../utils/response.js";

export const usersController = {
  async list(req, res, next) {
    try {
      const data = await usersService.getUsers();
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  }
};
