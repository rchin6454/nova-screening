import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { completeSession } from "@/lib/scoreSession";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getDb();

  const sessions = await sql`SELECT id, status FROM sessions WHERE id = ${id}`;
  if (sessions.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (sessions[0].status !== "active") {
    return NextResponse.json(
      { error: "Session is not active" },
      { status: 409 }
    );
  }

  const score = await completeSession(sql, id);

  return NextResponse.json({ score });
}
