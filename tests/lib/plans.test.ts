import { describe, expect, it } from "vitest";
import {
  MAX_TOPUP_IDR,
  MIN_TOPUP_IDR,
  UNLIMITED_PLAN_DAYS,
  UNLIMITED_PLAN_PRICE_IDR,
  allowedPresets,
  validateTopupAmount,
} from "@/lib/dummy/plans";

describe("top-up limits", () => {
  it("uses the documented bounds", () => {
    expect(MIN_TOPUP_IDR).toBe(5_000);
    expect(MAX_TOPUP_IDR).toBe(1_000_000);
  });

  it("prices the unlimited plan at 20,000 for 7 days", () => {
    expect(UNLIMITED_PLAN_PRICE_IDR).toBe(20_000);
    expect(UNLIMITED_PLAN_DAYS).toBe(7);
  });
});

describe("validateTopupAmount", () => {
  it("accepts the minimum", () => {
    expect(validateTopupAmount(5_000)).toEqual({ ok: true, value: 5_000 });
  });

  it("accepts the maximum", () => {
    expect(validateTopupAmount(1_000_000)).toEqual({ ok: true, value: 1_000_000 });
  });

  it("accepts a value inside the range", () => {
    expect(validateTopupAmount(75_000)).toEqual({ ok: true, value: 75_000 });
  });

  it("rejects below the minimum", () => {
    expect(validateTopupAmount(4_999)).toEqual({ ok: false, reason: "below-min" });
    expect(validateTopupAmount(0)).toEqual({ ok: false, reason: "below-min" });
  });

  it("rejects above the maximum", () => {
    expect(validateTopupAmount(1_000_001)).toEqual({
      ok: false,
      reason: "above-max",
    });
  });

  it("rejects non-numeric input", () => {
    expect(validateTopupAmount("abc")).toEqual({
      ok: false,
      reason: "not-a-number",
    });
  });

  it("strips currency formatting from a pasted string", () => {
    expect(validateTopupAmount("Rp 50.000")).toEqual({ ok: true, value: 50_000 });
    expect(validateTopupAmount("25,000")).toEqual({ ok: true, value: 25_000 });
  });

  it("treats an empty string as non-numeric", () => {
    const result = validateTopupAmount("");
    expect(result.ok).toBe(false);
  });

  it("rejects fractional amounts rather than silently rounding them", () => {
    expect(validateTopupAmount(5000.5)).toEqual({
      ok: false,
      reason: "not-round",
    });
  });
});

describe("allowedPresets", () => {
  it("never offers a preset outside the allowed range", () => {
    for (const preset of allowedPresets()) {
      expect(preset).toBeGreaterThanOrEqual(MIN_TOPUP_IDR);
      expect(preset).toBeLessThanOrEqual(MAX_TOPUP_IDR);
    }
  });

  it("includes the minimum preset", () => {
    expect(allowedPresets()).toContain(50_000);
  });

  it("excludes presets above one million", () => {
    expect(allowedPresets()).not.toContain(2_000_000);
  });
});
