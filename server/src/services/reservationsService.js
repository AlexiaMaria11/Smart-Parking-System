import { reservationsRepository } from "../repositories/reservationsRepository.js";

export const reservationsService = {
  getReservations() {
    return reservationsRepository.findAll();
  }
};
