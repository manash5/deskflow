"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/modules/auth/AuthProvider";
import {
  DeskflowMark,
  IconBell,
  IconBoard,
  IconDirectory,
  IconDraft,
  IconPlus,
  IconSearch,
  IconSignal,
} from "@/components/ui/marks";

const NAV = [
  { href: "/agents", label: "Agents", icon: IconBoard },
  { href: "/agents?filter=draft", label: "Drafts", icon: IconDraft, match: "draft" },
  { href: "/customers", label: "Customers", icon: IconDirectory },
  { href: "/overview", label: "Activity", icon: IconSignal },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { admin, ready, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [command, setCommand] = useState("");
  const [graphOnline, setGraphOnline] = useState<boolean | null>(null);
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const filterParam = searchParams.get("filter") || "";

  useEffect(() => {
    if (ready && !admin) router.replace("/login");
  }, [admin, ready, router]);

  useEffect(() => {
    api
      .get<{ agentOnline: boolean; agents: number }>("/dashboard")
      .then((response) => {
        setGraphOnline(response.data.agentOnline);
        setAgentCount(response.data.agents);
      })
      .catch(() => setGraphOnline(null));
  }, []);

  if (!ready || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading
      </div>
    );
  }

  const initials = admin.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function onCommand(event: FormEvent) {
    event.preventDefault();
    const q = command.trim();
    router.push(q ? `/agents?q=${encodeURIComponent(q)}` : "/agents");
  }

  function isActive(href: string, match?: string) {
    if (match === "draft") {
      return pathname.startsWith("/agents") && filterParam === "draft";
    }
    if (href.startsWith("/agents") && !match) {
      return pathname.startsWith("/agents") && filterParam !== "draft";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="flex flex-col border-b border-line bg-sidebar lg:min-h-screen lg:border-b-0 lg:border-r">
        <Link href="/agents" className="flex items-center gap-2.5 px-4 py-4">
          <DeskflowMark className="h-8 w-8 shrink-0" />
          <span className="text-[15px] font-semibold tracking-tight text-ink">Deskflow</span>
        </Link>

        <nav className="flex-1 space-y-0.5 px-2 text-[13px]">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${
                  active ? "bg-fill font-medium text-ink" : "text-ink hover:bg-fill"
                }`}
              >
                <Icon className="h-4 w-4 text-muted" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-line p-3">
          <Link
            href="/agents?new=1"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[13px] font-semibold text-accent-ink"
          >
            <IconPlus className="h-3.5 w-3.5 text-accent-ink" />
            New agent
          </Link>
          <div className="rounded-lg border border-line bg-surface px-3 py-2">
            <p className="text-[12px] text-muted">Graph</p>
            <p className="mt-1 text-[13px] font-medium">
              {graphOnline === null ? "Checking" : graphOnline ? "Online" : "Offline"}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-fill">
              <div
                className="h-full bg-accent"
                style={{ width: graphOnline ? "100%" : "18%" }}
              />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-12 items-center gap-3 border-b border-line px-3 sm:px-4">
          <form onSubmit={onCommand} className="relative mx-auto w-full max-w-xl">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="Search agents"
              className="h-8 w-full rounded-full bg-fill py-0 pr-3 pl-9 text-[13px] outline-none placeholder:text-muted"
            />
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="hidden text-[13px] text-muted sm:inline">
              {agentCount ?? "—"} agents
            </span>
            <Link
              href="/agents?new=1"
              className="hidden rounded-full bg-ink px-3 py-1 text-[13px] font-medium text-accent-ink sm:inline"
            >
              New agent
            </Link>
            <div className="relative">
              <button
                type="button"
                className="rounded-full p-1.5 text-muted hover:bg-fill"
                aria-label="Alerts"
                onClick={() => {
                  setAlertsOpen((open) => !open);
                  setMenuOpen(false);
                }}
              >
                <IconBell />
              </button>
              {alertsOpen ? (
                <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-line bg-surface p-3 text-[13px] text-muted shadow-sm">
                  No routing alerts.
                </div>
              ) : null}
            </div>
            <div className="relative">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-fill text-[11px] font-semibold"
                onClick={() => {
                  setMenuOpen((open) => !open);
                  setAlertsOpen(false);
                }}
              >
                {initials}
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-line bg-surface py-1 text-[13px] shadow-sm">
                  <p className="px-3 py-2 text-muted">{admin.email}</p>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left hover:bg-fill"
                    onClick={() => {
                      logout();
                      router.replace("/login");
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
