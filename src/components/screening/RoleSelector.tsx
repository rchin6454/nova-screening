"use client";

import { useState } from "react";
import type { Role } from "@/lib/types";

export default function RoleSelector({
  roles,
  loading,
  error,
  onStart,
}: {
  roles: Role[];
  loading: boolean;
  error: string | null;
  onStart: (roleId: string, candidateName: string) => void;
}) {
  const [roleId, setRoleId] = useState("");
  const [candidateName, setCandidateName] = useState("");

  const canStart = roleId !== "" && candidateName.trim() !== "" && !loading;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Nova Screening</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Start a simulated screening conversation.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Role
        </label>
        <select
          id="role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="" disabled>
            Select a role…
          </option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="candidate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Candidate name
        </label>
        <input
          id="candidate"
          type="text"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          placeholder="Jamie Rivera"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!canStart}
        onClick={() => onStart(roleId, candidateName.trim())}
        className="rounded-md bg-[#6C3FD1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5c33b3] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Starting…" : "Start screening"}
      </button>
    </div>
  );
}
