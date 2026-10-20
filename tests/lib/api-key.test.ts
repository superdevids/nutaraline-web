import { describe, expect, it } from "vitest";
import {
  API_KEY_PREFIX,
  checksumDigit,
  generateApiKey,
  isZeroBalanceKey,
  keyFingerprint,
  maskApiKey,
  validateApiKey,
} from "@/lib/api-key";

const CONTENT = "cafebabe00000000000000000000";
const VALID = "sk-ntr-cafebabe00000000000000000000b";

describe("checksumDigit", () => {
  it("computes the check digit for the docs example content", () => {
    expect(checksumDigit("cafebabe00000000000000000000")).toBe(0xb);
  });

  it("returns null for wrong length or non-hex content", () => {
    expect(checksumDigit("cafe")).toBeNull();
    expect(checksumDigit(`${"g".repeat(28)}`)).toBeNull();
  });
});

describe("validateApiKey", () => {
  it("accepts a checksum-valid key and lowercases it", () => {
    expect(validateApiKey(VALID)).toEqual({ ok: true, value: VALID });
    expect(validateApiKey(`sk-ntr-${CONTENT.toUpperCase()}B`)).toEqual({
      ok: true,
      value: VALID,
    });
  });

  it("trims surrounding whitespace", () => {
    expect(validateApiKey(`  ${VALID}\n`)).toEqual({ ok: true, value: VALID });
  });

  it("rejects empty input", () => {
    expect(validateApiKey("   ")).toEqual({ ok: false, reason: "empty" });
  });

  it("rejects a wrong prefix", () => {
    expect(validateApiKey(`sk-openai-${CONTENT}b`)).toEqual({
      ok: false,
      reason: "format",
    });
  });

  it("rejects a body of the wrong length", () => {
    expect(validateApiKey(`${API_KEY_PREFIX}${"a".repeat(28)}`)).toEqual({
      ok: false,
      reason: "format",
    });
  });

  it("rejects non-hex body characters", () => {
    expect(validateApiKey(`${API_KEY_PREFIX}${"g".repeat(29)}`)).toEqual({
      ok: false,
      reason: "format",
    });
  });

  it("rejects a tampered checksum digit", () => {
    expect(validateApiKey(`sk-ntr-${CONTENT}c`)).toEqual({
      ok: false,
      reason: "checksum",
    });
  });

  it("rejects tampering inside the content, not just the last digit", () => {
    const tampered = VALID.replace("cafebabe", "cafebaba");
    expect(validateApiKey(tampered)).toEqual({
      ok: false,
      reason: "checksum",
    });
  });
});

describe("generateApiKey", () => {
  it("round-trips a deterministic content body", () => {
    expect(generateApiKey(CONTENT)).toBe(VALID);
  });

  it("mints valid keys at random", () => {
    for (let i = 0; i < 25; i++) {
      const key = generateApiKey();
      const result = validateApiKey(key);
      expect(result.ok).toBe(true);
      expect(key).toHaveLength(API_KEY_PREFIX.length + 29);
    }
  });

  it("falls back to random when content is not 28 hex chars", () => {
    const key = generateApiKey("nothex!");
    expect(validateApiKey(key).ok).toBe(true);
    expect(key).toHaveLength(API_KEY_PREFIX.length + 29);
  });
});

describe("maskApiKey", () => {
  it("keeps only the prefix and last four characters", () => {
    expect(maskApiKey(VALID)).toBe(`${API_KEY_PREFIX}••••••000b`);
  });

  it("never exposes the key body", () => {
    const masked = maskApiKey(VALID);
    expect(masked).not.toContain(VALID.slice(API_KEY_PREFIX.length, -4));
  });

  it("masks strings without the expected prefix", () => {
    expect(maskApiKey("totally-unknown-secret")).not.toContain("secret");
  });
});

describe("keyFingerprint", () => {
  it("is stable for the same key", () => {
    expect(keyFingerprint(VALID)).toBe(keyFingerprint(VALID));
  });

  it("differs for different keys", () => {
    const other = generateApiKey("deadbeef0000000000000000000c");
    expect(keyFingerprint(VALID)).not.toBe(keyFingerprint(other));
  });
});

describe("isZeroBalanceKey", () => {
  it("flags checksum-valid keys ending in 0000", () => {
    const zero = generateApiKey("caaebabe00000000000000000000");
    expect(zero.endsWith("0000")).toBe(true);
    expect(isZeroBalanceKey(zero)).toBe(true);
  });

  it("does not flag other keys", () => {
    expect(isZeroBalanceKey(VALID)).toBe(false);
  });
});
