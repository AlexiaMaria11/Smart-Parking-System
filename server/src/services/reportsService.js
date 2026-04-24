import { reportsRepository } from "../repositories/reportsRepository.js";

export const reportsService = {
  getReportsOverview() {
    return reportsRepository.getOverview();
  }
};
