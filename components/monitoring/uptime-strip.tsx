import { formatPercent } from "@/lib/format";

/**
 * Ten-segment uptime strip. Each segment is a minute; height and colour carry
 * the signal, and the numeric percentage is always rendered alongside.
 */
export function UptimeStrip({
  window,
  tone,
}: {
  window: number[];
  tone: "success" | "warning" | "error";
}) {
  const barClass = {
    success: "from-success to-success/35",
    warning: "from-warning to-warning/35",
    error: "from-error to-error/35",
  }[tone];

  return (
    <div
      aria-hidden
      className="flex h-6 items-end gap-1"
      role="presentation"
    >
      {window.map((value, index) => {
        const height = Math.max(18, Math.round(value * 100));
        const degraded = value < 0.995;

        return (
          <span
            key={index}
            style={{ height: `${height}%` }}
            className={
              degraded
                ? "w-full rounded-sm bg-linear-to-t from-warning to-warning/40"
                : `w-full rounded-sm bg-linear-to-t ${barClass}`
            }
          />
        );
      })}
    </div>
  );
}

export function UptimeLabel({ value }: { value: number }) {
  return <span className="tabular">{formatPercent(value, 2)}</span>;
}
