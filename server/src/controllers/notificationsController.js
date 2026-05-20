import { notificationsService } from "../services/notificationsService.js";
import { ok } from "../utils/response.js";

export const notificationsController = {
  async list(req, res, next) {
    try {
      const data = await notificationsService.getNotificationsByUser(req.user.id);
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  }
};
