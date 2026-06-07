import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";

export const usersRepository = {
  findAll() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
  },

  findByIdWithHash(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  updateProfile(id, { name, phone }) {
    return prisma.user.update({
      where: { id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  },

  async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  async remove(id) {
    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.payment.deleteMany({ where: { userId: id } });
    await prisma.reservation.deleteMany({ where: { userId: id } });
    await prisma.vehicle.deleteMany({ where: { ownerId: id } });
    return prisma.user.delete({ where: { id } });
  },
};
