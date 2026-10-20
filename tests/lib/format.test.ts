import { describe, expect, it } from "vitest";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("full number formatting", () => {
  it("renders billions in full, never abbreviated", () => {
    expect(formatNumber(94_100_000_000)).toBe("94.100.000.000");
  });

  it("does not emit K, M, or B suffixes", () => {
    const cases = [999, 1_500, 2_400_000, 94_100_000_000];

    for (const value of cases) {
      const output = formatCompact(value);
      expect(output).not.toMatch(/[KMB]/);
    }
  });

  it("uses group separators for every magnitude", () => {
    expect(formatNumber(1_000)).toBe("1.000");
    expect(formatNumber(10_000_000)).toBe("10.000.000");
    expect(formatNumber(172_100_000)).toBe("172.100.000");
  });

  it("keeps formatCompact consistent with formatNumber", () => {
    expect(formatCompact(214_200)).toBe(formatNumber(214_200));
  });

  it("rounds fractional values instead of showing decimals", () => {
    expect(formatNumber(1_234.7)).toBe("1.235");
  });

  it("formats IDR without decimals", () => {
    expect(formatCurrency(1_000_000, "IDR")).toBe("Rp 1.000.000");
  });

  it("formats USD with two decimals", () => {
    expect(formatCurrency(3, "USD")).toBe("$3.00");
  });
});

describe("monitoring table has no sorting affordance", () => {
  const source = readFileSync(
    path.join(process.cwd(), "components", "monitoring", "request-table.tsx"),
    "utf8",
  );

  it("does not import sorting state", () => {
    expect(source).not.toContain("useState");
    expect(source).not.toContain("SortKey");
  });

  it("renders plain headers rather than sort buttons", () => {
    expect(source).not.toContain("aria-sort");
    expect(source).not.toContain("onClick");
  });

  it("shows the requested columns only", () => {
    expect(source).toContain("dict.monitoring.columns.duration");
    expect(source).not.toContain("dict.monitoring.columns.provider");
    expect(source).not.toContain("dict.monitoring.columns.cost");
  });
});
