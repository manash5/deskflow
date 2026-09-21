export type ChatTurn = {
  id: string;
  agentId: string;
  companyId: string;
  message: string;
  answer: string;
  blocked: boolean;
  blockReason: string;
  route: string;
  categories: string[];
  confidence: number;
  trace: string[];
  createdAt: string;
};
