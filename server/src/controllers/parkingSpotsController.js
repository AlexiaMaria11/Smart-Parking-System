import { parkingSpotsService } from "../services/parkingSpotsService.js";
import { ok } from "../utils/response.js";

export const parkingSpotsController = {
  async list(req, res) {
    try {
      const spots = await parkingSpotsService.getParkingSpots();
      return ok(res, spots);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
