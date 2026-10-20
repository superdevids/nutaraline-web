import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const CHART = readFileSync(
  path.join(process.cwd(), "components", "charts", "usage-chart.tsx"),
  "utf8",
);

const PAGE = readFileSync(
  path.join(process.cwd(), "app", "monitoring", "page.tsx"),
  "utf8",
);

describe("responsive chart width", () => {
  it("locks a wide plot on phones and stretches on larger screens", () => {
    expect(CHART).toContain("w-[720px]");
    expect(CHART).toContain("sm:w-full");
  });

  it("does not depend on a width prop", () => {
    expect(CHART).not.toContain("minWidth");
  });
});

describe("chart is mounted once", () => {
  // Rendering the same chart twice behind responsive wrappers makes React
  // unmount one subtree and mount the other, which confuses the devtools
  // reconciler and shows a "children should not have changed" warning.
  it("renders a single UsageAreaChart", () => {
    const occurrences = PAGE.match(/<UsageAreaChart/g) ?? [];
    expect(occurrences).toHaveLength(1);
  });

  it("has no responsive duplicate wrappers", () => {
    expect(PAGE).not.toContain("sm:hidden");
  });

  it("still allows horizontal scroll for the wide plot", () => {
    expect(PAGE).toContain("overflow-x-auto");
  });
});
