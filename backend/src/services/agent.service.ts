import { randomUUID } from "crypto";
import { DEFAULT_PERSONA, SPECIALIST_IDS } from "../config/specialists";
import { Agent } from "../models/agent.model";
import { agentRepository } from "../repositories/agent.repository";
import { chatTurnRepository } from "../repositories/chat-turn.repository";
import { customerRepository } from "../repositories/customer.repository";
import { HttpError } from "../utils/httpError";
import { agentClient } from "./agent-client.service";

type AgentInput = {
  customerId: string;
  name: string;
  companyId: string;
  persona?: string;
  enabledAgents?: string[];
  contactEmail?: string;
};

const COMPANY_ID = /^[a-zA-Z0-9_-]+$/;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function normalizeEnabled(ids: string[] | undefined) {
  const unique = [...new Set((ids || []).filter((id) => SPECIALIST_IDS.includes(id)))];
  return unique.length ? unique : [...SPECIALIST_IDS];
}

async function syncAgent(agent: Agent, customerName: string) {
  try {
    await agentClient.upsertCompany({
      id: agent.companyId,
      name: customerName,
      contact_email: agent.contactEmail,
      enabled_agents: agent.enabledAgents,
      persona: agent.persona,
    });
  } catch {
    // Persist locally even if the graph process is down.
  }
}

export const agentService = {
  list() {
    return agentRepository.list().map((agent) => {
      const customer = customerRepository.findById(agent.customerId);
      const turns = chatTurnRepository.listByAgent(agent.id);
      return {
        ...agent,
        customerName: customer?.name || "",
        chats: turns.length,
        blocked: turns.filter((turn) => turn.blocked).length,
        lastUsedAt: turns[0]?.createdAt ?? null,
      };
    });
  },

  get(id: string) {
    const agent = agentRepository.findById(id);
    if (!agent) {
      throw new HttpError(404, "Agent not found.");
    }
    const customer = customerRepository.findById(agent.customerId);
    return { ...agent, customerName: customer?.name || "", customer };
  },

  getByCompanyId(companyId: string) {
    const agent = agentRepository.findByCompanyId(companyId);
    if (!agent) {
      throw new HttpError(404, "Agent not found.");
    }
    return agent;
  },

  publicCard(companyId: string) {
    const agent = this.getByCompanyId(companyId);
    const customer = customerRepository.findById(agent.customerId);
    return {
      companyId: agent.companyId,
      name: agent.name,
      companyName: customer?.company || customer?.name || agent.name,
    };
  },

  async create(input: AgentInput) {
    const customer = customerRepository.findById(input.customerId);
    if (!customer) {
      throw new HttpError(404, "Customer not found.");
    }
    const companyId = (input.companyId || slugify(input.name) || slugify(customer.name)).trim();
    if (!COMPANY_ID.test(companyId)) {
      throw new HttpError(
        400,
        "companyId must be letters, numbers, underscore, or hyphen.",
      );
    }
    if (agentRepository.findByCompanyId(companyId)) {
      throw new HttpError(409, "That company id is already in use.");
    }
    const now = new Date().toISOString();
    const agent: Agent = {
      id: randomUUID(),
      customerId: customer.id,
      companyId,
      name: (input.name || "").trim() || `${customer.name} support`,
      persona: (input.persona || "").trim() || DEFAULT_PERSONA,
      enabledAgents: normalizeEnabled(input.enabledAgents),
      contactEmail: (input.contactEmail || customer.email).trim(),
      createdAt: now,
      updatedAt: now,
    };
    agentRepository.save(agent);
    await syncAgent(agent, customer.company || customer.name);
    return agent;
  },

  async update(id: string, input: Partial<AgentInput>) {
    const current = agentRepository.findById(id);
    if (!current) {
      throw new HttpError(404, "Agent not found.");
    }
    const customer = customerRepository.findById(current.customerId);
    const next: Agent = {
      ...current,
      name: input.name !== undefined ? input.name.trim() : current.name,
      persona: input.persona !== undefined ? input.persona.trim() || DEFAULT_PERSONA : current.persona,
      enabledAgents:
        input.enabledAgents !== undefined
          ? normalizeEnabled(input.enabledAgents)
          : current.enabledAgents,
      contactEmail:
        input.contactEmail !== undefined
          ? input.contactEmail.trim()
          : current.contactEmail,
      updatedAt: new Date().toISOString(),
    };
    agentRepository.save(next);
    await syncAgent(next, customer?.company || customer?.name || next.name);
    return next;
  },

  async knowledge(id: string) {
    const agent = this.get(id);
    return agentClient.knowledge(agent.companyId);
  },

  async ingest(
    id: string,
    files: { buffer: Buffer; originalname: string; mimetype: string }[],
  ) {
    const agent = this.get(id);
    const customer = customerRepository.findById(agent.customerId);
    await syncAgent(agent, customer?.company || customer?.name || agent.name);
    return agentClient.ingest(agent.companyId, files);
  },

  performance(id: string) {
    const agent = this.get(id);
    const turns = chatTurnRepository.listByAgent(id);
    const blocked = turns.filter((turn) => turn.blocked).length;
    const routes: Record<string, number> = {};
    let confidenceSum = 0;
    for (const turn of turns) {
      const key = turn.route || "unknown";
      routes[key] = (routes[key] || 0) + 1;
      confidenceSum += turn.confidence || 0;
    }
    return {
      agent,
      totals: {
        chats: turns.length,
        blocked,
        blockRate: turns.length ? blocked / turns.length : 0,
        avgConfidence: turns.length ? confidenceSum / turns.length : 0,
      },
      routes,
      recent: turns.slice(0, 20),
    };
  },
};
