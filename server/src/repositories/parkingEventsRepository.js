import { prisma } from "../config/db.js";

export const parkingEventsRepository = {
  findAll() {
    return prisma.parkingEvent.findMany({
      include: {
        parkingSpot: { select: { id: true, code: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }
};
