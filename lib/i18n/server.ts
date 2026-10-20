import { cookies } from "next/headers";
import { en } from "./en";
import { id } from "./id";
import { defaultLocale, hasLocale, type Locale } from "./locales";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = { en, id };

export const LOCALE_COOKIE = "nutaraline.locale";

/**
 * Locale lives in a cookie, not in the URL. The cookie is the single source of
 * truth for the server; the client mirrors it into localStorage so a returning
 * visitor keeps their choice even if cookies are cleared.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;

  return value && hasLocale(value) ? value : defaultLocale;
}

export async function getDictionary(): Promise<{
  locale: Locale;
  dict: Dictionary;
}> {
  const locale = await getLocale();
  return { locale, dict: dictionaries[locale] };
}
