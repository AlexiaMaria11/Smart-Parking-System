import { vehiclesService } from "../services/vehiclesService.js";
import { ok, created } from "../utils/response.js";

export const vehiclesController = {
  async list(req, res, next) {
    try {
      const data = await vehiclesService.getVehiclesByUser(req.user.id);
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { label, licensePlate } = req.body;
      const data = await vehiclesService.create({ label, licensePlate, userId: req.user.id });
      return created(res, data);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { label, licensePlate } = req.body;
      const data = await vehiclesService.update(req.params.id, req.user.id, { label, licensePlate });
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      await vehiclesService.remove(req.params.id, req.user.id);
      return ok(res, null, "Deleted");
    } catch (error) {
      return next(error);
    }
  },

  async setDefault(req, res, next) {
    try {
      const data = await vehiclesService.setDefault(req.params.id, req.user.id);
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },
};
