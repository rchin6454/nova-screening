import { Type, type Schema } from "@google/genai";
import { getDb } from "./db";
import { getGemini, SCORING_MODEL } from "./gemini";
import { SCORING_SYSTEM_PROMPT } from "./prompts";
import { validateScoreResult, ScoreResult } from "./scoring";
import { logEvent } from "./events";

const MAX_ATTEMPTS = 2;

const DIMENSION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    rating: {
      type: Type.STRING,
      format: "enum",
      enum: ["strong", "adequate", "weak", "not_assessed"],
    },
    evidence: { type: Type.STRING },
  },
  required: ["rating", "evidence"],
};

const SCORE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.STRING, format: "enum", enum: ["high", "medium", "low"] },
    rationale: { type: Type.STRING },
    dimensions: {
      type: Type.OBJECT,
      properties: {
        communication: DIMENSION_SCHEMA,
        role_relevant_experience: DIMENSION_SCHEMA,
        motivation_and_fit: DIMENSION_SCHEMA,
        availability_constraints: DIMENSION_SCHEMA,
      },
      required: [
        "communication",
        "role_relevant_experience",
        "motivation_and_fit",
        "availability_constraints",
      ],
    },
    blocking_constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
    time_sensitive_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
    insufficient_evidence: { type: Type.BOOLEAN },
    unasked_areas: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "score",
    "rationale",
    "dimensions",
    "blocking_constraints",
    "time_sensitive_flags",
    "insufficient_evidence",
    "unasked_areas",
  ],
};

function buildTranscript(messages: { role: string; content: string }[]): string {
  return messages
    .map((m) => `${m.role === "assistant" ? "Nova" : "Candidate"}: ${m.content}`)
    .join("\n\n");
}

async function callScoringModel(prompt: string): Promise<string> {
  const gemini = getGemini();
  const response = await gemini.models.generateContent({
    model: SCORING_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: SCORE_SCHEMA,
    },
  });
  return response.text ?? "";
}

/**
 * The scoring prompt tells the model to score "low" whenever
 * blocking_constraints is non-empty, or whenever its own "Step 1 hard
 * trigger" fires: role_relevant_experience or motivation_and_fit rated
 * weak, or two or more dimensions rated weak. That's model-side
 * compliance, not a guarantee. Enforce both here so a prompt-drift or
 * one-off model mistake can't hand a recruiter a "medium"/"high" score
 * that contradicts the very ratings the model itself gave (the
 * production bug this fixes: a candidate whose only "relevant
 * experience" example was off-topic for the role scored "medium"
 * instead of the "low" the ratings actually supported).
 *
 * insufficient_evidence does NOT trigger this clamp: the model's own
 * score is persisted as-is, and the frontend withholds the score badge
 * from the recruiter's view instead (see results panel spec).
 */
function enforceScoreConsistency(result: ScoreResult): {
  result: ScoreResult;
  overridden: boolean;
} {
  const weakCount = Object.values(result.dimensions).filter((d) => d.rating === "weak").length;
  const mustBeLow =
    result.blocking_constraints.length > 0 ||
    result.dimensions.role_relevant_experience?.rating === "weak" ||
    result.dimensions.motivation_and_fit?.rating === "weak" ||
    weakCount >= 2;

  if (mustBeLow && result.score !== "low") {
    return { result: { ...result, score: "low" }, overridden: true };
  }
  return { result, overridden: false };
}

