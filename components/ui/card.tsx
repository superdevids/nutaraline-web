import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PanelCorners } from "./decoration";

/**
 * Standard panel. `surface-lift` adds the one-pixel top highlight defined in
 * globals.css; `tone="accent"` swaps in the diagonal green sweep used by
 * focused blocks. `corners` adds crop-mark brackets, which need the caller to
 * add `group` to the className if the hover state is wanted.
 */
export function Card({
  className,
  children,
  as: Tag = "div",
  tone = "plain",
  corners = false,
}: {
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "article" | "li";
  tone?: "plain" | "accent";
  corners?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-surface",
        tone === "accent" ? "surface-sweep" : "surface-lift",
        className,
      )}
    >
      {corners ? <PanelCorners /> : null}
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-semibold text-text">
          <span aria-hidden className="h-3.5 w-0.5 rounded-full bg-accent" />
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
