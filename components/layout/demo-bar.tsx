import { FlaskConical } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

/**
 * Development-build notice, shown on every route only when
 * NEXT_PUBLIC_ENV is "development" (gated in the root layout).
 */
export function DemoBar({ dict }: { dict: Dictionary }) {
  return (
    <div className="border-b border-warning/30 bg-warning/10 text-warning">
      <p className="mx-auto flex w-full max-w-[1200px] items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium sm:px-6">
        <FlaskConical aria-hidden size={13} className="shrink-0" />
        <span>
          <span className="font-semibold uppercase tracking-wide">
            {dict.common.demoBanner}
          </span>{" "}
          — {dict.common.demoNotice}
        </span>
      </p>
    </div>
  );
}
