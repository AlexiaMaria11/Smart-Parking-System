import { reportsService } from "../services/reportsService.js";
import { ok } from "../utils/response.js";

export const reportsController = {
  overview(req, res) {
    return ok(res, reportsService.getReportsOverview());
  }
};
