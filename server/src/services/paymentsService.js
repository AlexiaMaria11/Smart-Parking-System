import { paymentsRepository } from "../repositories/paymentsRepository.js";

export const paymentsService = {
  getPayments() {
    return paymentsRepository.findAll();
  }
};
