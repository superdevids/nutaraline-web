"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Copies a documentation code block. Same 1.6s feedback cycle as the model
 * ID copy button so copied-state affordances behave identically app-wide.
 */
export function CopyCodeButton({
  code,
  copyLabel,
  copiedLabel,
}: {
  code: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copyLabel}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
        copied
          ? "border-success-border bg-success-bg text-success"
          : "border-border-strong bg-surface-raised text-text-muted hover:text-text",
      )}
    >
      {copied ? (
        <Check aria-hidden size={11} />
      ) : (
        <Copy aria-hidden size={11} />
      )}
      <span className="whitespace-nowrap">
        {copied ? copiedLabel : copyLabel}
      </span>
    </button>
  );
}
