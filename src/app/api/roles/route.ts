import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();
  const roles = await sql`SELECT * FROM roles ORDER BY created_at`;
  return NextResponse.json({ roles });
}
