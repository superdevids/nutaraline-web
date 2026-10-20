export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];

/** Indonesian is the default for a first visit, per product decision. */
export const defaultLocale: Locale = "id";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
