import { describe, expect, it } from "vitest";
import { nextPoolPercent, poolTone } from "@/components/models/token-pool";

describe("pool tone thresholds", () => {
  it("is green above 60 percent", () => {
    expect(poolTone(100).label).toBe("healthy");
    expect(poolTone(61).label).toBe("healthy");
  });

  it("is amber between 31 and 60", () => {
    expect(poolTone(60).label).toBe("moderate");
    expect(poolTone(31).label).toBe("moderate");
  });

  it("is orange between 11 and 30", () => {
    expect(poolTone(30).label).toBe("low");
    expect(poolTone(11).label).toBe("low");
  });

  it("is red at 10 or below", () => {
    expect(poolTone(10).label).toBe("critical");
    expect(poolTone(0).label).toBe("critical");
  });

  it("uses a distinct bar class per band", () => {
    const classes = [100, 45, 20, 5].map((value) => poolTone(value).bar);
    expect(new Set(classes).size).toBe(4);
  });
});

describe("pool decay", () => {
  const DAY = 24 * 60 * 60 * 1000;

  it("drops by the tick share of the window", () => {
    // 60s of a 24h window is 0.0694% of the total.
    const next = nextPoolPercent(80, 60_000, DAY);
    expect(next).toBeCloseTo(79.93, 2);
  });

  it("never goes below zero", () => {
    expect(nextPoolPercent(0.01, 60_000, DAY)).toBe(0);
  });

  it("keeps two decimals", () => {
    const next = nextPoolPercent(50.5, 60_000, DAY);
    expect(next.toString().split(".")[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });
});
