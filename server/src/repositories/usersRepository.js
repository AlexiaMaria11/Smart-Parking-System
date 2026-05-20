import { prisma } from "../config/db.js";

export const usersRepository = {
  findAll() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
  },

  findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
  }
};
