import { paymentsRepository } from "../repositories/paymentsRepository.js";

export const paymentsService = {
  getPayments({ userId, role } = {}) {
    return paymentsRepository.findAll({ userId, role });
  }
};
