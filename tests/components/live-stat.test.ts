import { describe, expect, it } from "vitest";
import { growthFor } from "@/components/models/live-stat-value";

describe("deterministic growth", () => {
  it("is stable for the same id and base", () => {
    expect(growthFor("mdl_gpt4o-u", 2)).toBe(growthFor("mdl_gpt4o-u", 2));
  });

  it("differs between models", () => {
    const a = growthFor("mdl_gpt4o-t", 12_000);
    const b = growthFor("mdl_o1-t", 12_000);
    expect(a).not.toBe(b);
  });

  it("always returns at least one", () => {
    expect(growthFor("x", 1)).toBeGreaterThanOrEqual(1);
  });

  it("scales with the base", () => {
    const small = growthFor("mdl_gpt4o-t", 100);
    const large = growthFor("mdl_gpt4o-t", 10_000);
    expect(large).toBeGreaterThan(small);
  });
});
