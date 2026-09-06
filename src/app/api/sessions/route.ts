import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();

  const sessions = await sql`
    SELECT
      s.id,
      s.candidate_name,
      s.status,
      s.created_at,
      s.ended_at,
      r.id AS role_id,
      r.name AS role_name,
      r.role_family,
      latest_score.score,
      latest_score.rationale,
      latest_score.version AS score_version,
      latest_score.insufficient_evidence,
      latest_score.error_state,
      EXISTS(
        SELECT 1 FROM messages WHERE messages.session_id = s.id AND messages.role = 'user'
      ) AS candidate_replied
    FROM sessions s
    JOIN roles r ON r.id = s.role_id
    LEFT JOIN LATERAL (
      SELECT score, rationale, version, insufficient_evidence, error_state
      FROM scores
      WHERE scores.session_id = s.id
      ORDER BY version DESC
      LIMIT 1
    ) latest_score ON true
    ORDER BY s.created_at DESC
  `;

  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { role_id, candidate_name } = body;

  if (!role_id || !candidate_name) {
    return NextResponse.json(
      { error: "role_id and candidate_name are required" },
      { status: 400 }
    );
  }

  const sql = getDb();

  const roles = await sql`SELECT id FROM roles WHERE id = ${role_id}`;
  if (roles.length === 0) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const rows = await sql`INSERT INTO sessions (role_id, candidate_name) VALUES (${role_id}, ${candidate_name}) RETURNING *`;
  const session = rows[0];

  await logEvent(session.id as string, "session_started", {
    role_id,
    candidate_name,
  });

  return NextResponse.json({ session }, { status: 201 });
}
