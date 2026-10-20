import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Eye,
  FileJson,
  ScrollText,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const CAPABILITY_ICON: Record<string, LucideIcon> = {
  vision: Eye,
  tools: Wrench,
  reasoning: Sparkles,
  thinking: Sparkles,
  "long-context": ScrollText,
  json: FileJson,
};

export function copyModelIdLabel(copied: boolean, copyLabel: string, copiedLabel: string): string {
  return copied ? copiedLabel : copyLabel;
}

/**
 * Copies the model slug. The slug itself is not rendered next to the model
 * name; the button carries a filled background so it reads as actionable.
 */
export function CopyModelIdButton({
  slug,
  copyLabel,
  copiedLabel,
}: {
  slug: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(slug);
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
      aria-label={`${copied ? copiedLabel : copyLabel}: ${slug}`}
      title={slug}
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

/**
 * Capability chips. Labels are product terms and are not translated; each one
 * carries an icon so the meaning survives even when space is tight.
 */
export function CapabilityList({
  capabilities,
  labels,
  className,
  size = "sm",
}: {
  capabilities: string[];
  labels: Record<string, string>;
  className?: string;
  size?: "xs" | "sm";
}) {
  const items = useMemo(
    () =>
      capabilities.map((key) => ({
        key,
        label: labels[key] ?? key,
        Icon: CAPABILITY_ICON[key],
      })),
    [capabilities, labels],
  );

  return (
    <ul className={cn("flex flex-wrap gap-1", className)}>
      {items.map((item) => (
        <li key={item.key}>
          <span
            className={cn(
              "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border text-text-muted",
              size === "xs"
                ? "px-2 py-0.5 text-[10px] leading-4"
                : "px-2.5 py-1 text-xs leading-4",
            )}
          >
            {item.Icon ? (
              <item.Icon aria-hidden size={size === "xs" ? 9 : 11} />
            ) : null}
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
