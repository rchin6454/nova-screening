"use client";

import { DIMENSION_KEYS, type Rating, type ScoreHistory, type ScoreRow } from "@/lib/types";
import StatusPill, { type PillTone } from "@/components/ui/StatusPill";

const DIMENSION_SHORT_LABELS: Record<(typeof DIMENSION_KEYS)[number], string> = {
  communication: "Communication",
  role_relevant_experience: "Experience",
  motivation_and_fit: "Motivation",
  availability_constraints: "Availability",
};

const DIMENSION_FULL_LABELS: Record<(typeof DIMENSION_KEYS)[number], string> = {
  communication: "Communication",
  role_relevant_experience: "Role-relevant experience",
  motivation_and_fit: "Motivation & fit",
  availability_constraints: "Availability & constraints",
};

const RATING_LABELS: Record<Rating, string> = {
  strong: "Strong",
  adequate: "Adequate",
  weak: "Weak",
  not_assessed: "Not assessed",
};

const RATING_BAR: Record<Rating, string> = {
  strong: "bg-green-500",
  adequate: "bg-amber-500",
  weak: "bg-red-500",
  not_assessed: "bg-zinc-300 dark:bg-zinc-700",
};

const RATING_TEXT: Record<Rating, string> = {
  strong: "text-green-700 dark:text-green-400",
  adequate: "text-amber-700 dark:text-amber-400",
  weak: "text-red-700 dark:text-red-400",
  not_assessed: "text-zinc-400 dark:text-zinc-600",
};

const SCORE_TONE: Record<"high" | "medium" | "low", PillTone> = {
  high: "success",
  medium: "warning",
  low: "danger",
};

export function ScorePill({ score, className }: { score: "high" | "medium" | "low"; className?: string }) {
  return <StatusPill label={score} tone={SCORE_TONE[score]} className={className} />;
}

function DimensionChip({ dimensionKey, rating, evidence }: { dimensionKey: (typeof DIMENSION_KEYS)[number]; rating: Rating; evidence?: string }) {
  return (
    <div
      title={evidence ? `${DIMENSION_FULL_LABELS[dimensionKey]}: ${evidence}` : DIMENSION_FULL_LABELS[dimensionKey]}
      className="rounded-md border border-zinc-100 p-2 text-center dark:border-zinc-800"
    >
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {DIMENSION_SHORT_LABELS[dimensionKey]}
      </p>
      <div className={`mx-auto mt-1.5 h-1.5 w-8 rounded-full ${RATING_BAR[rating]}`} />
      <p className={`mt-1 text-[11px] font-semibold ${RATING_TEXT[rating]}`}>{RATING_LABELS[rating]}</p>
    </div>
  );
}

function versionLabel(row: ScoreRow): string {
  if (row.error_state) return "error";
  if (row.insufficient_evidence) return "insufficient evidence";
  return row.score ?? "unknown";
}

export default function ResultsPanel({
  candidateName,
  roleName,
  scoreHistory,
  selectedVersion,
  onSelectVersion,
  onRescore,
  rescoring,
}: {
  candidateName: string;
  roleName: string;
  scoreHistory: ScoreHistory;
  selectedVersion: number;
  onSelectVersion: (version: number) => void;
  onRescore: () => void;
  rescoring: boolean;
}) {
  const { latest, all_versions } = scoreHistory;
  if (!latest) return null;

  const row = all_versions.find((v) => v.version === selectedVersion) ?? latest;
  const showRescore = latest.error_state;
  const showVersionSelector = all_versions.length > 1;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {candidateName}
          </h2>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{roleName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {row.error_state ? null : row.insufficient_evidence ? (
            <StatusPill label="Insufficient evidence" tone="neutral" />
          ) : (
            row.score && <ScorePill score={row.score} />
          )}
          {showVersionSelector && (
            <select
              value={row.version}
              onChange={(e) => onSelectVersion(Number(e.target.value))}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {all_versions.map((v) => (
                <option key={v.version} value={v.version}>
                  v{v.version} ({versionLabel(v)})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {row.error_state ? (
        <div className="flex flex-col gap-3">
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            Scoring failed, manual review required.
          </p>
          {showRescore && (
            <button
              type="button"
              onClick={onRescore}
              disabled={rescoring}
              className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {rescoring ? "Rescoring…" : "Rescore"}
            </button>
          )}
        </div>
      ) : (
        <>
          {row.dimensions && (
            <div className="grid grid-cols-4 gap-2">
              {DIMENSION_KEYS.map((key) => {
                const dim = row.dimensions?.[key];
                if (!dim) return null;
                return (
                  <DimensionChip key={key} dimensionKey={key} rating={dim.rating} evidence={dim.evidence} />
                );
              })}
            </div>
          )}

          {(row.rationale || row.insufficient_evidence) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {row.insufficient_evidence ? "Not enough evidence to score" : `Why: ${row.score}`}
              </p>
              {row.rationale && (
                <p className="mt-1 text-base font-medium leading-snug text-zinc-900 dark:text-zinc-50">
                  {row.rationale}
                </p>
              )}
              {row.insufficient_evidence && row.unasked_areas && row.unasked_areas.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
                  {row.unasked_areas.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {row.blocking_constraints && row.blocking_constraints.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">Blocking constraints</p>
              <ul className="list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
                {row.blocking_constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {row.time_sensitive_flags && row.time_sensitive_flags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Time-sensitive flags
              </p>
              <ul className="list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
                {row.time_sensitive_flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
