import { prisma } from "../config/db.js";

export const reservationsRepository = {
  findAll({ userId, role } = {}) {
    const where = role === "CLIENT" ? { userId } : {};
    return prisma.reservation.findMany({
      where,
      include: {
        parkingSpot: { select: { id: true, code: true, pricePerHour: true } },
        vehicle: { select: { id: true, label: true, licensePlate: true } },
        user: { select: { id: true, name: true, email: true } },
        payments: { select: { id: true, status: true, amount: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id) {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        parkingSpot: true,
        vehicle: true,
        user: true,
      },
    });
  },

  create({ userId, vehicleId, parkingSpotId, startTime, endTime, totalCost }) {
    return prisma.reservation.create({
      data: { userId, vehicleId, parkingSpotId, startTime, endTime, totalCost, status: "UPCOMING" },
      include: {
        parkingSpot: { select: { id: true, code: true, pricePerHour: true } },
        vehicle: { select: { id: true, label: true, licensePlate: true } },
      },
    });
  },

  cancel(id) {
    return prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  },

  extend(id, newEndTime, newTotalCost) {
    return prisma.reservation.update({
      where: { id },
      data: { endTime: newEndTime, totalCost: newTotalCost },
    });
  },
};
