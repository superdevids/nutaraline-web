"use client";

import { useEffect, useState } from "react";

/**
 * Tracks a CSS media query.
 *
 * The first render returns `null` because the server cannot know the viewport.
 * Callers should treat `null` as "not yet known" and avoid rendering anything
 * that depends on the answer until it resolves, which prevents a hydration
 * mismatch.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const list = window.matchMedia(query);

    const update = () => setMatches(list.matches);
    update();

    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** True below the `md` breakpoint used across the product. */
export const MOBILE_QUERY = "(max-width: 767px)";
