import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Large hero statistic. */
export function StatCard({
  label,
  value,
  suffix,
  footnote,
  icon,
  className,
  accent = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  footnote?: ReactNode;
  icon?: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface-lift group relative overflow-hidden rounded-lg border border-border bg-surface px-5 py-5 transition-colors hover:border-border-strong",
        className,
      )}
    >
      {accent ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-2xl"
          />
          {/* Bottom hairline gradient: grounds the panel without a full border. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent"
          />
        </>
      ) : null}

      <div className="flex items-center gap-2 text-text-faint">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>

      <p className="relative mt-3 text-4xl font-bold leading-none tracking-tighter text-text sm:text-5xl [font-variant-numeric:tabular-nums]">
        {value}
        {suffix ? (
          <span className="ml-2 text-sm font-medium text-text-muted">
            {suffix}
          </span>
        ) : null}
      </p>

      {footnote ? (
        <div className="relative mt-2 text-xs text-text-faint">{footnote}</div>
      ) : null}
    </div>
  );
}

export function LiveCard({
  label,
  value,
  unit,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "error";
}) {
  const toneClass = {
    neutral: "text-text",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  }[tone];

  return (
    <div className="surface-lift rounded-lg border border-border bg-surface px-4 py-4 transition-colors hover:border-border-strong">
      <p className="text-xs font-medium uppercase tracking-wide text-text-faint">
        {label}
      </p>
      <p className={cn("tabular mt-2 text-xl font-bold leading-none", toneClass)}>
        {value}
        {unit ? (
          <span className="ml-1 text-xs font-medium text-text-muted">{unit}</span>
        ) : null}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-text-faint">{hint}</p> : null}
    </div>
  );
}
