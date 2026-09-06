"use client";

import { useState } from "react";
import type { Message } from "@/lib/types";

export default function ChatPanel({
  messages,
  inputEnabled,
  disabledReason,
  sending,
  sendError,
  onSend,
  endButton,
}: {
  messages: Message[];
  inputEnabled: boolean;
  disabledReason: string | null;
  sending: boolean;
  sendError: string | null;
  onSend: (content: string) => void;
  endButton: { onClick: () => void; loading: boolean } | null;
}) {
  const [draft, setDraft] = useState("");
  const [confirmingEnd, setConfirmingEnd] = useState(false);

  const submit = () => {
    const content = draft.trim();
    if (!content || sending) return;
    onSend(content);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl bg-zinc-100 px-4 py-2 text-sm text-zinc-400 dark:bg-zinc-800">
              Nova is responding…
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        {sendError && (
          <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            {sendError}
          </p>
        )}

        {inputEnabled ? (
          confirmingEnd ? (
            <div className="flex items-center justify-between gap-2 rounded-md bg-amber-50 px-3 py-2 dark:bg-amber-950">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                End the screening now? You won&apos;t be able to send more messages after this.
              </p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingEnd(false)}
                  disabled={endButton?.loading}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={endButton?.onClick}
                  disabled={endButton?.loading}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  {endButton?.loading ? "Ending…" : "Yes, end it"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder="Type your reply…"
                className="flex-1 resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={submit}
                disabled={sending || draft.trim() === ""}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Send
              </button>
              {endButton && (
                <button
                  type="button"
                  onClick={() => setConfirmingEnd(true)}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  End screening
                </button>
              )}
            </div>
          )
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{disabledReason}</p>
        )}
      </div>
    </div>
  );
}
