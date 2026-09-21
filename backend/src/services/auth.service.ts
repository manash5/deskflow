import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/env";
import { PublicAdmin } from "../models/admin.model";
import { adminRepository } from "../repositories/admin.repository";
import { HttpError } from "../utils/httpError";

function toPublic(admin: { id: string; email: string; name: string; createdAt: string }): PublicAdmin {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    createdAt: admin.createdAt,
  };
}

export const authService = {
  async ensureSeedAdmin() {
    const existing = adminRepository.findByEmail(config.adminEmail);
    if (existing) {
      return;
    }
    const passwordHash = await bcrypt.hash(config.adminPassword, 10);
    adminRepository.upsert({
      id: randomUUID(),
      email: config.adminEmail.toLowerCase(),
      name: "Deskflow Admin",
      passwordHash,
      createdAt: new Date().toISOString(),
    });
  },

  async login(email: string, password: string) {
    const admin = adminRepository.findByEmail(email);
    if (!admin) {
      throw new HttpError(401, "Invalid email or password.");
    }
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      throw new HttpError(401, "Invalid email or password.");
    }
    const token = jwt.sign(
      { sub: admin.id, email: admin.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as SignOptions,
    );
    return { token, admin: toPublic(admin) };
  },

  me(adminId: string) {
    const admin = adminRepository.findById(adminId);
    if (!admin) {
      throw new HttpError(401, "Admin no longer exists.");
    }
    return toPublic(admin);
  },
};
