import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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

  const events = await sql`SELECT * FROM events WHERE session_id = ${id} ORDER BY created_at`;

  return NextResponse.json({ events });
}
