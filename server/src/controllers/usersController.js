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
  },

  async updateProfile(req, res, next) {
    try {
      const { name, phone } = req.body;
      const data = await usersService.updateProfile(req.user.id, { name, phone });
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await usersService.changePassword(req.user.id, { currentPassword, newPassword });
      return ok(res, null, "Parolă schimbată cu succes");
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      await usersService.remove(req.user.id);
      return ok(res, null, "Cont șters");
    } catch (error) {
      return next(error);
    }
  },
};
