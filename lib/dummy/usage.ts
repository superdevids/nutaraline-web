// DUMMY DATA — diganti dengan API nyata pada Fase 2.

import { models } from "./models-data";
import { providers } from "./providers-data";
import type {
  LifetimeTotals,
  ModelBreakdown,
  ProviderBreakdown,
  RealtimeSnapshot,
  RequestLog,
  UsagePoint,
  UsageSummary,
} from "./types";

/** mulberry32 — small, fast, seeded PRNG. Deterministic across runtimes. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed reference date keeps charts identical on every render and between
// server and client. Replace with real request timestamps in Phase 2.
const ANCHOR = Date.UTC(2026, 9, 20, 0, 0, 0);
const DAY_MS = 86_400_000;

/** Seven days, four samples per day (00:00, 06:00, 12:00, 18:00 UTC). */
const TREND_DAYS = 7;
const SAMPLES_PER_DAY = 4;
const SAMPLE_HOURS = [0, 6, 12, 18];

/**
 * Trend series for the chart. Always the last seven days at three samples per
 * day, independent of any longer aggregate window: the summary totals may span
 * 30 days, but the chart must stay readable on a phone.
 */
export function buildTrendSeries(): UsagePoint[] {
  const rand = mulberry32(7_919);
  const points: UsagePoint[] = [];

  for (let day = TREND_DAYS - 1; day >= 0; day--) {
    const base = ANCHOR - day * DAY_MS;
    const date = new Date(base);
    const weekday = date.getUTCDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.62 : 1;
    const trend = 1 + (TREND_DAYS - day) / (TREND_DAYS * 8);

    for (const hour of SAMPLE_HOURS) {
      // Day arc: quiet overnight, rising through the morning, peak at midday,
      // tapering into the evening.
      const hourFactor =
        hour === 12 ? 1 : hour === 18 ? 0.78 : hour === 6 ? 0.55 : 0.32;
      const noise = 0.88 + rand() * 0.24;

      const dayShare = 1 / SAMPLES_PER_DAY;
      const requests = Math.round(
        12_400 * dayShare * weekendFactor * trend * hourFactor * noise,
      );
      const tokensIn = requests * Math.round(820 + rand() * 260);
      const tokensOut = Math.round(tokensIn * (0.34 + rand() * 0.12));
      const cost = Number(
        (
          (tokensIn / 1_000_000) * 0.62 +
          (tokensOut / 1_000_000) * 1.9
        ).toFixed(4),
      );

      points.push({
        date: date.toISOString().slice(0, 10),
        at: `${String(hour).padStart(2, "0")}:00`,
        requests,
        tokensIn,
        tokensOut,
        cost,
      });
    }
  }

  return points;
}

/** Daily aggregate, still used for the summary totals. */
function buildSeries(range: 7 | 30 | 90): UsagePoint[] {
  const rand = mulberry32(range * 7919 + 104729);
  const points: UsagePoint[] = [];

  for (let i = range - 1; i >= 0; i--) {
    const date = new Date(ANCHOR - i * DAY_MS);

    // Weekly seasonality plus a slow upward trend plus bounded noise.
    const weekday = date.getUTCDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.62 : 1;
    const trend = 1 + (range - i) / (range * 8);
    const noise = 0.85 + rand() * 0.3;

    const requests = Math.round(12_400 * weekendFactor * trend * noise);
    const tokensIn = requests * Math.round(820 + rand() * 260);
    const tokensOut = Math.round(tokensIn * (0.34 + rand() * 0.12));
    const cost = Number(
      ((tokensIn / 1_000_000) * 0.62 + (tokensOut / 1_000_000) * 1.9).toFixed(2),
    );

    points.push({
      date: date.toISOString().slice(0, 10),
      requests,
      tokensIn,
      tokensOut,
      cost,
    });
  }

  return points;
}

