import { vehiclesService } from "../services/vehiclesService.js";
import { ok } from "../utils/response.js";

export const vehiclesController = {
  list(req, res) {
    return ok(res, vehiclesService.getVehiclesByUser(req.user?.id));
  }
};
