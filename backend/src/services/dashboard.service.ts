import { agentRepository } from "../repositories/agent.repository";
import { chatTurnRepository } from "../repositories/chat-turn.repository";
import { customerRepository } from "../repositories/customer.repository";
import { agentClient } from "./agent-client.service";

export const dashboardService = {
  async overview() {
    const customers = customerRepository.list();
    const agents = agentRepository.list();
    const turns = chatTurnRepository.listAll();
    const blocked = turns.filter((turn) => turn.blocked).length;
    const agentHealth = await agentClient.health();
    return {
      customers: customers.length,
      agents: agents.length,
      chats: turns.length,
      blocked,
      agentOnline: Boolean(agentHealth?.ok),
      recent: turns.slice(0, 8),
    };
  },
};
