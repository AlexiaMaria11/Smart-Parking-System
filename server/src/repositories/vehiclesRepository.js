import { prisma } from "../config/db.js";

export const vehiclesRepository = {
  findAllByUser(userId) {
    return prisma.vehicle.findMany({
      where: { ownerId: userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  },

  create({ label, licensePlate, userId }) {
    return prisma.vehicle.create({
      data: { label, licensePlate, isDefault: false, ownerId: userId },
    });
  },

  update(id, { label, licensePlate }) {
    return prisma.vehicle.update({
      where: { id },
      data: { label, licensePlate },
    });
  },

  remove(id) {
    return prisma.vehicle.delete({ where: { id } });
  },

  async setDefault(id, userId) {
    await prisma.vehicle.updateMany({
      where: { ownerId: userId },
      data: { isDefault: false },
    });
    return prisma.vehicle.update({
      where: { id },
      data: { isDefault: true },
    });
  },

  findById(id) {
    return prisma.vehicle.findUnique({ where: { id } });
  },
};
