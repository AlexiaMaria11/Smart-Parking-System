import { prisma } from "../config/db.js";

export const authRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }
};
