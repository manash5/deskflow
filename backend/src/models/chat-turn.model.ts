import { sql } from "../db/neon";

export type ChatTurn = {
  id: string;
  agentId: string;
  companyId: string;
  message: string;
  answer: string;
  blocked: boolean;
  blockReason: string;
  route: string;
  categories: string[];
  confidence: number;
  trace: string[];
  createdAt: string;
};

export async function ensureChatTurnTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS chat_turns (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      company_id TEXT NOT NULL,
      message TEXT NOT NULL,
      answer TEXT NOT NULL DEFAULT '',
      blocked BOOLEAN NOT NULL DEFAULT FALSE,
      block_reason TEXT NOT NULL DEFAULT '',
      route TEXT NOT NULL DEFAULT '',
      categories JSONB NOT NULL DEFAULT '[]'::jsonb,
      confidence DOUBLE PRECISION NOT NULL DEFAULT 0,
      trace JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
