"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, apiError } from "@/lib/api";
import { PageHeader } from "@/components/ui/primitives";
import { Dashboard } from "@/modules/types";

export default function OverviewPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Dashboard>("/dashboard")
      .then((response) => setData(response.data))
      .catch((err) => setError(apiError(err)));
  }, []);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Loading activity</p>;

  return (
    <div>
      <PageHeader
        title="Activity"
        description={data.agentOnline ? "Graph online" : "Graph offline"}
      />
      <div className="flex flex-wrap items-end gap-8 border-y border-line py-5">
        {[
          ["Customers", data.customers, false],
          ["Agents", data.agents, false],
          ["Chats", data.chats, true],
          ["Blocked", data.blocked, false],
        ].map(([label, value, accent]) => (
          <div key={String(label)}>
            <p className="text-sm text-muted">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${accent ? "text-accent" : ""}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
      <ul className="mt-8 divide-y divide-line border-t border-line">
        {data.recent.length === 0 ? (
          <li className="py-8 text-sm text-muted">
            No conversations yet.{" "}
            <Link href="/agents" className="text-accent hover:underline">
              Open agents
            </Link>
          </li>
        ) : (
          data.recent.map((turn) => (
            <li key={turn.id} className="py-4">
              <div className="flex justify-between gap-3 text-xs text-muted">
                <span className="font-mono">{turn.route || "unrouted"}</span>
                <span>{new Date(turn.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm">{turn.message}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{turn.answer}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
