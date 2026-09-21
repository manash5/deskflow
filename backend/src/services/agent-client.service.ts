import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { config } from "../config/env";
import { HttpError } from "../utils/httpError";

export type AgentChatResponse = {
  company_id: string;
  answer: string;
  blocked: boolean;
  block_reason: string;
  route: string;
  categories: string[];
  confidence: number;
  trace: string[];
};

export type AgentCompanyPayload = {
  id: string;
  name: string;
  contact_email: string;
  enabled_agents: string[];
  persona: string;
};

const client = axios.create({
  baseURL: config.agentBaseUrl,
  timeout: 120_000,
});

function wrapAgentError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError<{ detail?: string }>;
    const detail =
      (typeof ax.response?.data === "object" && ax.response.data?.detail) ||
      ax.message;
    throw new HttpError(ax.response?.status || 502, String(detail));
  }
  throw error;
}

export const agentClient = {
  async health() {
    try {
      const { data } = await client.get("/health");
      return data;
    } catch {
      return { ok: false };
    }
  },

  async upsertCompany(payload: AgentCompanyPayload) {
    try {
      const { data } = await client.put(
        `/v1/companies/${payload.id}`,
        payload,
      );
      return data;
    } catch (error) {
      wrapAgentError(error);
    }
  },

  async knowledge(companyId: string) {
    try {
      const { data } = await client.get(
        `/v1/companies/${companyId}/knowledge`,
      );
      return data as { company_id: string; chunk_count: number };
    } catch (error) {
      wrapAgentError(error);
    }
  },

  async ingest(
    companyId: string,
    files: { buffer: Buffer; originalname: string; mimetype: string }[],
  ) {
    try {
      const form = new FormData();
      form.append("company_id", companyId);
      for (const file of files) {
        form.append("files", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      }
      const { data } = await client.post("/v1/ingest", form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });
      return data as {
        company_id: string;
        documents: number;
        chunks: number;
        saved_files: string[];
      };
    } catch (error) {
      wrapAgentError(error);
    }
  },

  async chat(companyId: string, message: string) {
    try {
      const { data } = await client.post<AgentChatResponse>("/v1/chat", {
        company_id: companyId,
        message,
      });
      return data;
    } catch (error) {
      wrapAgentError(error);
    }
  },
};
