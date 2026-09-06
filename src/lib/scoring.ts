const VALID_SCORES = ["high", "medium", "low"] as const;
const VALID_RATINGS = ["strong", "adequate", "weak", "not_assessed"] as const;
const DIMENSION_KEYS = [
  "communication",
  "role_relevant_experience",
  "motivation_and_fit",
  "availability_constraints",
] as const;

export interface ScoreDimension {
  rating: string;
  evidence: string;
}

export interface ScoreResult {
  score: string;
  rationale: string;
  dimensions: Record<string, ScoreDimension>;
  blocking_constraints: string[];
  time_sensitive_flags: string[];
  insufficient_evidence: boolean;
  unasked_areas: string[];
}

export function validateScoreResult(raw: unknown): ScoreResult | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  if (!VALID_SCORES.includes(obj.score as (typeof VALID_SCORES)[number]))
    return null;
  if (typeof obj.rationale !== "string" || obj.rationale.length === 0)
    return null;
  if (typeof obj.dimensions !== "object" || obj.dimensions === null)
    return null;

  const dims = obj.dimensions as Record<string, unknown>;
  for (const key of DIMENSION_KEYS) {
    const dim = dims[key];
    if (typeof dim !== "object" || dim === null) return null;
    const d = dim as Record<string, unknown>;
    if (!VALID_RATINGS.includes(d.rating as (typeof VALID_RATINGS)[number]))
      return null;
    if (typeof d.evidence !== "string") return null;
  }

  if (typeof obj.insufficient_evidence !== "boolean") return null;

  const blocking = obj.blocking_constraints;
  if (!Array.isArray(blocking) || !blocking.every((x) => typeof x === "string"))
    return null;

  const flags = obj.time_sensitive_flags;
  if (!Array.isArray(flags) || !flags.every((x) => typeof x === "string"))
    return null;

  const unasked = obj.unasked_areas;
  if (!Array.isArray(unasked) || !unasked.every((x) => typeof x === "string"))
    return null;

  return {
    score: obj.score as string,
    rationale: obj.rationale as string,
    dimensions: obj.dimensions as Record<string, ScoreDimension>,
    blocking_constraints: blocking as string[],
    time_sensitive_flags: flags as string[],
    insufficient_evidence: obj.insufficient_evidence,
    unasked_areas: unasked as string[],
  };
}
