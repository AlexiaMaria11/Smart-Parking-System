import bcrypt from "bcryptjs";
import { usersRepository } from "../repositories/usersRepository.js";

export const usersService = {
  getUsers() {
    return usersRepository.findAll();
  },

  updateProfile(id, { name, phone }) {
    return usersRepository.updateProfile(id, { name, phone });
  },

  async changePassword(id, { currentPassword, newPassword }) {
    const user = await usersRepository.findByIdWithHash(id);
    if (!user) throw new Error("Not found");
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error("Parola curentă este incorectă");
    return usersRepository.updatePassword(id, newPassword);
  },

  remove(id) {
    return usersRepository.remove(id);
  },
};
