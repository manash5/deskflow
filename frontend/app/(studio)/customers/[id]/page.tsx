"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, apiError } from "@/lib/api";
import { PageHeader } from "@/components/ui/primitives";
import { Customer } from "@/modules/types";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Customer>(`/customers/${params.id}`)
      .then((response) => setCustomer(response.data))
      .catch((err) => setError(apiError(err)));
  }, [params.id]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!customer) return <p className="text-sm text-muted">Loading customer</p>;

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={customer.email}
        action={
          <Link
            href={`/agents?new=1&customerId=${customer.id}`}
            className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-ink"
          >
            New agent
          </Link>
        }
      />
      <p className="text-sm">{customer.company || "No company label"}</p>
      {customer.notes ? <p className="mt-2 text-sm text-muted">{customer.notes}</p> : null}
      <table className="mt-8 w-full text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="py-3 pr-4 font-medium">Agent</th>
            <th className="py-3 pr-4 font-medium">Company id</th>
            <th className="py-3 text-right font-medium"> </th>
          </tr>
        </thead>
        <tbody>
          {(customer.agents || []).map((agent) => (
            <tr key={agent.id} className="border-b border-line">
              <td className="py-3 pr-4 font-medium">{agent.name}</td>
              <td className="py-3 pr-4 font-mono text-muted">{agent.companyId}</td>
              <td className="py-3 text-right">
                <Link href={`/agents/${agent.id}`} className="text-accent hover:underline">
                  Edit
                </Link>
                <Link
                  href={`/agents/${agent.id}?tab=test`}
                  className="ml-4 text-accent hover:underline"
                >
                  Test
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
