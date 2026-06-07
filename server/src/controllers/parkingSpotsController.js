import { parkingSpotsService } from "../services/parkingSpotsService.js";
import { ok } from "../utils/response.js";

export const parkingSpotsController = {
  async list(req, res, next) {
    try {
      const spots = await parkingSpotsService.getParkingSpots();
      return ok(res, spots);
    } catch (error) {
      return next(error);
    }
  },

  async release(req, res, next) {
    try {
      const io = req.app.get("io");
      const data = await parkingSpotsService.release(req.params.id, io);
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },

  async setDefective(req, res, next) {
    try {
      const io = req.app.get("io");
      const data = await parkingSpotsService.setDefective(req.params.id, io);
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },
};
