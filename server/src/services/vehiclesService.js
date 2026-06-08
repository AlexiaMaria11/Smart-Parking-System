import { vehiclesRepository } from "../repositories/vehiclesRepository.js";

export const vehiclesService = {
  getVehiclesByUser(userId) {
    return vehiclesRepository.findAllByUser(userId);
  },

  create({ label, licensePlate, userId }) {
    return vehiclesRepository.create({ label, licensePlate, userId });
  },

  async update(id, userId, { label, licensePlate }) {
    const vehicle = await vehiclesRepository.findById(id);
    if (!vehicle || vehicle.ownerId !== userId) throw new Error("Not found");
    return vehiclesRepository.update(id, { label, licensePlate });
  },

  async remove(id, userId) {
    const vehicle = await vehiclesRepository.findById(id);
    if (!vehicle || vehicle.ownerId !== userId) throw new Error("Not found");
    return vehiclesRepository.remove(id);
  },

  async setDefault(id, userId) {
    const vehicle = await vehiclesRepository.findById(id);
    if (!vehicle || vehicle.ownerId !== userId) throw new Error("Not found");
    return vehiclesRepository.setDefault(id, userId);
  },
};
