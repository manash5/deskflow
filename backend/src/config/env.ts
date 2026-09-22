import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "deskflow-dev-jwt-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  agentBaseUrl: (process.env.AGENT_BASE_URL || "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  ),
  adminEmail: process.env.ADMIN_EMAIL || "admin@deskflow.local",
  adminPassword: process.env.ADMIN_PASSWORD || "deskflow-admin",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  neonDbUrl: process.env.NEON_DB_URL || process.env.DATABASE_URL || "",
};
