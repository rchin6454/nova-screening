import type { EventRow, Role } from "@/lib/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function describeEvent(event: EventRow, roles: Role[]): string {
  const payload = event.payload ?? {};

  switch (event.event_type) {
    case "session_started": {
      const roleId = payload.role_id as string | undefined;
      const candidateName = (payload.candidate_name as string | undefined) ?? "Candidate";
      const roleName = roles.find((r) => r.id === roleId)?.name ?? "Unknown role";
      return `Session started: ${candidateName} — ${roleName}`;
    }
    case "consent_given":
      return "Consent given";
    case "consent_refused":
      return "Consent refused";
    case "session_ended":
      return "Session ended";
    case "message_sent": {
      const role = payload.role as string | undefined;
      return role === "assistant" ? "Nova replied" : "Candidate replied";
    }
    case "score_generated": {
      const scoreVal = payload.error ? "error" : (payload.score as string | null) ?? "null";
      const version = payload.version as number | undefined;
      const overridden = payload.score_overridden as boolean | undefined;
      return `Score generated: ${scoreVal} (v${version}${overridden ? ", overridden" : ""})`;
    }
    case "insufficient_evidence_flagged": {
      const areas = (payload.unasked_areas as string[] | undefined) ?? [];
      return `Insufficient evidence flagged: ${areas.length > 0 ? areas.join(", ") : "no areas listed"}`;
    }
    case "blocking_constraint_detected": {
      const constraint = (payload.constraint as string | undefined) ?? "unspecified";
      return `Blocking constraint: ${constraint}`;
    }
    default:
      return event.event_type;
  }
}

export default function EventLogPanel({
  events,
  roles,
}: {
  events: EventRow[];
  roles: Role[];
}) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Event Log</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Audit trail for this demo session</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {events.length === 0 ? (
          <p className="text-sm text-zinc-400">No events yet.</p>
        ) : (
          <ol className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="text-xs leading-relaxed">
                <span className="text-zinc-400">{formatTime(event.created_at)}</span>{" "}
                <span className="text-zinc-700 dark:text-zinc-300">{describeEvent(event, roles)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
