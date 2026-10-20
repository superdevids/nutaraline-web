import { describe, expect, it } from "vitest";
import {
  ERROR_CODES,
  describeStatus,
  isErrorCode,
  toneForCode,
} from "@/lib/errors";

describe("error code registry", () => {
  it("covers every status the product documents", () => {
    expect([...ERROR_CODES]).toEqual([400, 401, 403, 404, 408, 429, 500, 502, 503]);
  });

  it("accepts known codes as strings", () => {
    for (const code of ERROR_CODES) {
      expect(isErrorCode(String(code))).toBe(true);
    }
  });
  it("rejects unknown codes", () => {
    expect(isErrorCode("418")).toBe(false);
    expect(isErrorCode("abc")).toBe(false);
    expect(isErrorCode("")).toBe(false);
  });

  it("rejects numeric strings with extra characters", () => {
    expect(isErrorCode("400 ")).toBe(false);
    expect(isErrorCode(" 400")).toBe(false);
    expect(isErrorCode("0400")).toBe(false);
    expect(isErrorCode("4e2")).toBe(false);
  });

  it("maps client errors to warning and server errors to error", () => {
    expect(toneForCode(400)).toBe("warning");
    expect(toneForCode(429)).toBe("warning");
    expect(toneForCode(404)).toBe("info");
    expect(toneForCode(500)).toBe("error");
    expect(toneForCode(503)).toBe("error");
  });

  it("falls back to error tone for unknown codes", () => {
    expect(toneForCode(418)).toBe("error");
  });

  it("has a readable label for every supported code", () => {
    for (const code of ERROR_CODES) {
      const label = describeStatus(code);
      expect(label.length).toBeGreaterThan(0);
      expect(label).not.toBe("Unknown Error");
    }
  });

  it("labels an unknown status explicitly", () => {
    expect(describeStatus(599)).toBe("Unknown Error");
  });
});
