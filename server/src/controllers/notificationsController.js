import { notificationsService } from "../services/notificationsService.js";
import { ok } from "../utils/response.js";

export const notificationsController = {
  list(req, res) {
    return ok(res, notificationsService.getNotificationsByUser(req.user?.id));
  }
};
