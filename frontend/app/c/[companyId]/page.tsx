"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatThread } from "@/components/chat/ChatThread";
import { api, apiError } from "@/lib/api";
import { PageLoader } from "@/components/ui/PageLoader";
import { inputClass, PrimaryButton } from "@/components/ui/primitives";

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
  const [pendingMessage, setPendingMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<PublicCard>(`/public/chat/${params.companyId}`)
      .then((response) => setCard(response.data))
      .catch((err) => setError(apiError(err)));
  }, [params.companyId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!message.trim() || busy) return;
    const text = message.trim();
    setBusy(true);
    setError("");
    setPendingMessage(text);
    setMessage("");
    try {
      const { data } = await api.post<PublicTurn>(
        `/public/chat/${params.companyId}`,
        { message: text },
      );
      setTurns((current) => [...current, data]);
      setPendingMessage("");
    } catch (err) {
      setError(apiError(err));
      setMessage(text);
      setPendingMessage("");
    } finally {
      setBusy(false);
    }
  }

  if (!card && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader label="Opening desk" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-8">
      <p className="text-sm text-muted">{card?.companyName || "Support"}</p>
      <h1 className="mt-1 text-lg font-semibold">{card?.name || "Chat"}</h1>
      <div className="mt-6 flex min-h-[320px] flex-1 flex-col">
        <ChatThread
          turns={turns}
          pendingMessage={pendingMessage}
          waiting={busy}
          emptyLabel="Ask a question. You will see this desk writing a reply before the answer lands."
        />
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <form onSubmit={send} className="sticky bottom-4 mt-6 flex gap-2">
        <input
          className={`${inputClass} bg-surface`}
          placeholder="How can we help?"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={busy}
        />
        <PrimaryButton disabled={busy}>{busy ? "Sending" : "Send"}</PrimaryButton>
      </form>
    </div>
  );
}
