import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Info, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

export type Tone = "success" | "warning" | "error" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "bg-success-bg text-success border-success-border",
  warning: "bg-warning-bg text-warning border-warning-border",
  error: "bg-error-bg text-error border-error-border",
  info: "bg-info-bg text-info border-info-border",
  neutral: "bg-neutral-bg text-neutral border-neutral-border",
};

/**
 * Colour is never the only signal: every tone carries its own icon and the
 * caller always supplies a text label.
 */
const toneIcon: Record<Tone, typeof Info> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: CircleAlert,
  info: Info,
  neutral: Minus,
};

export function Badge({
  tone = "neutral",
  children,
  className,
  icon = true,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  icon?: boolean;
}) {
  const Icon = toneIcon[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {icon ? <Icon aria-hidden size={12} strokeWidth={2.5} /> : null}
      {children}
    </span>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const Icon = toneIcon[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-md border px-4 py-3 text-sm",
        toneClass[tone],
        className,
      )}
    >
      <Icon aria-hidden size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-text-muted">{children}</div> : null}
      </div>
    </div>
  );
}
