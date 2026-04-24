import { parkingSpotsService } from "../services/parkingSpotsService.js";
import { ok } from "../utils/response.js";

export const parkingSpotsController = {
  list(req, res) {
    return ok(res, parkingSpotsService.getParkingSpots());
  }
};
