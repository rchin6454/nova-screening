"use client";

export default function RefusedScreen({
  candidateName,
  onStartNew,
}: {
  candidateName: string;
  onStartNew: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Screening declined</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{candidateName}</p>
      </div>
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {candidateName} chose not to continue with the AI screening. A human recruiter will follow up
        directly. No conversation or score was generated for this session.
      </p>
      <button
        type="button"
        onClick={onStartNew}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        Start a new session
      </button>
    </div>
  );
}
