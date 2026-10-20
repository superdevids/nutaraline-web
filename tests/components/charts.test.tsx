import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const CHART_SOURCE = readFileSync(
  path.join(process.cwd(), "components", "charts", "usage-chart.tsx"),
  "utf8",
);

/**
 * Regression guard for the runtime error:
 *   "Functions cannot be passed directly to Client Components"
 * The chart component must accept a serialisable string, never a formatter
 * function, because it is rendered from a Server Component.
 */
describe("chart component contract", () => {
  it("declares a string-based format prop", () => {
    expect(CHART_SOURCE).toContain("export type ValueFormat");
    expect(CHART_SOURCE).toContain('"number" | "usd"');
  });

  it("does not accept a function prop from callers", () => {
    expect(CHART_SOURCE).not.toMatch(/valueFormatter\?:\s*\(/);
  });

  it("resolves the format internally", () => {
    expect(CHART_SOURCE).toContain("function formatValue(");
  });

  it("remains a client component", () => {
    expect(CHART_SOURCE.startsWith('"use client"')).toBe(true);
  });
});

describe("monitoring page passes serialisable props", () => {
  const page = readFileSync(
    path.join(process.cwd(), "app", "monitoring", "page.tsx"),
    "utf8",
  );

  it("uses valueFormat instead of an inline arrow", () => {
    expect(page).toContain('valueFormat="number"');
    expect(page).not.toContain("valueFormatter={");
  });
});
