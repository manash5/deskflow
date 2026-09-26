"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api, apiError } from "@/lib/api";
import { PageLoader } from "@/components/ui/PageLoader";
import {
  Field,
  PageHeader,
  PrimaryButton,
  inputClass,
} from "@/components/ui/primitives";
import { useStudioLoad } from "@/modules/studio/StudioLoad";
import { Customer } from "@/modules/types";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    notes: "",
  });

  async function load() {
    try {
      const { data } = await api.get<Customer[]>("/customers");
      setCustomers(data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  useStudioLoad(loading, "Loading customers");

  useEffect(() => {
    load();
  }, []);

  function closeForm() {
    setOpen(false);
    setForm({ name: "", email: "", company: "", notes: "" });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = await api.post<{ id: string }>("/customers", form);
      setForm({ name: "", email: "", company: "", notes: "" });
      setOpen(false);
      router.push(`/customers/${data.id}`);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Accounts that own one or more agents."
        action={
          <PrimaryButton type="button" onClick={() => (open ? closeForm() : setOpen(true))}>
            {open ? "Cancel" : "Add customer"}
          </PrimaryButton>
        }
      />
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      {open ? (
        <form onSubmit={onSubmit} className="mb-8 grid gap-3 border-y border-line py-5 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </Field>
          <Field label="Email">
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </Field>
          <Field label="Company">
            <input
              className={inputClass}
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
            />
          </Field>
          <Field label="Notes">
            <input
              className={inputClass}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <PrimaryButton disabled={saving}>
              {saving ? "Saving" : "Save customer"}
            </PrimaryButton>
            <button
              type="button"
              className="text-[13px] text-muted hover:text-ink"
              onClick={closeForm}
            >
              Back to list
            </button>
          </div>
        </form>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {loading ? (
          <PageLoader label="Loading customers" />
        ) : (
        <table className="w-full text-left text-sm">
          <thead className="bg-sidebar text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Agents</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-16 text-center text-[13px] text-muted">
                  No customers yet.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-t border-line hover:bg-sidebar">
                  <td className="px-4 py-2.5">
                    <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{customer.email}</td>
                  <td className="px-4 py-2.5 text-muted">{customer.agentCount || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
