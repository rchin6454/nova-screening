import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getGemini, CONVERSATION_MODEL } from "@/lib/gemini";
import { CONVERSATION_SYSTEM_PROMPT } from "@/lib/prompts";
import { logEvent } from "@/lib/events";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { consent } = body;

  if (typeof consent !== "boolean") {
    return NextResponse.json(
      { error: "consent (boolean) is required" },
      { status: 400 }
    );
  }

  const sql = getDb();

  const sessions = await sql`SELECT * FROM sessions WHERE id = ${id}`;
  if (sessions.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const session = sessions[0];
  if (session.status !== "awaiting_consent") {
    return NextResponse.json(
      { error: "Session is not awaiting consent" },
      { status: 409 }
    );
  }

  if (!consent) {
    await sql`UPDATE sessions SET status = 'consent_refused', ended_at = now() WHERE id = ${id}`;
    await logEvent(id, "consent_refused");

    const updated = await sql`SELECT * FROM sessions WHERE id = ${id}`;
    return NextResponse.json({ session: updated[0] });
  }

  const roles = await sql`SELECT * FROM roles WHERE id = ${session.role_id}`;
  const role = roles[0];

  const systemPrompt = CONVERSATION_SYSTEM_PROMPT.replace(
    "{{ROLE_FAMILY}}",
    role.role_family as string
  ).replace("{{ROLE_DESCRIPTION}}", role.description as string);

  let greetingText: string;
  try {
    const gemini = getGemini();
    const response = await gemini.models.generateContent({
      model: CONVERSATION_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `The candidate's name is ${session.candidate_name}. Begin the screening conversation with a greeting.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
      },
    });
    greetingText = response.text || "Hello! Thanks for joining.";
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini call failed";
    return NextResponse.json(
      { error: `Failed to generate greeting: ${message}` },
      { status: 502 }
    );
  }

  await sql`UPDATE sessions SET status = 'active' WHERE id = ${id}`;
  await logEvent(id, "consent_given");

  const greetingRows = await sql`INSERT INTO messages (session_id, role, content) VALUES (${id}, 'assistant', ${greetingText}) RETURNING *`;

  await logEvent(id, "message_sent", { role: "assistant" });

  const updated = await sql`SELECT * FROM sessions WHERE id = ${id}`;
  return NextResponse.json({
    session: updated[0],
    greeting: greetingRows[0],
  });
}
