import { describe, expect, it } from "vitest";
import { getUsageForKey } from "@/lib/dummy";
import { API_KEY_PREFIX } from "@/lib/api-key";

const KEY_A = `${API_KEY_PREFIX}${"a1b2c3d4".repeat(4)}`;
const KEY_B = `${API_KEY_PREFIX}${"z9y8x7w6".repeat(4)}`;

describe("usage history is scoped to one key", () => {
  it("returns the requested number of rows", async () => {
    expect(await getUsageForKey(KEY_A, 8)).toHaveLength(8);
  });

  it("is deterministic for the same key", async () => {
    expect(await getUsageForKey(KEY_A, 8)).toEqual(await getUsageForKey(KEY_A, 8));
  });

  it("never returns the same history for two different keys", async () => {
    const a = await getUsageForKey(KEY_A, 8);
    const b = await getUsageForKey(KEY_B, 8);

    expect(a).not.toEqual(b);
    expect(a[0].id).not.toBe(b[0].id);
    expect(a[0].modelId === b[0].modelId && a[0].tokensIn === b[0].tokensIn).toBe(
      false,
    );
  });

  it("tags every row with the key fingerprint, not a user id", async () => {
    const rows = await getUsageForKey(KEY_A, 4);
    const fingerprint = rows[0].userId;

    expect(fingerprint).toMatch(/^[0-9a-f]{8}$/);
    for (const row of rows) expect(row.userId).toBe(fingerprint);
  });

  it("carries plausible values", async () => {
    for (const row of await getUsageForKey(KEY_A, 8)) {
      expect(row.tokensIn).toBeGreaterThan(0);
      expect(row.tokensOut).toBeGreaterThan(0);
      expect(row.latencyMs).toBeGreaterThan(0);
      expect(["success", "error", "timeout"]).toContain(row.status);
    }
  });

  it("orders rows newest first", async () => {
    const rows = await getUsageForKey(KEY_A, 6);
    const times = rows.map((row) => row.timestamp);

    expect(times).toEqual([...times].sort().reverse());
  });
});
