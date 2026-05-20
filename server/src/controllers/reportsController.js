import { reportsService } from "../services/reportsService.js";
import { ok } from "../utils/response.js";

export const reportsController = {
  async overview(req, res, next) {
    try {
      const data = await reportsService.getReportsOverview();
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  }
};
