"use client";

import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/markdown/types";
import { MarkdownBody } from "./markdown-body";

/**
 * Exclusive accordion (one open at a time) via the native `<details name>`
 * grouping — zero JS beyond hydration of the markdown inside answers.
 */
export function FaqAccordion({
  items,
  copyLabel,
  copiedLabel,
}: {
  items: FaqItem[];
  copyLabel?: string;
  copiedLabel?: string;
}) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {items.map((item) => (
        <details
          key={item.question}
          name="docs-faq"
          className="group overflow-hidden rounded-lg border border-border bg-surface transition-colors open:border-border-strong open:surface-lift"
        >
          <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
            <span className="min-w-0">{item.question}</span>
            <ChevronDown
              aria-hidden
              size={14}
              className="shrink-0 text-text-muted transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-t border-border px-4 py-3">
            <div className="[&>*:first-child]:mt-0 [&_p]:mt-3 [&_p]:leading-6 text-sm text-text-muted">
              <MarkdownBody
                nodes={item.answer}
                copyLabel={copyLabel}
                copiedLabel={copiedLabel}
              />
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
