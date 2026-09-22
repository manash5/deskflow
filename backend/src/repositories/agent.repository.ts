import { sql } from "../db/neon";
import { mapAgent } from "../db/mappers";
import { Agent } from "../models/agent.model";

export const agentRepository = {
  async list(): Promise<Agent[]> {
    const rows = await sql`
      SELECT id, customer_id, company_id, name, persona, enabled_agents,
             contact_email, created_at, updated_at
      FROM agents
      ORDER BY created_at DESC
    `;
    return rows.map(mapAgent);
  },

  async listByCustomer(customerId: string): Promise<Agent[]> {
    const rows = await sql`
      SELECT id, customer_id, company_id, name, persona, enabled_agents,
             contact_email, created_at, updated_at
      FROM agents
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
    `;
    return rows.map(mapAgent);
  },

  async findById(id: string): Promise<Agent | undefined> {
    const rows = await sql`
      SELECT id, customer_id, company_id, name, persona, enabled_agents,
             contact_email, created_at, updated_at
      FROM agents
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ? mapAgent(rows[0]) : undefined;
  },

  async findByCompanyId(companyId: string): Promise<Agent | undefined> {
    const rows = await sql`
      SELECT id, customer_id, company_id, name, persona, enabled_agents,
             contact_email, created_at, updated_at
      FROM agents
      WHERE company_id = ${companyId}
      LIMIT 1
    `;
    return rows[0] ? mapAgent(rows[0]) : undefined;
  },

  async save(agent: Agent): Promise<Agent> {
    const enabledAgents = JSON.stringify(agent.enabledAgents);
    await sql`
      INSERT INTO agents (
        id, customer_id, company_id, name, persona, enabled_agents,
        contact_email, created_at, updated_at
      )
      VALUES (
        ${agent.id},
        ${agent.customerId},
        ${agent.companyId},
        ${agent.name},
        ${agent.persona},
        CAST(${enabledAgents} AS jsonb),
        ${agent.contactEmail},
        ${agent.createdAt},
        ${agent.updatedAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        persona = EXCLUDED.persona,
        enabled_agents = EXCLUDED.enabled_agents,
        contact_email = EXCLUDED.contact_email,
        updated_at = EXCLUDED.updated_at
    `;
    return agent;
  },

  async remove(id: string): Promise<void> {
    await sql`DELETE FROM agents WHERE id = ${id}`;
  },
};