async function generateScore(
  roleFamily: string,
  roleDescription: string,
  transcript: string
): Promise<{
  result: ScoreResult | null;
  rawResponse: string;
  overridden: boolean;
}> {
  const scoringPrompt = SCORING_SYSTEM_PROMPT.replace("{{ROLE_FAMILY}}", roleFamily)
    .replace("{{ROLE_DESCRIPTION}}", roleDescription)
    .replace("{{TRANSCRIPT}}", transcript);

  let rawResponse = "";
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      rawResponse = await callScoringModel(scoringPrompt);
      const parsed = validateScoreResult(JSON.parse(rawResponse));
      if (parsed) {
        const { result, overridden } = enforceScoreConsistency(parsed);
        return { result, rawResponse, overridden };
      }
    } catch (err) {
      // Covers both malformed JSON and the API call itself failing
      // (network error, rate limit, etc). Retry once, then persist
      // an error-state row rather than crashing the request.
      if (!rawResponse) {
        rawResponse = err instanceof Error ? err.message : "Scoring call failed";
      }
    }
  }
  return { result: null, rawResponse, overridden: false };
}

/**
 * Runs the scoring call against a session's transcript and persists a new
 * score version. Shared by POST /end (first score) and POST /rescore
 * (re-run against the same transcript, e.g. after a prompt tweak).
 */
export async function scoreSession(sql: ReturnType<typeof getDb>, sessionId: string) {
  const sessions = await sql`
    SELECT r.role_family, r.description AS role_description
    FROM sessions s JOIN roles r ON r.id = s.role_id
    WHERE s.id = ${sessionId}
  `;
  const { role_family: roleFamily, role_description: roleDescription } = sessions[0];

  const messages = await sql`SELECT role, content FROM messages WHERE session_id = ${sessionId} ORDER BY created_at`;
  const transcript = buildTranscript(
    messages.map((m) => ({ role: m.role as string, content: m.content as string }))
  );

  const { result, rawResponse, overridden } = await generateScore(
    roleFamily as string,
    roleDescription as string,
    transcript
  );

  const [scoreRow] = result
    ? await sql`
        WITH next_version AS (
          SELECT COALESCE(MAX(version), 0) + 1 AS v FROM scores WHERE session_id = ${sessionId}
        )
        INSERT INTO scores (session_id, version, score, rationale, dimensions, blocking_constraints, time_sensitive_flags, insufficient_evidence, unasked_areas, raw_response)
        SELECT ${sessionId}, v, ${result.score}, ${result.rationale},
               ${JSON.stringify(result.dimensions)}::jsonb,
               ${JSON.stringify(result.blocking_constraints)}::jsonb,
               ${JSON.stringify(result.time_sensitive_flags)}::jsonb,
               ${result.insufficient_evidence},
               ${JSON.stringify(result.unasked_areas)}::jsonb,
               ${rawResponse}
        FROM next_version
        RETURNING *`
    : await sql`
        WITH next_version AS (
          SELECT COALESCE(MAX(version), 0) + 1 AS v FROM scores WHERE session_id = ${sessionId}
        )
        INSERT INTO scores (session_id, version, error_state, raw_response)
        SELECT ${sessionId}, v, true, ${rawResponse}
        FROM next_version
        RETURNING *`;

  await logEvent(sessionId, "score_generated", {
    score: result?.score ?? null,
    error: !result,
    version: scoreRow.version,
    score_overridden: overridden,
  });

  if (result?.insufficient_evidence) {
    await logEvent(sessionId, "insufficient_evidence_flagged", {
      unasked_areas: result.unasked_areas,
    });
  }

  for (const constraint of result?.blocking_constraints ?? []) {
    await logEvent(sessionId, "blocking_constraint_detected", { constraint });
  }

  return scoreRow;
}

/**
 * Runs scoring and transitions a session to completed. Shared by the
 * manual POST /end route and the automatic end-of-screening path inside
 * POST /messages (turn cap or coverage check firing) — both end a
 * session identically, one score generated, one `session_ended` event.
 */
export async function completeSession(sql: ReturnType<typeof getDb>, sessionId: string) {
  const score = await scoreSession(sql, sessionId);
  await sql`UPDATE sessions SET status = 'completed', ended_at = now() WHERE id = ${sessionId}`;
  await logEvent(sessionId, "session_ended");
  return score;
}
