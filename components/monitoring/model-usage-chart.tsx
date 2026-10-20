"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";
import type { ModelBreakdown } from "@/lib/dummy/types";

type Metric = "requests" | "tokens";

/**
 * Ranked list. On mobile the percentage column is dropped and the model name
 * wraps instead of truncating, so the numbers are never squeezed.
 */
export function ModelUsageChart({
  rows,
  dict,
}: {
  rows: ModelBreakdown[];
  dict: Dictionary;
}) {
  const [metric, setMetric] = useState<Metric>("tokens");

  const ranked = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b[metric] - a[metric])
        .slice(0, 9)
        .map((row) => ({ name: row.modelName, value: row[metric] })),
    [rows, metric],
  );

  const max = ranked[0]?.value ?? 1;

  const metrics: { id: Metric; label: string }[] = [
    { id: "requests", label: dict.monitoring.metricRequests },
    { id: "tokens", label: dict.monitoring.metricTokens },
  ];

  return (
    <Card
      corners
      tone="accent"
    >
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="relative min-w-0">
          <h2 className="text-base font-semibold text-text">
            {dict.monitoring.modelUsageTitle}
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            {dict.monitoring.modelUsageSubtitle}
          </p>
        </div>

        <div
          role="group"
          aria-label={dict.monitoring.metricSelectorLabel}
          className="relative flex shrink-0 items-center gap-0.5 rounded-md border border-border p-0.5"
        >
          {metrics.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMetric(item.id)}
              aria-pressed={metric === item.id}
              className={cn(
                "rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
                metric === item.id
                  ? "bg-surface-raised text-text"
                  : "text-text-muted hover:text-text",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="divide-y divide-border">
        {ranked.map((row, index) => {
          const width = Math.max(2, (row.value / max) * 100);

          return (
            <li
              key={row.name}
              className={cn(
                "relative px-4 py-3 sm:px-5",
                index === 0 &&
                  "bg-linear-to-r from-accent/[0.06] to-transparent",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className={cn(
                      "tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                      index === 0
                        ? "bg-accent/15 text-accent"
                        : "bg-bg text-text-faint",
                    )}
                  >
                    {index + 1}
                  </span>
                  <p className="min-w-0 break-words text-sm font-medium leading-5 text-text">
                    {row.name}
                  </p>
                </div>

                <p className="tabular shrink-0 text-sm font-semibold text-text">
                  {formatNumber(row.value)}
                </p>
              </div>

              <div className="mt-2 pl-[2.125rem]">
                <span className="block h-2 overflow-hidden rounded-full bg-bg">
                  <span
                    className="animate-bar block h-full rounded-full bg-linear-to-r from-primary to-accent"
                    style={{ width: `${width}%` }}
                  />
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
