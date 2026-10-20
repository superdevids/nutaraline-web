"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/i18n";

/** Show the button once the page is scrolled past this many pixels. */
export const SHOW_AFTER_PX = 120;

/**
 * Floating "back to top" launcher. Visibility is derived from the scroll
 * offset directly (not an IntersectionObserver sentinel), so it is off at the
 * very top of every page and appears on the first real scroll.
 */
export function ScrollToTopButton({
  dict,
  className,
}: {
  dict: Dictionary;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        })
      }
      aria-label={dict.contact.scrollTop}
      title={dict.contact.scrollTop}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full border border-[#1e40af] bg-[#1e40af] text-text-on-primary shadow-lg shadow-[#1e40af]/30 transition-[transform,opacity] duration-200 hover:scale-105 hover:bg-[#1d3a9e] active:scale-95",
        className,
        visible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <ArrowUp aria-hidden size={19} />
    </button>
  );
}
