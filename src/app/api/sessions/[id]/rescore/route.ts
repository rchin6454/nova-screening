import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { scoreSession } from "@/lib/scoreSession";

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
  if (sessions[0].status !== "completed") {
    return NextResponse.json(
      { error: "Session must be completed before rescoring" },
      { status: 409 }
    );
  }

  const score = await scoreSession(sql, id);
  return NextResponse.json({ score });
}
