import { parkingSpotsRepository } from "../repositories/parkingSpotsRepository.js";

export const parkingSpotsService = {
  getParkingSpots() {
    return parkingSpotsRepository.findAll();
  }
};
