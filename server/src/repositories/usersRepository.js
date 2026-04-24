import { mockUsers } from "../utils/mockData.js";

export const usersRepository = {
  findAll() {
    return mockUsers;
  }
};
