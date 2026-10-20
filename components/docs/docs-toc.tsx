"use client";

import { useEffect, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/i18n";
import type { TocEntry } from "@/lib/markdown/types";

/** Same rhythm as the sidebar list: tight gaps, text-sm, hover affordance. */
function TocList({
  entries,
  activeId,
}: {
  entries: TocEntry[];
  activeId: string | null;
}) {
  return (
    <ul className="mt-2 flex flex-col gap-0.5 border-l border-border">
      {entries.map((entry) => (
        <li key={entry.id}>
          <a
            href={`#${entry.id}`}
            aria-current={activeId === entry.id ? "true" : undefined}
            className={cn(
              "block rounded py-1.5 pl-3 pr-2 text-sm transition-colors",
              activeId === entry.id
                ? "font-medium text-accent"
                : "text-text-muted hover:bg-surface hover:text-text",
            )}
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function DocsToc({
  entries,
  dict,
  variant,
}: {
  entries: TocEntry[];
  dict: Dictionary;
  variant: "desktop" | "mobile";
}) {
  const [activeId, setActiveId] = useState<string | null>(
    () => entries[0]?.id ?? null,
  );

  useEffect(() => {
    const targets = entries.flatMap((entry) => {
      const element = document.getElementById(entry.id);
      return element ? [element] : [];
    });

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) setActiveId(record.target.id);
        }
      },
      // The fixed top bar eats the first ~96px; a section counts as active
      // once it crosses into the upper third of the viewport.
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [entries]);

  if (variant === "desktop") {
    return (
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-faint">
          <FileText aria-hidden size={12} />
          {dict.docs.onThisPage}
        </p>
        <TocList entries={entries} activeId={activeId} />
      </div>
    );
  }

  return (
    <details className="group rounded-lg border border-border bg-surface lg:hidden">
      <summary className="flex cursor-pointer select-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <FileText aria-hidden size={14} className="text-accent" />
          {dict.docs.onThisPage}
        </span>
        <ChevronDown
          aria-hidden
          size={14}
          className="text-text-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-border px-3 py-2">
        <TocList entries={entries} activeId={activeId} />
      </div>
    </details>
  );
}
