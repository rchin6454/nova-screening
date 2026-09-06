import type {
  EventRow,
  Message,
  Role,
  ScoreHistory,
  ScoreRow,
  Session,
  SessionListItem,
} from "./types";

export interface ApiResult<T> {
  status: number;
  data: T;
}

class NetworkError extends Error {}

async function request<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new NetworkError(err instanceof Error ? err.message : "Network error");
  }
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

const jsonHeaders = { "Content-Type": "application/json" };

export { NetworkError };

export function listRoles() {
  return request<{ roles: Role[] }>("/api/roles");
}

export function createSession(role_id: string, candidate_name: string) {
  return request<{ session: Session } & { error?: string }>("/api/sessions", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ role_id, candidate_name }),
  });
}

export function listSessions() {
  return request<{ sessions: SessionListItem[] } & { error?: string }>("/api/sessions");
}

export function getSession(id: string) {
  return request<{ session: Session; score: ScoreRow | null } & { error?: string }>(
    `/api/sessions/${id}`
  );
}

export function giveConsent(id: string, consent: boolean) {
  return request<
    { session: Session; greeting?: Message } & { error?: string }
  >(`/api/sessions/${id}/consent`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ consent }),
  });
}

export function listMessages(id: string) {
  return request<{ messages: Message[] } & { error?: string }>(
    `/api/sessions/${id}/messages`
  );
}

export function sendMessage(id: string, content: string) {
  return request<
    { message: Message; reply: Message; session: Session } & { error?: string }
  >(`/api/sessions/${id}/messages`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ content }),
  });
}

export function endSession(id: string) {
  return request<{ score: ScoreRow } & { error?: string }>(
    `/api/sessions/${id}/end`,
    { method: "POST" }
  );
}

export function rescoreSession(id: string) {
  return request<{ score: ScoreRow } & { error?: string }>(
    `/api/sessions/${id}/rescore`,
    { method: "POST" }
  );
}

export function getScore(id: string) {
  return request<ScoreHistory & { error?: string }>(`/api/sessions/${id}/score`);
}

export function getEvents(id: string) {
  return request<{ events: EventRow[] } & { error?: string }>(
    `/api/sessions/${id}/events`
  );
}
