import { parkingSpotsRepository } from "../repositories/parkingSpotsRepository.js";

export const parkingSpotsService = {
  async getParkingSpots() {
    return await parkingSpotsRepository.findAll();
  },
};
