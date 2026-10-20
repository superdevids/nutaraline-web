import { describe, expect, it } from "vitest";
import {
  getModelsWithStats,
  getTopUsers,
  getUnreadCount,
  getUserRequestLogs,
} from "@/lib/dummy";
import { models } from "@/lib/dummy/models-data";

describe("model statistics", () => {
  it("returns one entry per catalog model", async () => {
    const entries = await getModelsWithStats();
    expect(entries).toHaveLength(models.length);
  });

  it("is deterministic across calls", async () => {
    expect(await getModelsWithStats()).toEqual(await getModelsWithStats());
  });

  it("reports positive adoption for every model", async () => {
    for (const model of await getModelsWithStats()) {
      expect(model.stats.uniqueUsers).toBeGreaterThan(0);
      expect(model.stats.totalTokens).toBeGreaterThan(0);
      expect(model.stats.totalRequests).toBeGreaterThan(0);
    }
  });

  it("keeps the stat key aligned with the model id", async () => {
    for (const model of await getModelsWithStats()) {
      expect(model.stats.modelId).toBe(model.id);
    }
  });

  it("preserves the original catalog fields", async () => {
    const [first] = await getModelsWithStats();
    const original = models.find((entry) => entry.id === first.id);
    expect(first.name).toBe(original?.name);
    expect(first.pricing).toEqual(original?.pricing);
  });
});

describe("top users", () => {
  it("returns the requested number of users", async () => {
    expect(await getTopUsers(5)).toHaveLength(5);
    expect(await getTopUsers(8)).toHaveLength(8);
  });

  it("does not exceed the dataset size", async () => {
    const users = await getTopUsers(999);
    const all = await getTopUsers();

    expect(users.length).toBe(all.length);
    expect(users.length).toBeGreaterThanOrEqual(40);
  });

  it("returns every user when no count is given", async () => {
    const all = await getTopUsers();
    expect(all.length).toBeGreaterThanOrEqual(40);
  });

  it("has unique names so the leaderboard search is unambiguous", async () => {
    const names = (await getTopUsers()).map((user) => user.userName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("is sorted by token consumption descending", async () => {
    const users = await getTopUsers(8);
    const totals = users.map((user) => user.totalTokens);
    expect(totals).toEqual([...totals].sort((a, b) => b - a));
  });

  it("has unique user ids and emails", async () => {
    const users = await getTopUsers(8);
    expect(new Set(users.map((user) => user.userId)).size).toBe(users.length);
    expect(new Set(users.map((user) => user.email)).size).toBe(users.length);
  });

  it("references a model that exists in the catalogue", async () => {
    const ids = new Set(models.map((model) => model.id));
    for (const user of await getTopUsers(8)) {
      expect(ids.has(user.favoriteModelId)).toBe(true);
    }
  });
});

describe("user request logs", () => {
  it("is deterministic", async () => {
    expect(await getUserRequestLogs(10)).toEqual(await getUserRequestLogs(10));
  });

  it("returns the requested count with unique ids", async () => {
    const logs = await getUserRequestLogs(12);
    expect(logs).toHaveLength(12);
    expect(new Set(logs.map((log) => log.id)).size).toBe(12);
  });

  it("carries positive latency and token counts", async () => {
    for (const log of await getUserRequestLogs(12)) {
      expect(log.latencyMs).toBeGreaterThan(0);
      expect(log.tokensIn).toBeGreaterThan(0);
      expect(log.tokensOut).toBeGreaterThan(0);
    }
  });

  it("includes more than one status so the UI is exercised", async () => {
    const statuses = new Set((await getUserRequestLogs(12)).map((log) => log.status));
    expect(statuses.size).toBeGreaterThan(1);
  });
});

describe("unread notifications", () => {
  it("counts exactly the unread entries", async () => {
    const { notifications } = await import("@/lib/dummy/notifications");
    const expected = notifications.filter((item) => !item.read).length;
    expect(await getUnreadCount()).toBe(expected);
  });

  it("returns a non-negative number", async () => {
    expect(await getUnreadCount()).toBeGreaterThanOrEqual(0);
  });
});
