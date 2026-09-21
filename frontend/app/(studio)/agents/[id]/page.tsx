"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { api, apiError } from "@/lib/api";
import {
  Field,
  GhostButton,
  PageHeader,
  PrimaryButton,
  inputClass,
} from "@/components/ui/primitives";
import { Agent, ChatTurn, Performance, Specialist } from "@/modules/types";

function AgentDetail() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const tab = search.get("tab") === "test" ? "test" : "edit";

  const [agent, setAgent] = useState<Agent | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [knowledge, setKnowledge] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const ingestError = search.get("ingestError") === "1";

  async function load() {
    const [agentRes, specRes, perfRes, chatRes] = await Promise.all([
      api.get<Agent>(`/agents/${params.id}`),
      api.get<Specialist[]>("/catalog/specialists"),
      api.get<Performance>(`/agents/${params.id}/performance`),
      api.get<ChatTurn[]>(`/agents/${params.id}/chat`),
    ]);
    setAgent(agentRes.data);
    setSpecialists(specRes.data);
    setPerformance(perfRes.data);
    setTurns(chatRes.data.slice().reverse());
    try {
      const knowledgeRes = await api.get<{ chunk_count: number }>(
        `/agents/${params.id}/knowledge`,
      );
      setKnowledge(knowledgeRes.data.chunk_count);
    } catch {
      setKnowledge(null);
    }
  }

  useEffect(() => {
    load()
      .then(() => {
        if (ingestError) {
          setError("Agent saved. Company docs could not be indexed. Upload them here and ingest again.");
        }
      })
      .catch((err) => setError(apiError(err)));
  }, [params.id]);

  function setTab(next: "edit" | "test") {
    router.replace(next === "test" ? `/agents/${params.id}?tab=test` : `/agents/${params.id}`);
  }

  function toggle(id: string) {
    if (!agent) return;
    setAgent({
      ...agent,
      enabledAgents: agent.enabledAgents.includes(id)
        ? agent.enabledAgents.filter((item) => item !== id)
        : [...agent.enabledAgents, id],
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!agent) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.patch<Agent>(`/agents/${agent.id}`, {
        name: agent.name,
        persona: agent.persona,
        enabledAgents: agent.enabledAgents,
        contactEmail: agent.contactEmail,
      });
      setAgent(data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function ingest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agent) return;
    const input = event.currentTarget.elements.namedItem("files") as HTMLInputElement;
    if (!input.files?.length) return;
    const body = new FormData();
    Array.from(input.files).forEach((file) => body.append("files", file));
    setBusy(true);
    setError("");
    try {
      await api.post(`/agents/${agent.id}/ingest`, body);
      await load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!agent || !message.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post<ChatTurn>(`/agents/${agent.id}/chat`, {
        message,
      });
      setTurns((current) => [...current, data]);
      setMessage("");
      const perf = await api.get<Performance>(`/agents/${agent.id}/performance`);
      setPerformance(perf.data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (!agent) {
    return <p className="text-sm text-muted">{error || "Loading agent…"}</p>;
  }

  return (
    <div>
      <PageHeader
        title={agent.name}
        description={`${agent.customerName || "Customer"}  ${agent.companyId}`}
        action={
          <Link href={`/c/${agent.companyId}`} className="text-sm text-accent hover:underline">
            Public chat
          </Link>
        }
      />
      <div className="mb-8 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("edit")}
          className={`rounded-full px-3 py-1 text-sm ${
            tab === "edit" ? "bg-accent text-accent-ink" : "border border-line bg-surface"
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setTab("test")}
          className={`rounded-full px-3 py-1 text-sm ${
            tab === "test" ? "bg-accent text-accent-ink" : "border border-line bg-surface"
          }`}
        >
          Test
        </button>
      </div>
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

      {tab === "edit" ? (
        <div className="grid gap-10 lg:grid-cols-[1fr_240px]">
          <form onSubmit={save} className="space-y-3">
            <Field label="Name">
              <input
                className={inputClass}
                value={agent.name}
                onChange={(event) => setAgent({ ...agent, name: event.target.value })}
              />
            </Field>
            <Field label="Contact email">
              <input
                className={inputClass}
                value={agent.contactEmail}
                onChange={(event) =>
                  setAgent({ ...agent, contactEmail: event.target.value })
                }
              />
            </Field>
            <Field
              label="Persona"
              hint="Optional. Clear this field and save to restore the default voice."
            >
              <textarea
                className={`${inputClass} min-h-32`}
                value={agent.persona}
                onChange={(event) =>
                  setAgent({ ...agent, persona: event.target.value })
                }
              />
            </Field>
            <div className="flex flex-wrap gap-1.5">
              {specialists.map((item) => {
                const on = agent.enabledAgents.includes(item.id);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      on ? "bg-accent text-accent-ink" : "border border-line bg-surface text-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <PrimaryButton disabled={saving}>
              {saving ? "Saving" : "Save"}
            </PrimaryButton>
          </form>
          <div className="space-y-8 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div>
              <p className="text-sm text-muted">Company docs</p>
              <p className="mt-1 text-sm">
                {knowledge === null ? "Graph offline" : `${knowledge} chunks indexed`}
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Upload markdown, text, or PDF. Files are embedded for this company.
              </p>
              <form onSubmit={ingest} className="mt-3 space-y-2">
                <input
                  name="files"
                  type="file"
                  multiple
                  accept=".md,.txt,.pdf,text/markdown,text/plain,application/pdf"
                  className="block w-full text-[13px] text-muted"
                />
                <GhostButton disabled={busy}>Ingest files</GhostButton>
              </form>
            </div>
            <div>
              <p className="text-sm text-muted">Usage</p>
              <p className="mt-1 text-sm">
                {performance?.totals.chats ?? 0} chats, {performance?.totals.blocked ?? 0} blocked
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[480px] flex-col border-t border-line pt-5">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {turns.length === 0 ? (
              <p className="text-sm text-muted">Send a message to test this agent.</p>
            ) : null}
            {turns.map((turn) => (
              <div key={turn.id} className="space-y-1.5">
                <div className="ml-auto max-w-[80%] rounded-md bg-accent px-3 py-2 text-sm text-accent-ink">
                  {turn.message}
                </div>
                <div className="max-w-[90%] rounded-md bg-surface px-3 py-2 text-sm">
                  {turn.answer}
                  <p className="mt-1 font-mono text-xs text-muted">
                    {turn.route || "blocked"} {Number(turn.confidence || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="mt-3 flex gap-2">
            <input
              className={inputClass}
              placeholder="Ask as a customer"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <PrimaryButton disabled={busy}>Send</PrimaryButton>
          </form>
        </div>
      )}
    </div>
  );
}

export default function AgentDetailPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading agent…</p>}>
      <AgentDetail />
    </Suspense>
  );
}
