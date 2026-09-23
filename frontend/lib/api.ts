import axios from "axios";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export type ApiResponse<T> = {
  status: number;
  data: T;
  success: boolean;
  message: string;
  meta?: PaginationMeta;
};

function isEnvelope(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "status" in value &&
    "message" in value
  );
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("deskflow.token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use((response) => {
  const body = response.data;
  if (isEnvelope(body) && body.success && "data" in body) {
    response.data = body.data;
  }
  return response;
});

export function apiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || error.message;
  }
  return "Something went wrong.";
}
