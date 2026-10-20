import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getTrendSeries } from "@/lib/dummy";

const SOURCE = readFileSync(
  path.join(process.cwd(), "components", "charts", "usage-chart.tsx"),
  "utf8",
);

describe("usage chart axis labels", () => {
  it("derives one unique tick per day, not one per sample", async () => {
    const series = await getTrendSeries();
    const days = new Set(series.map((point) => point.date));

    expect(days.size).toBe(7);
    expect(series.length).toBe(28);
  });

  it("passes an explicit tick list to the axis", () => {
    // Blanked labels do not remove a tick: Recharts still renders the slot.
    expect(SOURCE).toContain("ticks={dayTicks}");
    expect(SOURCE).toContain("const dayTicks");
  });

  it("does not blank labels with an empty string", () => {
    expect(SOURCE).not.toContain('? "" :');
  });

  it("keeps all samples in the plotted data", () => {
    expect(SOURCE).toContain("data.map");
    expect(SOURCE).not.toContain("data.filter(");
  });
});

describe("tooltip reads a full date", () => {
  it("uses the day field for the label", () => {
    expect(SOURCE).toContain("point?.day");
    expect(SOURCE).not.toContain("fullDay");
  });
});
