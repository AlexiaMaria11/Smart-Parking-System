import { reservationsService } from "../services/reservationsService.js";
import { ok } from "../utils/response.js";

export const reservationsController = {
  list(req, res) {
    return ok(res, reservationsService.getReservations());
  }
};
