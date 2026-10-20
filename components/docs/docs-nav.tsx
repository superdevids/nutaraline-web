"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookText, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/i18n";
import type { DocTreeGroup } from "@/lib/markdown/types";

function NavList({
  groups,
  activeSlug,
  query,
  setQuery,
  dict,
  mobile,
}: {
  groups: DocTreeGroup[];
  activeSlug: string;
  query: string;
  setQuery: (value: string) => void;
  dict: Dictionary;
  mobile: boolean;
}) {
  const needle = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          pages: group.pages.filter(
            (page) =>
              page.title.toLowerCase().includes(needle) ||
              page.slug.toLowerCase().includes(needle) ||
              group.group.toLowerCase().includes(needle),
          ),
        }))
        .filter((group) => group.pages.length > 0),
    [groups, needle],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          aria-hidden
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={dict.docs.searchPlaceholder}
          aria-label={dict.docs.searchPlaceholder}
          className="h-9 w-full rounded-md border border-border bg-bg pl-8 pr-3 text-sm text-text placeholder:text-text-faint focus:border-border-strong focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="px-1 py-2 text-sm text-text-muted">{dict.docs.searchEmpty}</p>
      ) : (
        filtered.map((group) => (
          <div key={group.group}>
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-accent">
              {group.group}
            </p>
            <ul className="mt-2 flex flex-col gap-0.5">
              {group.pages.map((page) => {
                const active = page.slug === activeSlug;
                return (
                  <li key={page.slug}>
                    <Link
                      href={`/docs/${page.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded px-2 py-1.5 text-sm transition-colors",
                        mobile && "py-2",
                        active
                          ? "bg-linear-to-r from-accent/[0.12] to-transparent text-accent shadow-[inset_2px_0_0_var(--accent)]"
                          : "text-text-muted hover:bg-surface hover:text-text",
                      )}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export function DocsNav({
  groups,
  activeSlug,
  dict,
  variant,
}: {
  groups: DocTreeGroup[];
  activeSlug: string;
  dict: Dictionary;
  variant: "desktop" | "mobile";
}) {
  const [query, setQuery] = useState("");

  if (variant === "desktop") {
    return (
      <nav
        aria-label={dict.docs.title}
        className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
      >
        <NavList
          groups={groups}
          activeSlug={activeSlug}
          query={query}
          setQuery={setQuery}
          dict={dict}
          mobile={false}
        />
      </nav>
    );
  }

  return (
    <details className="group rounded-lg border border-border bg-surface lg:hidden">
      <summary className="flex cursor-pointer select-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <BookText aria-hidden size={14} className="text-accent" />
          {dict.docs.title}
        </span>
        <ChevronDown
          aria-hidden
          size={14}
          className="text-text-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-border px-3 py-3">
        <NavList
          groups={groups}
          activeSlug={activeSlug}
          query={query}
          setQuery={setQuery}
          dict={dict}
          mobile
        />
      </div>
    </details>
  );
}
