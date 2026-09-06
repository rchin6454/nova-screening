export type PillTone = "neutral" | "success" | "warning" | "danger" | "accent";

const TONE_STYLES: Record<PillTone, string> = {
  neutral: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  success: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  accent: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

export default function StatusPill({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: PillTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${TONE_STYLES[tone]} ${className ?? ""}`}
    >
      {label}
    </span>
  );
}
