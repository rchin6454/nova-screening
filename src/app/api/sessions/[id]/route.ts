import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getDb();

  const sessions = await sql`SELECT * FROM sessions WHERE id = ${id}`;
  if (sessions.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const scores = await sql`SELECT * FROM scores WHERE session_id = ${id} ORDER BY version DESC LIMIT 1`;

  return NextResponse.json({
    session: sessions[0],
    score: scores.length > 0 ? scores[0] : null,
  });
}
