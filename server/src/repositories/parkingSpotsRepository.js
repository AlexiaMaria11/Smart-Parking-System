import { prisma } from "../config/db.js";

export const parkingSpotsRepository = {
  async findAll() {
    return await prisma.parkingSpot.findMany({
      orderBy: { code: "asc" },
    });
  },

  async release(id) {
    return prisma.parkingSpot.update({
      where: { id },
      data: { isAvailable: true },
    });
  },

  async setDefective(id) {
    return prisma.parkingSpot.update({
      where: { id },
      data: { isAvailable: false },
    });
  },
};
