export const LOCALE_STORAGE_KEY = "nutaraline.locale";
export const LOCALE_COOKIE = "nutaraline.locale";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Cookie writes are side effects on a host object. Keeping them in a module
 * function keeps React components free of direct external mutation, which the
 * React Compiler rules reject.
 */
export function writeLocaleCookie(locale: string): void {
  if (typeof document === "undefined") return;

  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function readLocaleCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`),
  );

  return match?.[1] ?? null;
}

export function writeLocaleStorage(locale: string): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage may be blocked; the cookie remains authoritative.
  }
}

export function readLocaleStorage(): string | null {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}
