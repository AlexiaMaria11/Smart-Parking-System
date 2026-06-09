import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authRepository } from "../repositories/authRepository.js";
import { env } from "../config/env.js";

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export const authService = {
  async register({ name, email, password }) {
    const role = "CLIENT";
    const existing = await authRepository.findByEmail(email);
    if (existing) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepository.createUser({ name, email, passwordHash, role });

    const token = signToken(user);
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const token = signToken(user);

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }
};
