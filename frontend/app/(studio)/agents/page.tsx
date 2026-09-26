"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, apiError } from "@/lib/api";
import { Chip, inputClass } from "@/components/ui/primitives";
import { AgentForm, AgentFormValues } from "@/components/agents/AgentForm";
import { PageLoader } from "@/components/ui/PageLoader";
import { IconSearch } from "@/components/ui/marks";
import { Agent, Customer, Specialist } from "@/modules/types";
import { agentLane, laneLabel } from "@/modules/agents/status";
import { useStudioLoad } from "@/modules/studio/StudioLoad";

function formatWhen(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Filter = "all" | "active" | "unused" | "review";

function AgentsView() {
  const router = useRouter();
  const search = useSearchParams();
  const creating = search.get("new") === "1";
  const presetCustomer = search.get("customerId") || "";
  const qParam = search.get("q") || "";
  const filterParam = search.get("filter");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [query, setQuery] = useState(qParam);
  const [filter, setFilter] = useState<Filter>(
    filterParam === "active" || filterParam === "unused" || filterParam === "review"
      ? filterParam
      : "all",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [docs, setDocs] = useState<File[]>([]);
  const [form, setForm] = useState<AgentFormValues>({
    customerId: "",
    name: "",
    companyId: "",
    contactEmail: "",
    persona: "",
    enabledAgents: ["sales", "support", "account", "billing", "booking", "default"],
  });

  useStudioLoad(loading, "Loading agents");

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    if (filterParam === "active" || filterParam === "unused" || filterParam === "review") {
      setFilter(filterParam);
    }
  }, [filterParam]);

  useEffect(() => {
    api
      .get<Agent[]>("/agents")
      .then((response) => setAgents(response.data))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!creating) return;
    Promise.all([
      api.get<Customer[]>("/customers"),
      api.get<Specialist[]>("/catalog/specialists"),
    ])
      .then(([customersRes, specialistsRes]) => {
        setCustomers(customersRes.data);
        setSpecialists(specialistsRes.data);
        setForm((current) => ({
          ...current,
          customerId:
            presetCustomer || current.customerId || customersRes.data[0]?.id || "",
        }));
      })
      .catch((err) => setFormError(apiError(err)));
  }, [creating, presetCustomer]);

  const counts = useMemo(() => {
    const total = agents.length;
    const active = agents.filter((agent) => agentLane(agent) === "active").length;
    const unused = agents.filter((agent) => agentLane(agent) === "unused").length;
    return { total, active, unused };
  }, [agents]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return agents.filter((agent) => {
      const lane = agentLane(agent);
      if (filter !== "all" && lane !== filter) return false;
      if (!needle) return true;
      return [agent.name, agent.companyId, agent.customerName]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [agents, filter, query]);

  function closeDrawer() {
    setDocs([]);
    router.replace("/agents");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    let createdId = "";
    try {
      const { data } = await api.post<{ id: string }>("/agents", form);
      createdId = data.id;
      if (docs.length) {
        const body = new FormData();
        docs.forEach((file) => body.append("files", file));
        await api.post(`/agents/${data.id}/ingest`, body);
      }
      router.push(`/agents/${data.id}`);
    } catch (err) {
      if (createdId) {
        router.push(`/agents/${createdId}?ingestError=1`);
        return;
      }
      setFormError(apiError(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight">Agents</h1>
        <Link
          href="?new=1"
          className="rounded-lg px-2 py-1 text-[13px] text-muted hover:bg-fill hover:text-ink"
        >
          Create agent
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-lg border border-line bg-surface text-[12px]">
          <div className="px-3 py-2">
            <p className="text-muted">Total</p>
            <p className="font-semibold">{counts.total}</p>
          </div>
          <div className="border-l border-line px-3 py-2">
            <p className="text-muted">Active</p>
            <p className="font-semibold text-accent">{counts.active}</p>
          </div>
          <div className="border-l border-line px-3 py-2">
            <p className="text-muted">Unused</p>
            <p className="font-semibold">{counts.unused}</p>
          </div>
        </div>
        <div className="relative min-w-[220px] flex-1">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            className={`${inputClass} h-9 pl-8`}
            placeholder="Search agents"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["unused", "Unused"],
              ["review", "Needs review"],
            ] as const
          ).map(([id, label]) => (
            <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      <div className="mt-4 min-w-0 overflow-hidden rounded-xl border border-line bg-surface">
          {loading ? (
            <PageLoader label="Loading agents" />
          ) : visible.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[18px] font-semibold">
                {agents.length === 0 ? "No agents yet" : "No agents match"}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {agents.length === 0
                  ? "Create an agent to start routing customer conversations."
                  : "Clear search or switch filters to see more agents."}
              </p>
              <Link
                href="?new=1"
                className="mt-5 inline-flex rounded-lg bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-ink"
              >
                Create agent
              </Link>
            </div>
          ) : (
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead className="bg-sidebar text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Last used</th>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 text-right font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((agent) => {
                  const lane = agentLane(agent);
                  return (
                    <tr key={agent.id} className="border-t border-line hover:bg-sidebar">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill text-[11px] font-semibold">
                            {agent.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <Link href={`/agents/${agent.id}`} className="font-medium hover:underline">
                              {agent.name}
                            </Link>
                            <p className="font-mono text-[12px] text-muted">{agent.companyId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[12px] ${
                            lane === "active"
                              ? "bg-accent/10 text-accent"
                              : "bg-fill text-muted"
                          }`}
                        >
                          {laneLabel(lane)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted">{formatWhen(agent.lastUsedAt)}</td>
                      <td className="px-4 py-2.5 text-muted">{agent.customerName || "—"}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link href={`/agents/${agent.id}`} className="text-ink hover:underline">
                          Edit
                        </Link>
                        <Link
                          href={`/agents/${agent.id}?tab=test`}
                          className="ml-3 text-ink hover:underline"
                        >
                          Test
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
      </div>

      {creating ? (
        <div className="fixed inset-0 z-30 flex justify-end bg-ink/20">
          <button
            type="button"
            className="h-full flex-1 cursor-default"
            aria-label="Close"
            onClick={closeDrawer}
          />
          <aside className="h-full w-full max-w-md overflow-y-auto bg-surface p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">New agent</h2>
              <button type="button" className="text-[13px] text-muted" onClick={closeDrawer}>
                Close
              </button>
            </div>
            <AgentForm
              customers={customers}
              specialists={specialists}
              form={form}
              setForm={setForm}
              docs={docs}
              setDocs={setDocs}
              error={formError}
              busy={busy}
              submitLabel="Create agent"
              onSubmit={onSubmit}
              onCancel={closeDrawer}
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading agents" />}>
      <AgentsView />
    </Suspense>
  );
}
