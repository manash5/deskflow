"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api, apiError } from "@/lib/api";
import {
  Field,
  PageHeader,
  PrimaryButton,
  inputClass,
} from "@/components/ui/primitives";
import { Customer } from "@/modules/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
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
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/customers", form);
      setForm({ name: "", email: "", company: "", notes: "" });
      setOpen(false);
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Accounts that own one or more agents."
        action={
          <PrimaryButton type="button" onClick={() => setOpen((value) => !value)}>
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
          <div className="sm:col-span-2">
            <PrimaryButton>Save customer</PrimaryButton>
          </div>
        </form>
      ) : null}
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="py-3 pr-4 font-medium">Name</th>
            <th className="py-3 pr-4 font-medium">Email</th>
            <th className="py-3 font-medium">Agents</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-b border-line">
              <td className="py-3 pr-4">
                <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                  {customer.name}
                </Link>
              </td>
              <td className="py-3 pr-4 text-muted">{customer.email}</td>
              <td className="py-3 text-muted">{customer.agentCount || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
