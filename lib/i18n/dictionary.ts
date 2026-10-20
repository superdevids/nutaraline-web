import { en } from "./en";
import { id } from "./id";
import { hasLocale, type Locale } from "./locales";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = { en, id };

/**
 * Client-safe dictionary lookup. The locale is resolved by the server and
 * passed down as a prop, so this module carries no server-only imports.
 */
export function getDictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
export { en, id };
export { hasLocale };
