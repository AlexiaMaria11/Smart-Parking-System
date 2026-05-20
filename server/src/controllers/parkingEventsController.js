import { parkingEventsService } from "../services/parkingEventsService.js";
import { ok } from "../utils/response.js";

export const parkingEventsController = {
  async list(req, res, next) {
    try {
      const data = await parkingEventsService.getEvents();
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  }
};
