import { authRepository } from "../repositories/authRepository.js";

export const authService = {
  login({ email }) {
    const user = authRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      user,
      token: `mock-token-${user.role.toLowerCase()}`
    };
  }
};
