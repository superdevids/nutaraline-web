import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CircleAlert,
  Info,
  RotateCw,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import { PanelDecoration } from "@/components/ui/decoration";

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: CircleAlert,
};

const toneClass = {
  info: "text-info",
  warning: "text-warning",
  error: "text-error",
};

export function ErrorScreen({
  code,
  tone,
  title,
  body,
  hint,
  dict,
  requestId,
  onRetry,
}: {
  code: number | "unknown";
  tone: "info" | "warning" | "error";
  title: string;
  body: string;
  hint: string;
  dict: Dictionary;
  requestId?: string;
  onRetry?: () => void;
}) {
  const Icon = icons[tone];

  return (
    <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-[40rem]">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className={`absolute inset-0 ${toneClass[tone]} opacity-[0.14]`}>
          <PanelDecoration
            variant="grid"
            className=""
            style={{ maskImage: "radial-gradient(ellipse 60% 60% at 50% 30%, black, transparent)" }}
          />
        </div>
        <div className="absolute -top-16 left-1/2 h-56 w-[32rem] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl" />
      </div>
      <span
        className={`animate-fade-up relative flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border-strong bg-surface shadow-[0_0_0_6px_color-mix(in_srgb,var(--accent)_5%,transparent)] ${toneClass[tone]}`}
      >
        <Icon aria-hidden size={22} />
      </span>

      <p className="animate-fade-up-delay-1 mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-text-faint">
        {dict.errorPages.eyebrow}
      </p>

      <p className="animate-fade-up-delay-1 tabular mt-1 text-6xl font-bold tracking-tight text-text">
        {code}
      </p>

      <h1 className="animate-fade-up-delay-2 mt-3 text-xl font-semibold text-text">
        {title}
      </h1>
      <p
        role={tone === "error" ? "alert" : "status"}
        className="animate-fade-up-delay-2 mt-2 max-w-md text-sm leading-relaxed text-text-muted"
      >
        {body}
      </p>

      <p className="mt-4 max-w-md rounded-md border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-text-muted">
        {hint}
      </p>

      {requestId ? (
        <p className="tabular mt-3 text-xs text-text-faint">
          {dict.errorPages.requestId}: {requestId}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover"
          >
            <RotateCw aria-hidden size={14} />
            {dict.errors.retry}
          </button>
        ) : null}

        <Link
          href="/monitoring"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-text transition-colors hover:bg-surface"
        >
          <ArrowLeft aria-hidden size={14} />
          {dict.errorPages.backToMonitoring}
        </Link>
      </div>
    </div>
  );
}
