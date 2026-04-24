import { mockVehicles } from "../utils/mockData.js";

export const vehiclesRepository = {
  findAllByUser(userId) {
    return mockVehicles.filter((vehicle) => vehicle.userId === userId);
  }
};
