import { sql } from "../db/neon";
import { mapChatTurn } from "../db/mappers";
import { ChatTurn } from "../models/chat-turn.model";

export const chatTurnRepository = {
  async listByAgent(agentId: string): Promise<ChatTurn[]> {
    const rows = await sql`
      SELECT id, agent_id, company_id, message, answer, blocked, block_reason,
             route, categories, confidence, trace, created_at
      FROM chat_turns
      WHERE agent_id = ${agentId}
      ORDER BY created_at DESC
    `;
    return rows.map(mapChatTurn);
  },

  async listAll(): Promise<ChatTurn[]> {
    const rows = await sql`
      SELECT id, agent_id, company_id, message, answer, blocked, block_reason,
             route, categories, confidence, trace, created_at
      FROM chat_turns
      ORDER BY created_at DESC
    `;
    return rows.map(mapChatTurn);
  },

  async save(turn: ChatTurn): Promise<ChatTurn> {
    const categories = JSON.stringify(turn.categories);
    const trace = JSON.stringify(turn.trace);
    await sql`
      INSERT INTO chat_turns (
        id, agent_id, company_id, message, answer, blocked, block_reason,
        route, categories, confidence, trace, created_at
      )
      VALUES (
        ${turn.id},
        ${turn.agentId},
        ${turn.companyId},
        ${turn.message},
        ${turn.answer},
        ${turn.blocked},
        ${turn.blockReason},
        ${turn.route},
        CAST(${categories} AS jsonb),
        ${turn.confidence},
        CAST(${trace} AS jsonb),
        ${turn.createdAt}
      )
    `;
    return turn;
  },
};
