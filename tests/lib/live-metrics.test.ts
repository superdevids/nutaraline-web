import { describe, expect, it } from "vitest";
import {
  MINUTE_MS,
  REQUESTS_PER_MINUTE,
  TICK_MS,
  initialLiveMetrics,
  nextLiveMetrics,
} from "@/lib/live-metrics";

const BASE = Date.UTC(2026, 9, 20, 12, 0, 0);

describe("live metrics", () => {
  it("starts at zero counters", () => {
    const initial = initialLiveMetrics(BASE);
    expect(initial.requests).toBe(0);
    expect(initial.tokens).toBe(0);
  });

  it("computes the minute index from the clock", () => {
    const initial = initialLiveMetrics(BASE + 3_000);
    expect(initial.minute).toBe(Math.floor((BASE + 3_000) / MINUTE_MS));
  });

  it("increases requests within a minute", () => {
    const start = initialLiveMetrics(BASE);
    const later = nextLiveMetrics(start, BASE + TICK_MS * 3);
    expect(later.requests).toBeGreaterThan(start.requests);
  });

  it("never moves the counter backwards inside a minute", () => {
    const start = initialLiveMetrics(BASE);
    let state = start;

    for (let elapsed = TICK_MS; elapsed < MINUTE_MS; elapsed += TICK_MS) {
      const next = nextLiveMetrics(state, BASE + elapsed);
      expect(next.requests).toBeGreaterThanOrEqual(state.requests);
      state = next;
    }
  });

  it("resets both counters when a new minute begins", () => {
    const start = initialLiveMetrics(BASE);
    const endOfMinute = nextLiveMetrics(start, BASE + MINUTE_MS - TICK_MS);
    expect(endOfMinute.requests).toBeGreaterThan(0);

    const nextMinute = nextLiveMetrics(endOfMinute, BASE + MINUTE_MS + 1_000);
    expect(nextMinute.requests).toBe(0);
    expect(nextMinute.tokens).toBe(0);
  });

  it("keeps tokens proportional to requests", () => {
    const start = initialLiveMetrics(BASE);
    const state = nextLiveMetrics(start, BASE + 40_000);

    expect(state.tokens).toBeGreaterThan(0);
    expect(state.tokens / state.requests).toBeGreaterThan(800);
    expect(state.tokens / state.requests).toBeLessThan(1_200);
  });

  it("never exceeds the per-minute ceiling", () => {
    const start = initialLiveMetrics(BASE);
    const nearEnd = nextLiveMetrics(start, BASE + MINUTE_MS - 1);
    expect(nearEnd.requests).toBeLessThanOrEqual(REQUESTS_PER_MINUTE);
  });

  it("keeps latency within a plausible band", () => {
    let state = initialLiveMetrics(BASE);

    for (let elapsed = TICK_MS; elapsed < MINUTE_MS; elapsed += TICK_MS) {
      state = nextLiveMetrics(state, BASE + elapsed);
      expect(state.medianLatencyMs).toBeGreaterThanOrEqual(180);
      expect(state.medianLatencyMs).toBeLessThanOrEqual(900);
    }
  });

  it("keeps uptime between 99.5 and 100", () => {
    let state = initialLiveMetrics(BASE);

    for (let elapsed = TICK_MS; elapsed < MINUTE_MS; elapsed += TICK_MS) {
      state = nextLiveMetrics(state, BASE + elapsed);
      expect(state.uptimePercent).toBeGreaterThanOrEqual(99.5);
      expect(state.uptimePercent).toBeLessThanOrEqual(100);
    }
  });

  it("is deterministic for the same clock reading", () => {
    const start = initialLiveMetrics(BASE);
    const a = nextLiveMetrics(start, BASE + 20_000);
    const b = nextLiveMetrics(start, BASE + 20_000);
    expect(a).toEqual(b);
  });

  it("does not mutate the previous state", () => {
    const start = initialLiveMetrics(BASE);
    const snapshot = { ...start };

    nextLiveMetrics(start, BASE + 10_000);

    expect(start).toEqual(snapshot);
  });
});
