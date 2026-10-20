import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/empty-state";
import { DocsContent } from "@/components/docs/docs-content";
import { getDictionary } from "@/lib/i18n/server";
import { getDocSlugs, getDocTree } from "@/lib/markdown/load";
import { locales } from "@/lib/i18n";

export async function generateStaticParams() {
  const perLocale = await Promise.all(
    locales.map(async (locale) => {
      const slugs = await getDocSlugs(locale);
      return slugs.map((slug) => ({ slug: [slug] }));
    }),
  );

  // The union of every locale's slugs: a slug that exists in one language must
  // still be routable, and the page falls back gracefully when it is missing.
  const seen = new Set<string>();
  const params: { slug: string[] }[] = [];

  for (const entry of perLocale.flat()) {
    if (seen.has(entry.slug[0])) continue;
    seen.add(entry.slug[0]);
    params.push(entry);
  }

  return params;
}

async function DocsRoute({
  params,
}: {
  params: PageProps<"/docs/[[...slug]]">["params"];
}) {
  const { slug } = await params;
  const { dict, locale } = await getDictionary();

  // Opening /docs bare lands on the first article with a URL that names it,
  // so shared links always point at a real page.
  if (!slug?.[0]) {
    const first = (await getDocTree(locale))[0]?.pages[0]?.slug;
    if (first) {
      redirect(`/docs/${first}`);
    }
  }

  const target = slug?.[0] ?? null;

  return (
    <>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
        <BookOpen aria-hidden size={13} />
        {dict.nav.docs}
      </div>
      <PageHeader title={dict.docs.title} subtitle={dict.docs.subtitle} marker="06" glow={false} />
      <DocsContent slug={target ?? null} dict={dict} locale={locale} />
    </>
  );
}

function DocsSkeleton() {
  return (
    <div
      aria-hidden
      className="mt-8 h-64 animate-pulse rounded-lg border border-border bg-surface"
    />
  );
}

export default function DocsPage({
  params,
}: PageProps<"/docs/[[...slug]]">) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6">
      <Suspense fallback={<DocsSkeleton />}>
        <DocsRoute params={params} />
      </Suspense>
    </div>
  );
}
