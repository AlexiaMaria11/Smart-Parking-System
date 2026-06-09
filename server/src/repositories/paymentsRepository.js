import { prisma } from "../config/db.js";

export const paymentsRepository = {
  findAll({ userId, role } = {}) {
    const where = role === "CLIENT" ? { userId } : {};
    return prisma.payment.findMany({
      where,
      include: {
        reservation: {
          include: {
            parkingSpot: { select: { code: true, pricePerHour: true } },
            vehicle: { select: { licensePlate: true, label: true } },
          },
        },
        parkingSpot: { select: { code: true, pricePerHour: true } },
        vehicle: { select: { licensePlate: true, label: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            parkingSpot: { select: { code: true, pricePerHour: true } },
          },
        },
        parkingSpot: { select: { code: true, pricePerHour: true } },
      },
    });
  },

  pay(id, finalAmount) {
    return prisma.payment.update({
      where: { id },
      data: { status: "PAID", amount: finalAmount },
    });
  },
};
