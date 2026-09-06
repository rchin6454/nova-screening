import { Type, type Schema } from "@google/genai";
import { getGemini, SCORING_MODEL } from "./gemini";
import { COVERAGE_CHECK_PROMPT } from "./prompts";

const COVERAGE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    communication: { type: Type.BOOLEAN },
    role_relevant_experience: { type: Type.BOOLEAN },
    motivation_and_fit: { type: Type.BOOLEAN },
    availability_constraints: { type: Type.BOOLEAN },
  },
  required: [
    "communication",
    "role_relevant_experience",
    "motivation_and_fit",
    "availability_constraints",
  ],
};

function buildTranscript(messages: { role: string; content: string }[]): string {
  return messages
    .map((m) => `${m.role === "assistant" ? "Nova" : "Candidate"}: ${m.content}`)
    .join("\n\n");
}

/**
 * Lightweight yes/no coverage check run after every candidate turn
 * (spec section 3.6) — cheaper than the full scoring call, which still
 * runs exactly once, only when the session actually ends. Returns
 * true only when all four dimensions have been meaningfully addressed.
 *
 * Fails open (returns false, i.e. "keep going") on any error — this is
 * a supplementary check, not part of the core chat path, so a failure
 * here must never turn a successful reply into a 502 for the candidate.
 */
export async function isConversationSufficient(
  roleFamily: string,
  roleDescription: string,
  messages: { role: string; content: string }[]
): Promise<boolean> {
  try {
    const transcript = buildTranscript(messages);
    const prompt = COVERAGE_CHECK_PROMPT.replace("{{ROLE_FAMILY}}", roleFamily)
      .replace("{{ROLE_DESCRIPTION}}", roleDescription)
      .replace("{{TRANSCRIPT}}", transcript);

    const gemini = getGemini();
    const response = await gemini.models.generateContent({
      model: SCORING_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: COVERAGE_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text ?? "{}");
    return (
      parsed.communication === true &&
      parsed.role_relevant_experience === true &&
      parsed.motivation_and_fit === true &&
      parsed.availability_constraints === true
    );
  } catch {
    return false;
  }
}
