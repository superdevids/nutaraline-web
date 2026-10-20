import { CheckCircle2, CircleAlert, Clock } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { RequestLog } from "@/lib/dummy/types";

const toneClass = {
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
} as const;

/**
 * Status is conveyed by a single icon plus its accessible label. No badge
 * chrome and no second glyph: one icon, one meaning.
 */
export function LogStatusIcon({
  status,
  dict,
}: {
  status: RequestLog["status"];
  dict: Dictionary;
}) {
  const map = {
    success: { tone: "success" as const, icon: CheckCircle2 },
    error: { tone: "error" as const, icon: CircleAlert },
    timeout: { tone: "warning" as const, icon: Clock },
  };

  const { tone, icon: Icon } = map[status];
  const label = dict.monitoring.logStatus[status];

  return (
    <span className="inline-flex items-center" title={label}>
      <Icon aria-hidden size={16} className={toneClass[tone]} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
