import { prisma } from "../config/db.js";

export const vehiclesRepository = {
  findAllByUser(userId) {
    return prisma.vehicle.findMany({
      where: { ownerId: userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }]
    });
  }
};
