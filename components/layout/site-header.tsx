"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { headerStateFor } from "@/lib/header-state";
import { isActivePath, type NavItem } from "@/lib/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { BrandMark } from "./logo";
import type { Locale } from "@/lib/i18n";

/**
 * Fixed top bar for every breakpoint. Phones also get the bottom navigation;
 * the centre nav collapses there because the bottom bar covers it.
 */
export function SiteHeader({
  items,
  locale,
  labels,
}: {
  items: NavItem[];
  locale: Locale;
  labels: {
    mainNavigation: string;
    switchLanguage: string;
    brand: string;
    notifications: string;
  };
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const idleRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(headerStateFor(window.scrollY).scrolled);

      // The lower hairline appears the moment the page moves, but only
      // while it moves: at rest the header stays quiet even mid-page.
      if (window.scrollY <= 0) {
        setScrolling(false);
        return;
      }

      setScrolling(true);
      if (idleRef.current !== null) window.clearTimeout(idleRef.current);
      idleRef.current = window.setTimeout(() => setScrolling(false), 600);
    };

    // Cover both the document scroller and any nested scroll container.
    onScroll();
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("scroll", onScroll);
      if (idleRef.current !== null) window.clearTimeout(idleRef.current);
    };
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-colors duration-300", scrolled ? "bg-bg/85 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.9)] backdrop-blur-md supports-[backdrop-filter]:bg-bg/70" : "bg-transparent")}>
      {/* Lower hairline: 0 at the very top of the page, fully lit the moment the
          page starts moving, then fades back once scrolling stops. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-accent/45 to-transparent transition-opacity duration-300",
          scrolling ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Texture stays in the page background. The bar itself only gets the
          scroll hairline and, once scrolled, a soft top light — no grid here,
          so the nav text never sits on a pattern. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-accent/[0.05] to-transparent transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Three columns on desktop keep the centre nav optically centred; phones
          drop the middle column so the actions stay pinned to the right edge. */}
      <div className="relative mx-auto grid h-16 w-full max-w-[1200px] grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/monitoring"
          className="group flex min-w-0 items-center gap-2.5 justify-self-start text-sm font-bold tracking-tight text-text sm:text-base"
        >
          <BrandMark size={28} />
          <span className="truncate transition-colors group-hover:text-accent">
            {labels.brand}
          </span>
        </Link>

        <nav
          aria-label={labels.mainNavigation}
          className="hidden items-center justify-center gap-1 md:flex"
        >
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("rounded-md px-3 py-1.5 text-sm transition-colors", active ? "font-medium text-text" : "text-text-muted hover:text-text")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end">
          <LocaleSwitcher
            current={locale}
            label={labels.switchLanguage}
          />

          <Link
            href="/notification"
            aria-label={labels.notifications}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:text-text"
          >
            <Bell
              aria-hidden
              size={16}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
