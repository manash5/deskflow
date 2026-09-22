import { agentRepository } from "../repositories/agent.repository";
import { chatTurnRepository } from "../repositories/chat-turn.repository";
import { customerRepository } from "../repositories/customer.repository";
import { agentClient } from "./agent-client.service";

export const dashboardService = {
  async overview() {
    const [customers, agents, turns, agentHealth] = await Promise.all([
      customerRepository.list(),
      agentRepository.list(),
      chatTurnRepository.listAll(),
      agentClient.health(),
    ]);
    const blocked = turns.filter((turn) => turn.blocked).length;
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
