import { ChatTurn } from "../models/chat-turn.model";
import { jsonStore } from "./store.repository";

export const chatTurnRepository = {
  listByAgent(agentId: string): ChatTurn[] {
    return jsonStore
      .read()
      .chatTurns.filter((turn) => turn.agentId === agentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  listAll(): ChatTurn[] {
    return [...jsonStore.read().chatTurns].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  save(turn: ChatTurn): ChatTurn {
    jsonStore.update((draft) => {
      draft.chatTurns.push(turn);
    });
    return turn;
  },
};
