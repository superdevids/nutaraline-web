/**
 * Rolling live metrics.
 *
 * The server supplies a deterministic starting snapshot; the client then ticks
 * every three seconds. Counters describe the current minute and reset when a
 * new minute begins.
 *
 * Pure functions only, so behaviour is testable without a DOM or fake clock
 * beyond an integer timestamp.
 */

export interface LiveMetrics {
  /** Epoch milliseconds the snapshot was taken at. */
  at: number;
  /** Minute index (epoch minutes); a change means the counters reset. */
  minute: number;
  requests: number;
  tokens: number;
  medianLatencyMs: number;
  uptimePercent: number;
}

export const TICK_MS = 3_000;
export const MINUTE_MS = 60_000;
export const REQUESTS_PER_MINUTE = 2_200;

function hashUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** First snapshot for a given clock reading. */
export function initialLiveMetrics(now: number): LiveMetrics {
  const minute = Math.floor(now / MINUTE_MS);

  return {
    at: now,
    minute,
    requests: 0,
    tokens: 0,
    medianLatencyMs: 320 + Math.round(hashUnit(minute) * 40),
    uptimePercent: 99.8,
  };
}

/**
 * Advances the snapshot to `now`.
 *
 * - A new minute resets `requests` and `tokens` to zero.
 * - Within a minute the counters only ever increase.
 * - Latency and uptime drift within plausible bounds.
 */
export function nextLiveMetrics(previous: LiveMetrics, now: number): LiveMetrics {
  const minute = Math.floor(now / MINUTE_MS);

  if (minute !== previous.minute) {
    return {
      at: now,
      minute,
      requests: 0,
      tokens: 0,
      medianLatencyMs: previous.medianLatencyMs,
      uptimePercent: previous.uptimePercent,
    };
  }

  const elapsed = now - minute * MINUTE_MS;
  const progress = elapsed / MINUTE_MS;
  const seed = Math.floor(now / TICK_MS);

  const target = Math.max(1, Math.round(REQUESTS_PER_MINUTE * progress));
  const requests = Math.max(previous.requests, target);

  const tokensPerRequest = 880 + Math.round(hashUnit(seed) * 240);
  const tokens = requests * tokensPerRequest;

  const latencyDrift = hashUnit(seed + 7) * 24 - 12;
  const medianLatencyMs = clamp(
    Math.round(previous.medianLatencyMs + latencyDrift),
    180,
    900,
  );

  const uptimeDrift = (hashUnit(seed + 13) - 0.5) * 0.04;
  const uptimePercent = clamp(
    Number((previous.uptimePercent + uptimeDrift).toFixed(2)),
    99.5,
    100,
  );

  return { at: now, minute, requests, tokens, medianLatencyMs, uptimePercent };
}

/** Reads the clock. Kept as a function so callers never read it during render. */
export function readClock(): number {
  return new Date().getTime();
}
