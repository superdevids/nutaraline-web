import { describe, expect, it } from "vitest";
import { API_KEY_PREFIX } from "@/lib/api-key";
import {
  getBalanceFor,
  getModelBreakdown,
  getModels,
  getProviderBreakdown,
  getProviders,
  getRequestLogs,
  getTransactions,
  getUsageSummary,
} from "@/lib/dummy";

const VALID = `${API_KEY_PREFIX}${"a1b2c3d4".repeat(4)}`;
const ZERO_KEY = `${API_KEY_PREFIX}${"a".repeat(28)}0000`;

describe("determinism (AC-5)", () => {
  it("returns identical usage summaries across calls", async () => {
    const first = await getUsageSummary(30);
    const second = await getUsageSummary(30);
    expect(second).toEqual(first);
  });

  it("returns identical request logs across calls", async () => {
    expect(await getRequestLogs(20)).toEqual(await getRequestLogs(20));
  });

  it("returns identical breakdowns across calls", async () => {
    expect(await getModelBreakdown(7)).toEqual(await getModelBreakdown(7));
    expect(await getProviderBreakdown(7)).toEqual(await getProviderBreakdown(7));
  });

  it("produces a series of the requested length", async () => {
    for (const range of [7, 30, 90] as const) {
      const summary = await getUsageSummary(range);
      expect(summary.series).toHaveLength(range);
      expect(summary.range).toBe(range);
    }
  });

  it("never emits negative or non-finite values", async () => {
    const summary = await getUsageSummary(90);
    for (const point of summary.series) {
      expect(Number.isFinite(point.requests)).toBe(true);
      expect(point.requests).toBeGreaterThan(0);
      expect(point.cost).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("catalog sanity", () => {
  it("has at least 14 models across at least 8 providers", async () => {
    expect((await getModels()).length).toBeGreaterThanOrEqual(14);
    expect((await getProviders()).length).toBeGreaterThanOrEqual(8);
  });

  it("every model points at a known provider", async () => {
    const providerIds = new Set((await getProviders()).map((p) => p.id));
    for (const model of await getModels()) {
      expect(providerIds.has(model.providerId)).toBe(true);
    }
  });

  it("covers every provider status so the health UI is exercised", async () => {
    const statuses = new Set((await getProviders()).map((p) => p.status));
    expect(statuses).toContain("healthy");
    expect(statuses).toContain("degraded");
    expect(statuses).toContain("down");
  });

  it("uses unique model ids and slugs", async () => {
    const models = await getModels();
    expect(new Set(models.map((m) => m.id)).size).toBe(models.length);
    expect(new Set(models.map((m) => m.slug)).size).toBe(models.length);
  });
});

describe("balance rules (AC-7)", () => {
  it("returns a populated balance for an ordinary key", async () => {
    const snapshot = await getBalanceFor(VALID);
    expect(snapshot.balance).toBeGreaterThan(0);
    expect(snapshot.apiKeyMasked).toContain("••••");
  });

  it("returns a zero balance for keys ending in 0000", async () => {
    const snapshot = await getBalanceFor(ZERO_KEY);
    expect(snapshot.balance).toBe(0);
    expect(snapshot.estimatedDaysLeft).toBe(0);
  });

  it("never exposes the raw key", async () => {
    const snapshot = await getBalanceFor(VALID);
    expect(snapshot.apiKeyMasked).not.toContain(VALID.slice(10));
  });
});

describe("transactions", () => {
  it("includes both top-ups and usage charges", async () => {
    const rows = await getTransactions(18);
    const types = new Set(rows.map((row) => row.type));
    expect(types).toContain("topup");
    expect(types).toContain("usage");
  });

  it("produces a deterministic ledger", async () => {
    expect(await getTransactions(10)).toEqual(await getTransactions(10));
  });
});
