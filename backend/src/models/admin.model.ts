import { sql } from "../db/neon";

export type Admin = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicAdmin = Omit<Admin, "passwordHash">;

export async function ensureAdminTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
