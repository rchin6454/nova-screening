"use client";

export default function ConsentScreen({
  candidateName,
  roleName,
  loading,
  error,
  onAccept,
  onDecline,
}: {
  candidateName: string;
  roleName: string;
  loading: "accept" | "decline" | null;
  error: string | null;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Before we begin</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {candidateName} · {roleName}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        You may be speaking with Nova, an AI screening assistant, not a human recruiter. Nova will ask
        you a few questions to understand your background and interest in this role. Do you consent
        to continuing with an AI screening conversation?
      </p>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={loading !== null}
          onClick={onAccept}
          className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading === "accept" ? "Starting…" : "Yes, continue"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={onDecline}
          className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {loading === "decline" ? "Ending…" : "No, I would rather not"}
        </button>
      </div>
    </div>
  );
}
