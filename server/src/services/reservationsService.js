import { reservationsRepository } from "../repositories/reservationsRepository.js";

export const reservationsService = {
  getReservations({ userId, role } = {}) {
    return reservationsRepository.findAll({ userId, role });
  }
};
