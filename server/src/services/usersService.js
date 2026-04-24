import { usersRepository } from "../repositories/usersRepository.js";

export const usersService = {
  getUsers() {
    return usersRepository.findAll();
  }
};
