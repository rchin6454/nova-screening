"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listRoles, listSessions } from "@/lib/api";
import type { Role, SessionListItem } from "@/lib/types";
import SessionRow from "@/components/recruiter/SessionRow";

export default function RecruiterPage() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listSessions(), listRoles()])
      .then(([sessionsRes, rolesRes]) => {
        if (sessionsRes.status === 200) setSessions(sessionsRes.data.sessions ?? []);
        else setError(sessionsRes.data.error ?? "Could not load candidates.");
        if (rolesRes.status === 200) setRoles(rolesRes.data.roles ?? []);
      })
      .catch(() => setError("Network error, please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Nova Screening — Recruiter
        </span>
        <Link
          href="/"
          className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Candidate view
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Candidates</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Confidence scores, rationale, and full transcripts for every screening.
          </p>
        </div>

        {loading && <p className="text-sm text-zinc-500">Loading candidates…</p>}
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        {!loading && !error && sessions.length === 0 && (
          <p className="text-sm text-zinc-400">No screenings yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {sessions.map((item) => (
            <SessionRow key={item.id} item={item} roles={roles} />
          ))}
        </div>
      </main>
    </div>
  );
}
