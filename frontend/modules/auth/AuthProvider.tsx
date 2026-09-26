"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import { Admin } from "@/modules/types";

type AuthContextValue = {
  admin: Admin | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("deskflow.token");
    if (!stored) {
      setReady(true);
      return;
    }
    setToken(stored);
    api
      .get<Admin>("/auth/me")
      .then((response) => setAdmin(response.data))
      .catch(() => {
        localStorage.removeItem("deskflow.token");
        setToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      token,
      ready,
      async login(email, password) {
        const { data } = await api.post<{ token: string; admin: Admin }>(
          "/auth/login",
          { email, password },
        );
        localStorage.setItem("deskflow.token", data.token);
        setToken(data.token);
        setAdmin(data.admin);
      },
      logout() {
        localStorage.removeItem("deskflow.token");
        setToken(null);
        setAdmin(null);
      },
    }),
    [admin, token, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
