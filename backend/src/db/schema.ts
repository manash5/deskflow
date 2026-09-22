import { ensureAdminTable } from "../models/admin.model";
import { ensureAgentTable } from "../models/agent.model";
import { ensureChatTurnTable } from "../models/chat-turn.model";
import { ensureCustomerTable } from "../models/customer.model";

/**
 * Runs each model's CREATE TABLE in FK-safe order.
 * Table SQL lives on the model files; this file only orchestrates boot.
 */
export async function ensureSchema() {
  await ensureAdminTable();
  await ensureCustomerTable();
  await ensureAgentTable();
  await ensureChatTurnTable();
}
