import { describe, expect, it } from "vitest";
import { getLifetimeTotals, getRealtimeSnapshot } from "@/lib/dummy";

describe("lifetime totals", () => {
  it("is deterministic across calls", async () => {
    expect(await getLifetimeTotals()).toEqual(await getLifetimeTotals());
  });

  it("reports a positive request count and coherent token split", async () => {
    const totals = await getLifetimeTotals();

    expect(totals.requests).toBeGreaterThan(0);
    expect(totals.tokensIn).toBeGreaterThan(0);
    expect(totals.tokensOut).toBeGreaterThan(0);
    expect(totals.tokensOut).toBeLessThan(totals.tokensIn);
  });

  it("reports a non-negative cost", async () => {
    const totals = await getLifetimeTotals();
    expect(totals.cost).toBeGreaterThan(0);
  });

  it("has a parseable start date", async () => {
    const totals = await getLifetimeTotals();
    expect(Number.isNaN(Date.parse(totals.since))).toBe(false);
  });
});

describe("realtime snapshot", () => {
  it("is deterministic across calls", async () => {
    expect(await getRealtimeSnapshot()).toEqual(await getRealtimeSnapshot());
  });

  it("produces a ten-minute uptime window", async () => {
    const snapshot = await getRealtimeSnapshot();
    expect(snapshot.uptimeWindow).toHaveLength(10);
  });

  it("keeps every uptime sample within 0–1", async () => {
    const { uptimeWindow } = await getRealtimeSnapshot();
    for (const value of uptimeWindow) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("derives the summary percentage from the window", async () => {
    const { uptimeWindow, uptimeTenMinutes } = await getRealtimeSnapshot();
    const expected =
      (uptimeWindow.reduce((acc, value) => acc + value, 0) /
        uptimeWindow.length) *
      100;

    expect(uptimeTenMinutes).toBeCloseTo(expected, 1);
  });

  it("orders p95 above the median", async () => {
    const snapshot = await getRealtimeSnapshot();
    expect(snapshot.p95LatencyMs).toBeGreaterThan(snapshot.medianLatencyMs);
  });

  it("reports positive per-minute throughput", async () => {
    const snapshot = await getRealtimeSnapshot();
    expect(snapshot.requestsPerMinute).toBeGreaterThan(0);
    expect(snapshot.tokensPerMinute).toBeGreaterThan(0);
    expect(snapshot.requestsLastMinute).toBe(snapshot.requestsPerMinute);
  });

  it("includes at least one degraded minute so the UI is exercised", async () => {
    const { uptimeWindow } = await getRealtimeSnapshot();
    expect(uptimeWindow.some((value) => value < 1)).toBe(true);
  });
});
