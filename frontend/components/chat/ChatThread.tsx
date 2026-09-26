"use client";

import { useEffect, useRef } from "react";
import { MarkdownBody } from "./MarkdownBody";

export type ChatThreadTurn = {
  id: string;
  message: string;
  answer: string;
  route?: string;
  confidence?: number;
  blocked?: boolean;
};

export function TypingIndicator({ label = "Writing a reply" }: { label?: string }) {
  return (
    <div className="max-w-[90%] rounded-md border border-line bg-fill px-3 py-2.5 text-muted">
      <p className="sr-only">{label}</p>
      <div className="desk-typing" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function ChatThread({
  turns,
  pendingMessage,
  waiting,
  emptyLabel,
  showRoute = false,
}: {
  turns: ChatThreadTurn[];
  pendingMessage?: string;
  waiting?: boolean;
  emptyLabel: string;
  showRoute?: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns, pendingMessage, waiting]);

  const empty = turns.length === 0 && !pendingMessage;

  return (
    <div className="flex-1 space-y-4 overflow-y-auto">
      {empty ? <p className="text-sm text-muted">{emptyLabel}</p> : null}
      {turns.map((turn) => (
        <div key={turn.id} className="space-y-1.5">
          <div className="ml-auto max-w-[80%] rounded-md bg-accent px-3 py-2 text-sm text-accent-ink">
            {turn.message}
          </div>
          <div
            className={`max-w-[90%] rounded-md px-3 py-2 ${
              turn.blocked
                ? "border border-danger/20 bg-fill"
                : "border border-line bg-surface"
            }`}
          >
            <MarkdownBody text={turn.answer} />
            {showRoute ? (
              <p className="mt-2 font-mono text-[11px] text-muted">
                {turn.blocked
                  ? "blocked"
                  : turn.route || "unrouted"}{" "}
                {Number(turn.confidence || 0).toFixed(2)}
              </p>
            ) : null}
          </div>
        </div>
      ))}
      {pendingMessage ? (
        <div className="space-y-1.5">
          <div className="ml-auto max-w-[80%] rounded-md bg-accent px-3 py-2 text-sm text-accent-ink">
            {pendingMessage}
          </div>
          {waiting ? <TypingIndicator /> : null}
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}
