"use client";

import { useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { writeLocaleCookie, writeLocaleStorage } from "@/lib/locale-storage";

const labels: Record<Locale, string> = { en: "EN", id: "ID" };

export function LocaleSwitcher({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const router = useRouter();

  function choose(locale: Locale) {
    if (locale === current) return;

    writeLocaleCookie(locale);
    writeLocaleStorage(locale);
    router.refresh();
  }

  return (
    <div
      aria-label={label}
      role="group"
      className="flex h-9 items-center gap-0.5 rounded-md border border-border p-0.5"
    >
      {locales.map((locale) => {
        const isActive = locale === current;

        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            onClick={() => choose(locale)}
            aria-pressed={isActive}
            className={
              isActive
                ? "flex h-full items-center rounded bg-surface-raised px-2 text-xs font-semibold text-text"
                : "flex h-full items-center rounded px-2 text-xs font-medium text-text-muted transition-colors hover:text-text"
            }
          >
            {labels[locale]}
          </button>
        );
      })}
    </div>
  );
}
