import { GoogleGenAI } from "@google/genai";

export const CONVERSATION_MODEL = "gemini-flash-lite-latest";
export const SCORING_MODEL = "gemini-flash-lite-latest";

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return client;
}

/**
 * The stored transcript always starts with Nova's greeting (a "model"
 * turn), but Gemini's contents array is safest treated as user-first
 * (matching the same instruction turn originally used to prompt that
 * greeting). Doesn't change what's persisted in the messages table.
 */
export function toGeminiContents(
  candidateName: string,
  history: { role: string; content: string }[]
): { role: string; parts: { text: string }[] }[] {
  const mapped = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  if (mapped.length > 0 && mapped[0].role === "model") {
    mapped.unshift({
      role: "user",
      parts: [
        {
          text: `The candidate's name is ${candidateName}. Begin the screening conversation with a greeting.`,
        },
      ],
    });
  }

  return mapped;
}
