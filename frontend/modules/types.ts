export type Admin = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  agentCount?: number;
  agents?: Agent[];
};

export type Agent = {
  id: string;
  customerId: string;
  companyId: string;
  name: string;
  persona: string;
  enabledAgents: string[];
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  chats?: number;
  blocked?: number;
  lastUsedAt?: string | null;
};

export type Specialist = {
  id: string;
  label: string;
  summary: string;
};

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

export type Dashboard = {
  customers: number;
  agents: number;
  chats: number;
  blocked: number;
  agentOnline: boolean;
  recent: ChatTurn[];
};

export type Performance = {
  agent: Agent;
  totals: {
    chats: number;
    blocked: number;
    blockRate: number;
    avgConfidence: number;
  };
  routes: Record<string, number>;
  recent: ChatTurn[];
};
