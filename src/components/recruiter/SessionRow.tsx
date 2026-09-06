"use client";

import { useState } from "react";
import { getEvents, getScore, listMessages, rescoreSession } from "@/lib/api";
import type {
  EventRow,
  Message,
  Role,
  ScoreHistory,
  SessionListItem,
  SessionStatus,
} from "@/lib/types";
import ResultsPanel, { ScorePill } from "@/components/screening/ResultsPanel";
import EventLogPanel from "@/components/screening/EventLogPanel";
import StatusPill from "@/components/ui/StatusPill";
import TranscriptView from "./TranscriptView";

function statusLabel(status: SessionStatus): string {
  switch (status) {
    case "awaiting_consent":
      return "Not started";
    case "active":
      return "In progress";
    case "completed":
      return "Completed";
    case "consent_refused":
      return "Consent refused";
    case "abandoned":
      return "Abandoned";
  }
}

type SummaryBadge =
  | { kind: "score"; score: "high" | "medium" | "low" }
  | { kind: "label"; label: string; tone: "neutral" | "danger" };

function scoreSummary(item: SessionListItem): SummaryBadge {
  if (item.status !== "completed") {
    const label =
      item.status === "active" && !item.candidate_replied ? "Not started" : statusLabel(item.status);
    return { kind: "label", label, tone: "neutral" };
  }
  if (item.error_state) {
    return { kind: "label", label: "Scoring error", tone: "danger" };
  }
  if (item.insufficient_evidence) {
    return { kind: "label", label: "Insufficient evidence", tone: "neutral" };
  }
  if (item.score) {
    return { kind: "score", score: item.score };
  }
  return { kind: "label", label: "Not scored", tone: "neutral" };
}

type DisclosureKey = "conversation" | "job_description" | "resume" | "event_log";

export default function SessionRow({ item, roles }: { item: SessionListItem; roles: Role[] }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [rescoring, setRescoring] = useState(false);
  const [open, setOpen] = useState<Record<DisclosureKey, boolean>>({
    conversation: false,
    job_description: false,
    resume: false,
    event_log: false,
  });

  const role = roles.find((r) => r.id === item.role_id);
  const summary = scoreSummary(item);

  async function toggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (messages === null) {
      setLoading(true);
      const [messagesRes, eventsRes, scoreRes] = await Promise.all([
        listMessages(item.id),
        getEvents(item.id),
        getScore(item.id),
      ]);
      if (messagesRes.status === 200) setMessages(messagesRes.data.messages);
      if (eventsRes.status === 200) setEvents(eventsRes.data.events);
      if (scoreRes.status === 200) {
        setScoreHistory(scoreRes.data);
        if (scoreRes.data.latest) setSelectedVersion(scoreRes.data.latest.version);
      }
      setLoading(false);
    }
  }

  function toggleDisclosure(key: DisclosureKey) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleRescore() {
    setRescoring(true);
    const res = await rescoreSession(item.id);
    setRescoring(false);
    if (res.status === 200) {
      const [scoreRes, eventsRes] = await Promise.all([getScore(item.id), getEvents(item.id)]);
      if (scoreRes.status === 200) {
        setScoreHistory(scoreRes.data);
        if (scoreRes.data.latest) setSelectedVersion(scoreRes.data.latest.version);
      }
      if (eventsRes.status === 200) setEvents(eventsRes.data.events);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {item.candidate_name}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{item.role_name}</p>
          </div>
        </div>
        {summary.kind === "score" ? (
          <ScorePill score={summary.score} />
        ) : (
          <StatusPill label={summary.label} tone={summary.tone} />
        )}
        <span className="shrink-0 text-zinc-400">{expanded ? "▲" : "▼"}</span>
      </button>

      {item.rationale && !expanded && (
        <p className="truncate px-4 pb-3 text-xs text-zinc-500 dark:text-zinc-400">{item.rationale}</p>
      )}

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-zinc-100 px-4 py-4 dark:border-zinc-800">
          {loading ? (
            <p className="text-sm text-zinc-400">Loading…</p>
          ) : (
            <>
              {scoreHistory?.latest && selectedVersion !== null ? (
                <ResultsPanel
                  candidateName={item.candidate_name}
                  roleName={item.role_name}
                  scoreHistory={scoreHistory}
                  selectedVersion={selectedVersion}
                  onSelectVersion={setSelectedVersion}
                  onRescore={handleRescore}
                  rescoring={rescoring}
                />
              ) : (
                <p className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
                  No score yet — this screening hasn&apos;t been completed.
                </p>
              )}

              <div className="flex flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => toggleDisclosure("conversation")}
                  className="flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  View full conversation
                  <span className="text-zinc-400">{open.conversation ? "▲" : "▼"}</span>
                </button>
                {open.conversation && (
                  <div className="px-3 py-3">
                    <TranscriptView messages={messages ?? []} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleDisclosure("job_description")}
                  className="flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  View job description
                  <span className="text-zinc-400">{open.job_description ? "▲" : "▼"}</span>
                </button>
                {open.job_description && (
                  <div className="px-3 py-3">
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {role?.description ?? "Role description unavailable."}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleDisclosure("resume")}
                  className="flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  View resume
                  <span className="text-zinc-400">{open.resume ? "▲" : "▼"}</span>
                </button>
                {open.resume && (
                  <div className="px-3 py-3">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Resume viewing isn&apos;t wired up in this prototype — resume data lives outside this
                      system and isn&apos;t connected here.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleDisclosure("event_log")}
                  className="flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  View event log
                  <span className="text-zinc-400">{open.event_log ? "▲" : "▼"}</span>
                </button>
                {open.event_log && (
                  <div className="h-64 p-3">
                    <EventLogPanel events={events ?? []} roles={roles} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
