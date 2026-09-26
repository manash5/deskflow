"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, apiError } from "@/lib/api";
import { MarkdownBody } from "@/components/chat/MarkdownBody";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageHeader } from "@/components/ui/primitives";
import { groupTurns, sessionRange } from "@/modules/activity/groupTurns";
import { useStudioLoad } from "@/modules/studio/StudioLoad";
import { Agent, ChatTurn, Dashboard } from "@/modules/types";

function formatWhen(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ActivityView() {
  const search = useSearchParams();
  const agentId = search.get("agent") || "";

  const [stats, setStats] = useState<Dashboard | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingLog, setLoadingLog] = useState(false);
  const [error, setError] = useState("");

  useStudioLoad(loadingList, "Loading activity");

  useEffect(() => {
    Promise.all([api.get<Dashboard>("/dashboard"), api.get<Agent[]>("/agents")])
      .then(([dashboardRes, agentsRes]) => {
        setStats(dashboardRes.data);
        setAgents(agentsRes.data);
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!agentId) {
      setTurns([]);
      setLoadingLog(false);
      return;
    }
    setLoadingLog(true);
    setError("");
    api
      .get<ChatTurn[]>(`/agents/${agentId}/chat`)
      .then((response) => {
        const list = Array.isArray(response.data) ? response.data : [];
        setTurns(list);
      })
      .catch((err) => {
        setTurns([]);
        setError(apiError(err));
      })
      .finally(() => setLoadingLog(false));
  }, [agentId]);

  const selected = agents.find((agent) => agent.id === agentId) || null;
  const days = useMemo(() => groupTurns(turns), [turns]);

  if (error && !stats && agents.length === 0) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <div>
      <PageHeader
        title="Activity"
        description={stats?.agentOnline ? "Graph online" : "Graph offline"}
      />

      {stats ? (
        <div className="flex flex-wrap items-end gap-8 border-y border-line py-5">
          {[
            ["Customers", stats.customers, false],
            ["Agents", stats.agents, false],
            ["Conversations", stats.chats, true],
            ["Blocked", stats.blocked, false],
          ].map(([label, value, accent]) => (
            <div key={String(label)}>
              <p className="text-sm text-muted">{label}</p>
              <p className={`mt-1 text-2xl font-semibold ${accent ? "text-accent" : ""}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {error && agentId ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="min-w-0 border-y border-line lg:border-y-0 lg:border-r lg:pr-5">
          <p className="py-3 text-[12px] text-muted lg:pt-0">Agents</p>
          {agents.length === 0 ? (
            <p className="pb-4 text-[13px] text-muted">
              No agents yet.{" "}
              <Link href="/agents?new=1" className="text-ink underline">
                Create one
              </Link>
            </p>
          ) : (
            <ul>
              {agents.map((agent) => {
                const open = agent.id === agentId;
                return (
                  <li key={agent.id} className="border-t border-line">
                    <Link
                      href={`/overview?agent=${agent.id}`}
                      className={`block py-3 ${open ? "bg-sidebar" : "hover:bg-sidebar"}`}
                    >
                      <p className="text-[14px] font-medium">{agent.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {agent.chats || 0} conversation{(agent.chats || 0) === 1 ? "" : "s"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted">{agent.companyId}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="min-w-0">
          {!agentId ? (
            <p className="py-10 text-[13px] text-muted">
              Choose an agent to read its conversations by day and session.
            </p>
          ) : loadingLog ? (
            <PageLoader label="Loading conversations" />
          ) : (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-semibold tracking-tight">
                    {selected?.name || "Agent"}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {selected?.customerName || "Customer"}
                    {" · "}
                    {turns.length} conversation{turns.length === 1 ? "" : "s"}
                    {" · "}
                    {days.length} day{days.length === 1 ? "" : "s"}
                    {" · last used "}
                    {formatWhen(selected?.lastUsedAt)}
                  </p>
                </div>
                {selected ? (
                  <Link href={`/agents/${selected.id}`} className="text-[13px] text-ink hover:underline">
                    Open agent
                  </Link>
                ) : null}
              </div>

              {days.length === 0 ? (
                <p className="mt-8 text-sm text-muted">No conversations on this desk yet.</p>
              ) : (
                <div className="mt-6 space-y-8">
                  {days.map((day) => (
                    <section key={day.date}>
                      <header className="border-b border-line pb-2">
                        <h3 className="text-[15px] font-semibold">{day.label}</h3>
                        <p className="text-[12px] text-muted">
                          {day.date}
                          {" · "}
                          {day.sessions.length} session{day.sessions.length === 1 ? "" : "s"}
                          {" · "}
                          {day.turnCount} conversation{day.turnCount === 1 ? "" : "s"}
                        </p>
                      </header>
                      <div className="mt-4 space-y-6">
                        {day.sessions.map((session) => (
                          <article key={session.id}>
                            <p className="text-[13px] font-medium">
                              Session {session.index}
                            </p>
                            <p className="text-[12px] text-muted">
                              {sessionRange(session)}
                              {" · "}
                              {session.turns.length} turn{session.turns.length === 1 ? "" : "s"}
                            </p>
                            <ol className="mt-3 space-y-4 border-l border-line pl-4">
                              {session.turns.map((turn, index) => (
                                <li key={turn.id}>
                                  <p className="text-[11px] text-muted">
                                    Turn {index + 1}
                                    {turn.route ? ` · ${turn.route}` : ""}
                                    {turn.blocked ? " · blocked" : ""}
                                  </p>
                                  <p className="mt-1 text-[12px] font-medium">Visitor</p>
                                  <p className="mt-0.5 text-[14px]">{turn.message}</p>
                                  <p className="mt-2 text-[12px] font-medium">Desk</p>
                                  <div className="mt-0.5 text-[14px] text-muted">
                                    <MarkdownBody text={turn.answer} />
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading activity" />}>
      <ActivityView />
    </Suspense>
  );
}
