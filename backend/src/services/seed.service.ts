import { randomUUID } from "crypto";
import { DEFAULT_PERSONA, SPECIALIST_IDS } from "../config/specialists";
import { agentRepository } from "../repositories/agent.repository";
import { customerRepository } from "../repositories/customer.repository";
import { agentClient } from "./agent-client.service";
import { authService } from "./auth.service";

export async function seedIfEmpty() {
  await authService.ensureSeedAdmin();

  if ((await customerRepository.list()).length > 0) {
    return;
  }

  const now = new Date().toISOString();
  const customer = await customerRepository.save({
    id: randomUUID(),
    name: "Scalina Media",
    email: "info@scalinamedia.com",
    company: "Scalina Media",
    notes: "Seed customer matching the agent registry.",
    createdAt: now,
    updatedAt: now,
  });

  const agent = await agentRepository.save({
    id: randomUUID(),
    customerId: customer.id,
    companyId: "scalina",
    name: "Scalina support",
    persona: DEFAULT_PERSONA,
    enabledAgents: [...SPECIALIST_IDS],
    contactEmail: "info@scalinamedia.com",
    createdAt: now,
    updatedAt: now,
  });

  try {
    await agentClient.upsertCompany({
      id: agent.companyId,
      name: customer.company,
      contact_email: agent.contactEmail,
      enabled_agents: agent.enabledAgents,
      persona: agent.persona,
    });
  } catch {
    // Agent process may be down during first boot.
  }
}
