import { vehiclesRepository } from "../repositories/vehiclesRepository.js";

export const vehiclesService = {
  getVehiclesByUser(userId = "u2") {
    return vehiclesRepository.findAllByUser(userId);
  }
};
