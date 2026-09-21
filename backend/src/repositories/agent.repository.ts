import { Agent } from "../models/agent.model";
import { jsonStore } from "./store.repository";

export const agentRepository = {
  list(): Agent[] {
    return [...jsonStore.read().agents].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  listByCustomer(customerId: string): Agent[] {
    return this.list().filter((agent) => agent.customerId === customerId);
  },

  findById(id: string): Agent | undefined {
    return jsonStore.read().agents.find((agent) => agent.id === id);
  },

  findByCompanyId(companyId: string): Agent | undefined {
    return jsonStore
      .read()
      .agents.find((agent) => agent.companyId === companyId);
  },

  save(agent: Agent): Agent {
    jsonStore.update((draft) => {
      const index = draft.agents.findIndex((item) => item.id === agent.id);
      if (index === -1) {
        draft.agents.push(agent);
      } else {
        draft.agents[index] = agent;
      }
    });
    return agent;
  },

  remove(id: string): void {
    jsonStore.update((draft) => {
      draft.agents = draft.agents.filter((item) => item.id !== id);
    });
  },
};
