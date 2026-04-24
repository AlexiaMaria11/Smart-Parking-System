import { mockReports } from "../utils/mockData.js";

export const reportsRepository = {
  getOverview() {
    return mockReports;
  }
};