function sum(series: UsagePoint[]) {
  let requests = 0;
  let tokens = 0;
  let cost = 0;

  for (const p of series) {
    requests += p.requests;
    tokens += p.tokensIn + p.tokensOut;
    cost += p.cost;
  }

  return { requests, tokens, cost: Number(cost.toFixed(2)) };
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}
export async function getUsageSummary(
  range: 7 | 30 | 90 = 30,
): Promise<UsageSummary> {
  const series = buildSeries(range);
  const half = Math.floor(series.length / 2);

  const previous = sum(series.slice(0, half));
  const scoped = sum(series.slice(half));

  const errorRate = Number((0.9 + (range % 5) * 0.12).toFixed(2));
  const prevErrorRate = Number((errorRate + 0.34).toFixed(2));

  return {
    range,
    totals: {
      requests: scoped.requests,
      tokens: scoped.tokens,
      cost: scoped.cost,
      errorRate,
    },
    delta: {
      requests: pctChange(scoped.requests, previous.requests),
      tokens: pctChange(scoped.tokens, previous.tokens),
      cost: pctChange(scoped.cost, previous.cost),
      errorRate: pctChange(errorRate, prevErrorRate),
    },
    series,
  };
}
export async function getRequestLogs(count = 20): Promise<RequestLog[]> {
  const rand = mulberry32(count * 31337);
  const logs: RequestLog[] = [];

  for (let i = 0; i < count; i++) {
    const model = models[Math.floor(rand() * models.length)];
    const provider = providers.find((p) => p.id === model.providerId);
    const tokensIn = Math.round(300 + rand() * 4200);
    const tokensOut = Math.round(tokensIn * (0.2 + rand() * 0.6));

    const roll = rand();
    const status: RequestLog["status"] =
      roll > 0.955 ? "error" : roll > 0.93 ? "timeout" : "success";

    logs.push({
      id: `req_${(i + 1).toString().padStart(6, "0")}`,
      timestamp: new Date(ANCHOR - i * 137_000).toISOString(),
      modelId: model.id,
      modelName: model.name,
      providerId: model.providerId,
      providerName: provider?.name ?? "Unknown",
      tokensIn,
      tokensOut,
      latencyMs: Math.round(
        status === "timeout" ? 30_000 : 180 + rand() * (model.latencyTier === "deep" ? 2400 : 900),
      ),
      status,
      cost: Number(
        ((tokensIn / 1_000_000) * model.pricing.inputPer1M +
          (tokensOut / 1_000_000) * model.pricing.outputPer1M).toFixed(4),
      ),
    });
  }

  return logs;
}
export async function getModelBreakdown(
  range: 7 | 30 | 90 = 30,
): Promise<ModelBreakdown[]> {
  const rand = mulberry32(range + 4242);
  const total = sum(buildSeries(range));

  const rows = models.slice(0, 8).map((model) => {
    const share = 0.04 + rand() * 0.18;
    const requests = Math.round(total.requests * share);
    const tokens = Math.round(total.tokens * share);
    return {
      modelId: model.id,
      modelName: model.name,
      requests,
      tokens,
      cost: Number((total.cost * share).toFixed(2)),
    };
  });

  return rows.sort((a, b) => b.requests - a.requests);
}
export async function getProviderBreakdown(
  range: 7 | 30 | 90 = 30,
): Promise<ProviderBreakdown[]> {
  const rand = mulberry32(range + 999);
  const total = sum(buildSeries(range));

  const rows = providers.map((provider) => {
    const share = provider.status === "down" ? 0 : 0.06 + rand() * 0.16;
    return {
      providerId: provider.id,
      providerName: provider.name,
      requests: Math.round(total.requests * share),
      tokens: Math.round(total.tokens * share),
      cost: Number((total.cost * share).toFixed(2)),
    };
  });

  return rows.sort((a, b) => b.requests - a.requests);
}

export async function getLifetimeTotals(): Promise<LifetimeTotals> {
  const rand = mulberry32(20260101);
  const days = 412;

  const requests = Math.round(days * 184_000 * (0.9 + rand() * 0.2));
  const tokensIn = Math.round(requests * (csvMean(rand) * 900));
  const tokensOut = Math.round(tokensIn * 0.41);

  return {
    requests,
    tokensIn,
    tokensOut,
    cost: Number(
      ((tokensIn / 1_000_000) * 0.58 + (tokensOut / 1_000_000) * 1.84).toFixed(2),
    ),
    since: "2025-09-04",
  };
}

function csvMean(rand: () => number): number {
  return 0.85 + rand() * 0.3;
}

/**
 * Rolling one-minute view plus a ten-sample uptime window. Deterministic so
 * server and client agree; a real deployment would stream this.
 */
export async function getRealtimeSnapshot(): Promise<RealtimeSnapshot> {
  const rand = mulberry32(777_001);

  const requestsPerMinute = Math.round(212 + rand() * 48);
  const tokensPerMinute = requestsPerMinute * Math.round(910 + rand() * 220);
  const medianLatencyMs = Math.round(286 + rand() * 70);
  const p95LatencyMs = Math.round(medianLatencyMs * (3.1 + rand() * 0.6));

  // Nine healthy minutes and one partial dip: a perfectly flat line is not
  // credible and gives the UI nothing to render.
  const uptimeWindow = [1, 1, 0.998, 1, 1, 0.986, 1, 1, 0.999, 1];
  const uptimeTenMinutes =
    uptimeWindow.reduce((acc, value) => acc + value, 0) / uptimeWindow.length;

  return {
    requestsPerMinute,
    tokensPerMinute,
    medianLatencyMs,
    p95LatencyMs,
    requestsLastMinute: requestsPerMinute,
    uptimeWindow,
    uptimeTenMinutes: Number((uptimeTenMinutes * 100).toFixed(2)),
  };
}

export async function getTrendSeries(): Promise<UsagePoint[]> {
  return buildTrendSeries();
}
