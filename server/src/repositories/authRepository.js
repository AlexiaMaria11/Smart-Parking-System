import { mockUsers } from "../utils/mockData.js";

export const authRepository = {
  findByEmail(email) {
    return mockUsers.find((user) => user.email === email);
  }
};
