import { mockPayments } from "../utils/mockData.js";

export const paymentsRepository = {
  findAll() {
    return mockPayments;
  }
};
