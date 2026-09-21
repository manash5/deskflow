"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { apiError } from "@/lib/api";
import { inputClass, PrimaryButton } from "@/components/ui/primitives";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api";

type PublicCard = {
  companyId: string;
  name: string;
  companyName: string;
};

type PublicTurn = {
  id: string;
  message: string;
  answer: string;
};

export default function PublicChatPage() {
  const params = useParams<{ companyId: string }>();
  const [card, setCard] = useState<PublicCard | null>(null);
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<PublicTurn[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    axios
      .get<PublicCard>(`${apiBase}/public/chat/${params.companyId}`)
      .then((response) => setCard(response.data))
      .catch((err) => setError(apiError(err)));
  }, [params.companyId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await axios.post<PublicTurn>(
        `${apiBase}/public/chat/${params.companyId}`,
        { message },
      );
      setTurns((current) => [...current, data]);
      setMessage("");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-8">
      <p className="text-sm text-muted">{card?.companyName || "Support"}</p>
      <h1 className="mt-1 text-lg font-semibold">{card?.name || "Chat"}</h1>
      <div className="mt-6 flex-1 space-y-3">
        {turns.map((turn) => (
          <div key={turn.id} className="space-y-1.5">
            <div className="ml-auto max-w-[80%] rounded-xl bg-accent px-3 py-2 text-sm text-accent-ink">
              {turn.message}
            </div>
            <div className="max-w-[90%] rounded-xl border border-line bg-surface px-3 py-2 text-sm">
              {turn.answer}
            </div>
          </div>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <form onSubmit={send} className="sticky bottom-4 mt-6 flex gap-2">
        <input
          className={`${inputClass} bg-surface`}
          placeholder="How can we help?"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <PrimaryButton disabled={busy}>{busy ? "…" : "Send"}</PrimaryButton>
      </form>
    </div>
  );
}
