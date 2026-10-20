"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/monitoring/animated-number";

/** Adoption counters tick every three seconds, matching the monitoring row. */
export const STATS_REFRESH_MS = 3_000;

/**
 * Adoption counters that grow over time. A single timer per card is avoided by
 * letting the parent own the interval; this component only renders.
 */
export function LiveStatValue({
  value,
  growBy,
  className,
}: {
  value: number;
  growBy: number;
  className?: string;
}) {
  const [current, setCurrent] = useState(value);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCurrent((previous) => previous + growBy);
    }, STATS_REFRESH_MS);

    return () => window.clearInterval(id);
  }, [growBy]);

  return <AnimatedNumber value={current} durationMs={800} className={className} />;
}

/** Deterministic per-model growth so figures move without random jitter. */
export function growthFor(id: string, base: number): number {
  let hash = 0;

  for (let index = 0; index < id.length; index++) {
    hash = (hash * 31 + id.charCodeAt(index)) % 10_000;
  }

  return Math.max(1, Math.round(base * (0.5 + hash / 20_000)));
}
