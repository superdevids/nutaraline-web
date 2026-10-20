import { describe, expect, it } from "vitest";
import { getTrendSeries } from "@/lib/dummy";

describe("trend series", () => {
  it("returns exactly 28 points: 7 days x 4 samples", async () => {
    expect(await getTrendSeries()).toHaveLength(28);
  });

  it("is deterministic across calls", async () => {
    expect(await getTrendSeries()).toEqual(await getTrendSeries());
  });

  it("spans seven distinct days", async () => {
    const days = new Set((await getTrendSeries()).map((point) => point.date));
    expect(days.size).toBe(7);
  });

  it("samples every day at 00:00, 06:00, 12:00 and 18:00", async () => {
    const series = await getTrendSeries();
    const byDay = new Map<string, string[]>();

    for (const point of series) {
      const times = byDay.get(point.date) ?? [];
      times.push(point.at ?? "");
      byDay.set(point.date, times);
    }

    expect(byDay.size).toBe(7);

    for (const times of byDay.values()) {
      expect(times).toEqual(["00:00", "06:00", "12:00", "18:00"]);
    }
  });

  it("peaks at midday every day", async () => {
    const series = await getTrendSeries();
    const days = [...new Set(series.map((point) => point.date))];

    for (const day of days) {
      const samples = series.filter((point) => point.date === day);
      const at = (time: string) =>
        samples.find((point) => point.at === time)?.requests ?? 0;

      expect(at("12:00")).toBeGreaterThan(at("00:00"));
      expect(at("12:00")).toBeGreaterThan(at("06:00"));
      expect(at("12:00")).toBeGreaterThan(at("18:00"));
    }
  });

  it("is quietest at midnight", async () => {
    const series = await getTrendSeries();
    const days = [...new Set(series.map((point) => point.date))];

    for (const day of days) {
      const samples = series.filter((point) => point.date === day);
      const at = (time: string) =>
        samples.find((point) => point.at === time)?.requests ?? 0;

      expect(at("00:00")).toBeLessThan(at("06:00"));
      expect(at("00:00")).toBeLessThan(at("18:00"));
    }
  });

  it("keeps every value positive and finite", async () => {
    for (const point of await getTrendSeries()) {
      expect(Number.isFinite(point.requests)).toBe(true);
      expect(point.requests).toBeGreaterThan(0);
      expect(point.tokensIn).toBeGreaterThan(0);
      expect(point.cost).toBeGreaterThanOrEqual(0);
    }
  });

  it("orders samples chronologically", async () => {
    const series = await getTrendSeries();
    const keys = series.map((point) => `${point.date}T${point.at}`);

    expect(keys).toEqual([...keys].sort());
  });
});
