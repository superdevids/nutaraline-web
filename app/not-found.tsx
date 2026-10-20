import Link from "next/link";
import { defaultLocale } from "@/lib/i18n";
import { getDictionaryFor } from "@/lib/i18n/dictionary";

/**
 * Rendered outside any request scope, so it uses the default-locale dictionary
 * rather than reading cookies. Keeps the 404 fully static.
 */
export default function NotFound() {
  const dict = getDictionaryFor(defaultLocale);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="tabular text-6xl font-bold tracking-tight text-text">
        {dict.notFound.code}
      </p>
      <h1 className="mt-3 text-xl font-semibold text-text">
        {dict.notFound.title}
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-muted">{dict.notFound.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/monitoring"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover"
        >
          {dict.errorPages.backToMonitoring}
        </Link>
        <Link
          href="/docs"
          className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium text-text transition-colors hover:bg-surface"
        >
          {dict.notFound.docs}
        </Link>
      </div>
    </div>
  );
}
