import { reservationsService } from "../services/reservationsService.js";
import { ok } from "../utils/response.js";

export const reservationsController = {
  async list(req, res, next) {
    try {
      const data = await reservationsService.getReservations({ userId: req.user.id, role: req.user.role });
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  }
};
