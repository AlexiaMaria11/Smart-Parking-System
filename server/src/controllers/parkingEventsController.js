import { parkingEventsService } from "../services/parkingEventsService.js";
import { ok } from "../utils/response.js";

export const parkingEventsController = {
  list(req, res) {
    return ok(res, parkingEventsService.getEvents());
  }
};
