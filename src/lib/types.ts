export type SessionStatus =
  | "awaiting_consent"
  | "active"
  | "completed"
  | "consent_refused"
  | "abandoned";

export interface Role {
  id: string;
  name: string;
  role_family: "engineering" | "frontline";
  description: string;
  created_at: string;
}

export interface Session {
  id: string;
  role_id: string;
  candidate_name: string;
  status: SessionStatus;
  created_at: string;
  ended_at: string | null;
}

export interface SessionListItem {
  id: string;
  candidate_name: string;
  status: SessionStatus;
  created_at: string;
  ended_at: string | null;
  role_id: string;
  role_name: string;
  role_family: "engineering" | "frontline";
  score: "high" | "medium" | "low" | null;
  rationale: string | null;
  score_version: number | null;
  insufficient_evidence: boolean | null;
  error_state: boolean | null;
  candidate_replied: boolean;
}

export interface Message {
  id: string;
  session_id: string;
  role: "assistant" | "user";
  content: string;
  created_at: string;
}

export type Rating = "strong" | "adequate" | "weak" | "not_assessed";

export interface ScoreDimension {
  rating: Rating;
  evidence: string;
}

export const DIMENSION_KEYS = [
  "communication",
  "role_relevant_experience",
  "motivation_and_fit",
  "availability_constraints",
] as const;

export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export interface ScoreRow {
  id: string;
  session_id: string;
  version: number;
  score: "high" | "medium" | "low" | null;
  rationale: string | null;
  dimensions: Record<DimensionKey, ScoreDimension> | null;
  blocking_constraints: string[] | null;
  time_sensitive_flags: string[] | null;
  insufficient_evidence: boolean | null;
  unasked_areas: string[] | null;
  error_state: boolean;
  raw_response: string | null;
  created_at: string;
}

export interface ScoreHistory {
  latest: ScoreRow | null;
  all_versions: ScoreRow[];
}

export type EventType =
  | "session_started"
  | "consent_given"
  | "consent_refused"
  | "message_sent"
  | "session_ended"
  | "score_generated"
  | "insufficient_evidence_flagged"
  | "blocking_constraint_detected";

export interface EventRow {
  id: string;
  session_id: string;
  event_type: EventType;
  payload: Record<string, unknown> | null;
  created_at: string;
}
