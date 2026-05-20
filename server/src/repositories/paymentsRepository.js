import { prisma } from "../config/db.js";

export const paymentsRepository = {
  findAll({ userId, role } = {}) {
    const where = role === "CLIENT" ? { userId } : {};
    return prisma.payment.findMany({
      where,
      include: {
        reservation: {
          include: {
            parkingSpot: { select: { code: true } },
            vehicle: { select: { licensePlate: true } }
          }
        },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }
};
