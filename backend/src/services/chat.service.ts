import { randomUUID } from "crypto";
import { agentRepository } from "../repositories/agent.repository";
import { chatTurnRepository } from "../repositories/chat-turn.repository";
import { HttpError } from "../utils/httpError";
import { agentClient } from "./agent-client.service";
import { agentService } from "./agent.service";

export const chatService = {
  async send(agentId: string, message: string) {
    const text = (message || "").trim();
    if (!text) {
      throw new HttpError(400, "message is required.");
    }
    const agent = agentRepository.findById(agentId);
    if (!agent) {
      throw new HttpError(404, "Agent not found.");
    }
    const result = await agentClient.chat(agent.companyId, text);
    return chatTurnRepository.save({
      id: randomUUID(),
      agentId: agent.id,
      companyId: agent.companyId,
      message: text,
      answer: result.answer,
      blocked: result.blocked,
      blockReason: result.block_reason || "",
      route: result.route || "",
      categories: result.categories || [],
      confidence: result.confidence || 0,
      trace: result.trace || [],
      createdAt: new Date().toISOString(),
    });
  },

  async sendPublic(companyId: string, message: string) {
    const agent = agentService.getByCompanyId(companyId);
    return this.send(agent.id, message);
  },

  history(agentId: string) {
    if (!agentRepository.findById(agentId)) {
      throw new HttpError(404, "Agent not found.");
    }
    return chatTurnRepository.listByAgent(agentId);
  },
};
