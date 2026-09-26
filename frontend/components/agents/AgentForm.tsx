"use client";

import { FormEvent } from "react";
import { Field, PrimaryButton, GhostButton, inputClass } from "@/components/ui/primitives";
import { Customer, Specialist } from "@/modules/types";

export type AgentFormValues = {
  customerId: string;
  name: string;
  companyId: string;
  contactEmail: string;
  persona: string;
  enabledAgents: string[];
};

export function AgentForm({
  customers,
  specialists,
  form,
  setForm,
  docs,
  setDocs,
  error,
  busy,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  customers: Customer[];
  specialists: Specialist[];
  form: AgentFormValues;
  setForm: (next: AgentFormValues) => void;
  docs: File[];
  setDocs: (files: File[]) => void;
  error: string;
  busy: boolean;
  submitLabel: string;
  onSubmit: (event: FormEvent) => void;
  onCancel?: () => void;
}) {
  function toggle(id: string) {
    setForm({
      ...form,
      enabledAgents: form.enabledAgents.includes(id)
        ? form.enabledAgents.filter((item) => item !== id)
        : [...form.enabledAgents, id],
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Customer">
        <select
          className={inputClass}
          value={form.customerId}
          onChange={(event) => setForm({ ...form, customerId: event.target.value })}
          required
        >
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Name">
        <input
          className={inputClass}
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
      </Field>
      <Field label="Company id">
        <input
          className={inputClass}
          placeholder="acme"
          value={form.companyId}
          onChange={(event) => setForm({ ...form, companyId: event.target.value })}
          required
        />
      </Field>
      <Field label="Contact email">
        <input
          className={inputClass}
          type="email"
          value={form.contactEmail}
          onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
        />
      </Field>
      <Field
        label="Persona"
        hint="Optional. Leave blank to use the default support voice."
      >
        <textarea
          className={`${inputClass} min-h-24`}
          value={form.persona}
          onChange={(event) => setForm({ ...form, persona: event.target.value })}
          placeholder="Warm, concise, never invent policy…"
        />
      </Field>
      <Field
        label="Company docs"
        hint="Optional. Markdown, text, or PDF files are embedded for this company."
      >
        <input
          className="block w-full text-[13px] text-muted file:mr-3 file:rounded-lg file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-[13px] file:text-ink"
          type="file"
          multiple
          accept=".md,.txt,.pdf,text/markdown,text/plain,application/pdf"
          onChange={(event) => setDocs(Array.from(event.target.files || []))}
        />
        {docs.length ? (
          <ul className="mt-2 space-y-0.5 text-[12px] text-muted">
            {docs.map((file) => (
              <li key={`${file.name}-${file.size}`}>{file.name}</li>
            ))}
          </ul>
        ) : null}
      </Field>
      <div>
        <p className="mb-2 text-sm text-muted">Specialists</p>
        <div className="flex flex-wrap gap-1.5">
          {specialists.map((item) => {
            const on = form.enabledAgents.includes(item.id);
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
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <PrimaryButton disabled={busy}>{busy ? "Saving…" : submitLabel}</PrimaryButton>
        {onCancel ? (
          <GhostButton type="button" onClick={onCancel}>
            Cancel
          </GhostButton>
        ) : null}
      </div>
    </form>
  );
}
