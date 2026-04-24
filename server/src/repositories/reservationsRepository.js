import { mockReservations } from "../utils/mockData.js";

export const reservationsRepository = {
  findAll() {
    return mockReservations;
  }
};
