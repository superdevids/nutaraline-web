import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Alert } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getDoc, getDocNeighbors, getDocTree } from "@/lib/markdown/load";
import { formatDate } from "@/lib/format";
import { isDemoBuild } from "@/lib/env";
import type { Locale, Dictionary } from "@/lib/i18n";
import { MarkdownBody } from "./markdown-body";
import { DocsNav } from "./docs-nav";
import { DocsToc } from "./docs-toc";
import { FaqAccordion } from "./faq-accordion";

export async function DocsContent({
  slug,
  dict,
  locale,
}: {
  slug: string | null;
  dict: Dictionary;
  locale: Locale;
}) {
  const [doc, tree] = await Promise.all([
    slug ? getDoc(locale, slug) : Promise.resolve(null),
    getDocTree(locale),
  ]);

  const fallbackSlug = tree[0]?.pages[0]?.slug;
  const resolved = doc ?? (fallbackSlug ? await getDoc(locale, fallbackSlug) : null);

  if (!resolved) {
    return (
      <EmptyState
        title={dict.docs.notFoundTitle}
        body={dict.docs.notFoundBody}
      />
    );
  }

  const neighbors = await getDocNeighbors(locale, resolved.slug);

  return (
    <>
      {/* Mobile: article picker + table of contents, both collapsible. */}
      <div className="mt-8 flex flex-col gap-3">
        <DocsNav
          groups={tree}
          activeSlug={resolved.slug}
          dict={dict}
          variant="mobile"
        />
      </div>

      {/* Left column stretches with the article so the sticky nav inside it
          stays pinned for the whole read, and stops before the footer. */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr_210px]">
        <div className="hidden lg:block">
          <DocsNav
            groups={tree}
            activeSlug={resolved.slug}
            dict={dict}
            variant="desktop"
          />
        </div>

        <article className="min-w-0">
          {isDemoBuild ? (
            <Alert tone="warning" title={dict.docs.draftBanner} className="mb-5" />
          ) : null}

          <p className="text-xs font-medium uppercase tracking-wide text-text-faint">
            {resolved.group}
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-text">
            {resolved.title}
          </h2>
          <p className="mt-1.5 text-sm text-text-muted">{resolved.description}</p>
          <p className="mt-1 text-xs text-text-faint">
            {dict.docs.updated}: {formatDate(resolved.updated, locale)}
          </p>

          {resolved.tocVisible ? (
            <div className="mt-4">
              <DocsToc
                entries={resolved.toc}
                dict={dict}
                variant="mobile"
              />
            </div>
          ) : null}

          <div className="mt-4 border-t border-border">
            <MarkdownBody
              nodes={resolved.nodes}
              copyLabel={dict.common.copy}
              copiedLabel={dict.common.copied}
            />
          </div>

          {resolved.faq ? (
            <div className="mt-6">
              <FaqAccordion
                items={resolved.faq}
                copyLabel={dict.common.copy}
                copiedLabel={dict.common.copied}
              />
            </div>
          ) : null}

          <nav className="mt-10 flex flex-wrap justify-between gap-4 border-t border-border pt-5 text-sm">
            {neighbors.previous ? (
              <Link
                href={`/docs/${neighbors.previous.slug}`}
                className="inline-flex items-center gap-2 text-text-muted hover:text-text"
              >
                <ArrowLeft aria-hidden size={14} />
                <span>
                  <span className="block text-xs text-text-faint">
                    {dict.docs.previous}
                  </span>
                  {neighbors.previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}

            {neighbors.next ? (
              <Link
                href={`/docs/${neighbors.next.slug}`}
                className="inline-flex items-center gap-2 text-right text-text-muted hover:text-text"
              >
                <span>
                  <span className="block text-xs text-text-faint">
                    {dict.docs.next}
                  </span>
                  {neighbors.next.title}
                </span>
                <ArrowRight aria-hidden size={14} />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>

        <aside className="hidden lg:block">
          {resolved.tocVisible ? (
            <DocsToc
              entries={resolved.toc}
              dict={dict}
              variant="desktop"
            />
          ) : null}
        </aside>
      </div>
    </>
  );
}
