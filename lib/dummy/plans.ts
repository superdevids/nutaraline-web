import { TOPUP_PRESETS } from "./transactions";

/** Minimum and maximum for a balance top-up, in IDR. */
export const MIN_TOPUP_IDR = 5_000;
export const MAX_TOPUP_IDR = 1_000_000;

/** Unlimited plan: twenty thousand rupiah per week. */
export const UNLIMITED_PLAN_PRICE_IDR = 20_000;
export const UNLIMITED_PLAN_DAYS = 7;

export type PurchaseKind = "balance" | "unlimited";

export type AmountValidation =
  | { ok: true; value: number }
  | { ok: false; reason: "not-a-number" | "below-min" | "above-max" | "not-round" };

/**
 * Balance top-up accepts any whole rupiah amount between the minimum and the
 * maximum. Digits are extracted so a pasted "Rp 50.000" still parses.
 */
export function validateTopupAmount(input: string | number): AmountValidation {
  let raw: number;

  if (typeof input === "string") {
    const digits = input.replace(/[^\d]/g, "");
    // An empty digit run means there was no number at all — not a zero amount.
    if (digits.length === 0) return { ok: false, reason: "not-a-number" };
    raw = Number(digits);
  } else {
    raw = input;
  }

  if (!Number.isFinite(raw)) return { ok: false, reason: "not-a-number" };
  if (!Number.isInteger(raw)) return { ok: false, reason: "not-round" };
  if (raw < MIN_TOPUP_IDR) return { ok: false, reason: "below-min" };
  if (raw > MAX_TOPUP_IDR) return { ok: false, reason: "above-max" };

  return { ok: true, value: raw };
}

/** Presets clamped to the allowed range, so the UI never offers an invalid chip. */
export function allowedPresets(): number[] {
  return TOPUP_PRESETS.filter(
    (value) => value >= MIN_TOPUP_IDR && value <= MAX_TOPUP_IDR,
  );
}
