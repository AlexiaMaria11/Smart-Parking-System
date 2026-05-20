import { vehiclesRepository } from "../repositories/vehiclesRepository.js";

export const vehiclesService = {
  getVehiclesByUser(userId) {
    return vehiclesRepository.findAllByUser(userId);
  }
};
