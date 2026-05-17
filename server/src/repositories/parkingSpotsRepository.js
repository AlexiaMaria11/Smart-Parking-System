import { prisma } from "../lib/prisma.js";

export const parkingSpotsRepository = {
  async findAll() {
    return await prisma.parkingSpot.findMany({
      orderBy: { code: "asc" },
    });
  },
};
