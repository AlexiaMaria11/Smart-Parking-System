import { reservationsService } from "../services/reservationsService.js";
import { ok, created } from "../utils/response.js";

export const reservationsController = {
  async list(req, res, next) {
    try {
      const data = await reservationsService.getReservations({ userId: req.user.id, role: req.user.role });
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { vehicleId, parkingSpotId, startTime, endTime } = req.body;
      const data = await reservationsService.create({
        userId: req.user.id, vehicleId, parkingSpotId, startTime, endTime,
      });
      return created(res, data);
    } catch (error) {
      return next(error);
    }
  },

  async cancel(req, res, next) {
    try {
      const data = await reservationsService.cancel(req.params.id, req.user.id, req.user.role);
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },

  async extend(req, res, next) {
    try {
      const extraHours = req.body.extraHours ?? 1;
      const data = await reservationsService.extend(req.params.id, req.user.id, req.user.role, extraHours);
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },
};
