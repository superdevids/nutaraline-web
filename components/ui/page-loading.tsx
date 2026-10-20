import { BrandMark } from "@/components/layout/logo";
import { cn } from "@/lib/cn";

/**
 * Route-level loading state. Shows the brand mark with an orbiting ring, an
 * indeterminate progress bar, and a skeleton that mirrors the real page grid —
 * so the layout does not jump when content arrives.
 *
 * `variant` only changes the skeleton shape, never the header, so every route
 * shares one loader identity.
 */
export function PageLoading({
  label,
  variant = "default",
}: {
  label?: string;
  variant?: "default" | "monitoring" | "list" | "article";
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? "Memuat"}
      className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-10 w-10 items-center justify-center">
          {/* Static track plus a rotating accent arc: reads as "working" without
              a spinner glyph that would fight the brand mark. */}
          <span aria-hidden className="absolute inset-0 rounded-full border border-border" />
          <span
            aria-hidden
            className="animate-orbit absolute inset-0 rounded-full border-2 border-transparent border-t-accent/80 border-r-accent/30"
          />
          <BrandMark size={22} />
        </span>

        <div className="min-w-0 flex-1">
          {label ? (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{label}</p>
          ) : null}
          <div
            aria-hidden
            className="mt-2 h-0.5 w-full max-w-xs overflow-hidden rounded-full bg-border"
          >
            <span className="animate-progress block h-full w-1/3 rounded-full bg-linear-to-r from-transparent via-accent to-transparent" />
          </div>
        </div>
      </div>

      <div aria-hidden className="mt-8">
        <SkeletonBody variant={variant} />
      </div>
    </div>
  );
}

function SkeletonBody({ variant }: { variant: "default" | "monitoring" | "list" | "article" }) {
  if (variant === "monitoring") {
    return (
      <div className="flex flex-col gap-4">
        <Block className="h-6 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Block className="h-28 lg:col-span-2" />
          <Block className="h-28" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Block className="h-20" />
          <Block className="h-20" />
          <Block className="h-20" />
          <Block className="h-20" />
        </div>
        <Block className="h-64" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Block className="h-72" />
          <Block className="h-72" />
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="flex flex-col gap-4">
        <Block className="h-6 w-56" />
        <Block className="h-16" />
        <ul className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((row) => (
            <li key={row}>
              <Block className="h-14" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (variant === "article") {
    return (
      <div className="grid gap-10 lg:grid-cols-[220px_1fr_210px]">
        <Block className="hidden h-64 lg:block" />
        <div className="flex flex-col gap-3">
          <Block className="h-8 w-2/3" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-11/12" />
          <Block className="h-4 w-10/12" />
          <Block className="mt-4 h-4 w-full" />
          <Block className="h-4 w-9/12" />
        </div>
        <Block className="hidden h-40 lg:block" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Block className="h-6 w-52" />
      <Block className="h-12" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Block className="h-44" />
        <Block className="h-44" />
        <Block className="h-44" />
      </div>
    </div>
  );
}

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-surface",
        "after:absolute after:inset-0 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-sheen after:to-transparent",
        className,
      )}
    />
  );
}
