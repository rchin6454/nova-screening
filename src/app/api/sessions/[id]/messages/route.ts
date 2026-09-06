import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getGemini, toGeminiContents, CONVERSATION_MODEL } from "@/lib/gemini";
import { CONVERSATION_SYSTEM_PROMPT } from "@/lib/prompts";
import { logEvent } from "@/lib/events";
import { completeSession } from "@/lib/scoreSession";
import { isConversationSufficient } from "@/lib/coverageCheck";

const TURN_CAP = 20;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getDb();

  const sessions = await sql`SELECT id FROM sessions WHERE id = ${id}`;
  if (sessions.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const messages = await sql`SELECT * FROM messages WHERE session_id = ${id} ORDER BY created_at`;
  return NextResponse.json({ messages });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { error: "content (string) is required" },
      { status: 400 }
    );
  }

  const sql = getDb();

  const sessions = await sql`SELECT s.*, r.role_family, r.description as role_description FROM sessions s JOIN roles r ON s.role_id = r.id WHERE s.id = ${id}`;
  if (sessions.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const session = sessions[0];
  if (session.status !== "active") {
    return NextResponse.json(
      { error: "Session is not active" },
      { status: 409 }
    );
  }

  const userMsg = await sql`INSERT INTO messages (session_id, role, content) VALUES (${id}, 'user', ${content}) RETURNING *`;
  await logEvent(id, "message_sent", { role: "user" });

  const history = await sql`SELECT role, content FROM messages WHERE session_id = ${id} ORDER BY created_at`;

  const systemPrompt = CONVERSATION_SYSTEM_PROMPT.replace(
    "{{ROLE_FAMILY}}",
    session.role_family as string
  ).replace("{{ROLE_DESCRIPTION}}", session.role_description as string);

  let replyText: string;
  try {
    const gemini = getGemini();
    const response = await gemini.models.generateContent({
      model: CONVERSATION_MODEL,
      contents: toGeminiContents(
        session.candidate_name as string,
        history.map((m) => ({ role: m.role as string, content: m.content as string }))
      ),
      config: {
        systemInstruction: systemPrompt,
      },
    });
    replyText =
      response.text || "I appreciate you sharing that. Could you tell me more?";
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini call failed";
    return NextResponse.json(
      { error: `Failed to generate reply: ${message}` },
      { status: 502 }
    );
  }

  const replyMsg = await sql`INSERT INTO messages (session_id, role, content) VALUES (${id}, 'assistant', ${replyText}) RETURNING *`;
  await logEvent(id, "message_sent", { role: "assistant" });

  const turnCount = await sql`SELECT COUNT(*)::int AS count FROM messages WHERE session_id = ${id} AND role = 'user'`;
  const turnsSoFar = turnCount[0].count as number;

  const hitTurnCap = turnsSoFar >= TURN_CAP;
  const sufficient =
    !hitTurnCap &&
    (await isConversationSufficient(
      session.role_family as string,
      session.role_description as string,
      [...history, { role: "assistant", content: replyText }].map((m) => ({
        role: m.role as string,
        content: m.content as string,
      }))
    ));

  if (hitTurnCap || sufficient) {
    await completeSession(sql, id);
  }

  const finalSession = await sql`SELECT * FROM sessions WHERE id = ${id}`;

  return NextResponse.json({
    message: userMsg[0],
    reply: replyMsg[0],
    session: finalSession[0],
  });
}
