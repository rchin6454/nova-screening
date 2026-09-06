import { getDb } from "./db";

export type EventType =
  | "session_started"
  | "consent_given"
  | "consent_refused"
  | "message_sent"
  | "session_ended"
  | "score_generated"
  | "insufficient_evidence_flagged"
  | "blocking_constraint_detected";

export async function logEvent(
  sessionId: string,
  eventType: EventType,
  payload?: Record<string, unknown>
) {
  const sql = getDb();
  await sql`INSERT INTO events (session_id, event_type, payload) VALUES (${sessionId}, ${eventType}, ${payload ? JSON.stringify(payload) : null})`;
}
