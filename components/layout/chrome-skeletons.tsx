/**
 * Static placeholders for the streamed header and footer.
 *
 * These are separate components, not pre-built element instances, so that the
 * fallback subtree and the resolved subtree are distinct branches. Passing one
 * shared element as a Suspense fallback makes devtools observe a children set
 * that changes under a stable parent.
 */
export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-transparent">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center px-4 sm:px-6">
        <span className="h-2.5 w-2.5 rounded-full bg-accent/40" aria-hidden />
        <span className="ml-2 h-4 w-24 rounded bg-surface" aria-hidden />
      </div>
    </header>
  );
}

export function FooterSkeleton() {
  return <footer aria-hidden className="mt-auto h-14 border-t border-border bg-bg-deep" />;
}
