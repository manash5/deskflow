import { sql } from "../db/neon";

export type Agent = {
  id: string;
  customerId: string;
  companyId: string;
  name: string;
  persona: string;
  enabledAgents: string[];
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
};

export async function ensureAgentTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      company_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      persona TEXT NOT NULL,
      enabled_agents JSONB NOT NULL DEFAULT '[]'::jsonb,
      contact_email TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
