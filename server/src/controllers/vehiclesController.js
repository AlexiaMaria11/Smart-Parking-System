import { vehiclesService } from "../services/vehiclesService.js";
import { ok } from "../utils/response.js";

export const vehiclesController = {
  async list(req, res, next) {
    try {
      const data = await vehiclesService.getVehiclesByUser(req.user.id);
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  }
};
