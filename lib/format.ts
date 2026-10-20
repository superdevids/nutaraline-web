export type Locale = "en" | "id";

/**
 * Dot thousands separator across the whole product, regardless of UI language.
 * A number such as 72107266 renders as 72.107.266 everywhere.
 */
const grouped = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

export function formatCompact(value: number): string {
  return grouped.format(Math.round(value));
}

export function formatNumber(value: number): string {
  return grouped.format(value);
}

/**
 * Model prices are quoted in rupiah per one million tokens. Values arrive as
 * USD per 1M, so conversion happens here and the UI never deals with currency.
 */
export const USD_TO_IDR = 16_000;

export function formatPricePerMillion(usdPerMillion: number): string {
  return `Rp${grouped.format(Math.round(usdPerMillion * USD_TO_IDR))}`;
}

export function formatCurrency(value: number, currency: "IDR" | "USD"): string {
  if (currency === "IDR") {
    // Intl output varies by ICU build ("IDR 1,000" vs "Rp1.000"), and the
    // product always displays rupiah with the Rp prefix and group separators.
    return `Rp ${grouped.format(Math.round(value))}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatDate(date: string | Date, locale: Locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const tag = locale === "id" ? "id-ID" : "en-US";

  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(
  date: string | Date,
  locale: Locale = "en",
): string {
  return `${formatDate(date, locale)} · ${formatTime(date)}`;
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatRelativeTime(
  date: string | Date,
  now: Date,
  locale: Locale = "en",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMinutes = Math.round((now.getTime() - d.getTime()) / 60_000);

  const formatter = new Intl.RelativeTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    { numeric: "auto" },
  );

  let text: string;
  if (Math.abs(diffMinutes) < 60) {
    text = formatter.format(-diffMinutes, "minute");
  } else {
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      text = formatter.format(-diffHours, "hour");
    } else {
      text = formatter.format(-Math.round(diffHours / 24), "day");
    }
  }

  // ICU id-ID renders two days ago as "kemarin dulu"; the product counts
  // plainly instead, and every label starts uppercase as a display heading.
  if (/^kemarin dulu$/i.test(text)) text = "2 hari yang lalu";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
