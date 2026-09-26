import { Admin } from "../models/admin.model";
import { Agent } from "../models/agent.model";
import { ChatTurn } from "../models/chat-turn.model";
import { Customer } from "../models/customer.model";

type Row = Record<string, unknown>;

function toIso(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(String(value)).toISOString();
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapAdmin(row: Row): Admin {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    passwordHash: String(row.password_hash),
    createdAt: toIso(row.created_at),
  };
}

export function mapCustomer(row: Row): Customer {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    company: String(row.company ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function mapAgent(row: Row): Agent {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    companyId: String(row.company_id),
    name: String(row.name),
    persona: String(row.persona),
    enabledAgents: asStringArray(row.enabled_agents),
    contactEmail: String(row.contact_email ?? ""),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export function mapChatTurn(row: Row): ChatTurn {
  return {
    id: String(row.id),
    agentId: String(row.agent_id),
    companyId: String(row.company_id),
    message: String(row.message),
    answer: String(row.answer ?? ""),
    blocked: Boolean(row.blocked),
    blockReason: String(row.block_reason ?? ""),
    route: String(row.route ?? ""),
    categories: asStringArray(row.categories),
    confidence: Number(row.confidence ?? 0),
    trace: asStringArray(row.trace),
    createdAt: toIso(row.created_at),
  };
}
