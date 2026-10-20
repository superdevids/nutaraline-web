import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Table({
  children,
  className,
  caption,
}: {
  children: ReactNode;
  className?: string;
  caption?: string;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full min-w-[640px] border-collapse text-sm", className)}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border bg-linear-to-b from-surface-raised/70 to-transparent">
      <tr>{children}</tr>
    </thead>
  );
}

export function TH({
  children,
  align = "left",
  className,
  scope = "col",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  scope?: "col" | "row";
}) {
  return (
    <th
      scope={scope}
      className={cn(
        "whitespace-nowrap px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-text-muted",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({ children }: { children: ReactNode }) {
  return (
    <tr className="group/row relative transition-colors hover:bg-surface-raised/60">
      {children}
    </tr>
  );
}

export function TD({
  children,
  align = "left",
  className,
  numeric,
  colSpan,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  numeric?: boolean;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-4 py-2.5 text-text",
        align === "right" ? "text-right" : "text-left",
        numeric && "tabular",
        className,
      )}
    >
      {children}
    </td>
  );
}
