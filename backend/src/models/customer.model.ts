import { sql } from "../db/neon";

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export async function ensureCustomerTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
