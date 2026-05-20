import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authRepository } from "../repositories/authRepository.js";
import { env } from "../config/env.js";

export const authService = {
  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }
};
