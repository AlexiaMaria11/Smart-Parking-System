import { prisma } from "../config/db.js";

export const authRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  createUser({ name, email, passwordHash, role }) {
    return prisma.user.create({
      data: { name, email, passwordHash, role }
    });
  }
};
