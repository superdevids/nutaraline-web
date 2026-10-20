import { Alert } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { isDemoBuild } from "@/lib/env";
import { GhostBrand, HeaderTexture } from "@/components/ui/decoration";
import type { LucideIcon } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

interface Section {
  id: string;
  heading: string;
  paragraphs: string[];
}

export function LegalPage({
  title,
  subtitle,
  sections,
  badgeLabel,
  badgeIcon: BadgeIcon,
  dict,
}: {
  title: string;
  subtitle: string;
  sections: Section[];
  badgeLabel: string;
  badgeIcon: LucideIcon;
  dict: Dictionary;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_220px]">
      <article className="relative min-w-0">
        {/* Shared header texture: dotted-lattice wash faded downward. Docs and
            legal pages use this, and the dashboard pages now reuse it so every
            route opens on the same backdrop. */}
        <HeaderTexture className="-top-8 h-48">
          <GhostBrand className="text-[6.5rem]" />
        </HeaderTexture>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          <BadgeIcon aria-hidden size={13} />
          {badgeLabel}
        </div>

        <h1 className="mt-2 bg-linear-to-b from-text to-text-muted bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>
        <p className="tabular mt-1 text-xs text-text-faint">
          {dict.legal.effectiveDate}: 2026-10-20
        </p>

        {isDemoBuild ? (
          <Alert tone="warning" title={dict.legal.draftNotice} className="mt-4" />
        ) : null}

        {sections.map((section) => (
          <section key={section.id} className="mt-6">
            <h2
              id={section.id}
              className="scroll-mt-24 text-base font-semibold text-text"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((text, index) => (
              <p
                key={index}
                className="mt-1.5 text-sm leading-5 tracking-[-0.005em] text-text-muted [word-spacing:-0.02em]"
              >
                {text}
              </p>
            ))}
          </section>
        ))}
      </article>

      <aside className="hidden lg:block">
        <nav aria-label={dict.legal.toc} className="sticky top-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-faint">
            {dict.legal.toc}
          </p>
          <ul className="mt-2 flex flex-col gap-0.5 border-l border-border">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={cn(
                    "block rounded py-1.5 pl-3 pr-2 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text",
                    // First entry is the current section on load, so it gets
                    // the accent rail instead of every link competing.
                    index === 0 &&
                      "-ml-px border-l-2 border-accent bg-linear-to-r from-accent/[0.07] to-transparent pl-[11px] text-text",
                  )}
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
