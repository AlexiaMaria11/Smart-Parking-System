import { prisma } from "../config/db.js";

export const notificationsRepository = {
  findAllByUser(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }
};
