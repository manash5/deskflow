export type AgentLane = "active" | "unused" | "review";

export function agentLane(agent: {
  chats?: number;
  blocked?: number;
  lastUsedAt?: string | null;
}): AgentLane {
  if ((agent.blocked || 0) > 0 && (agent.chats || 0) > 0) return "review";
  if (agent.lastUsedAt || (agent.chats || 0) > 0) return "active";
  return "unused";
}

export function laneLabel(lane: AgentLane) {
  if (lane === "active") return "Active";
  if (lane === "review") return "Needs review";
  return "Unused";
}
