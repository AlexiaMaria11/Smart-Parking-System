import { prisma } from "../config/db.js";

export const reservationsRepository = {
  findAll({ userId, role } = {}) {
    const where = role === "CLIENT" ? { userId } : {};
    return prisma.reservation.findMany({
      where,
      include: {
        parkingSpot: { select: { id: true, code: true, pricePerHour: true } },
        vehicle: { select: { id: true, label: true, licensePlate: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
};
