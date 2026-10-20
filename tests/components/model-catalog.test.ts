import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { formatPricePerMillion, USD_TO_IDR } from "@/lib/format";

const CATALOG = readFileSync(
  path.join(process.cwd(), "components", "models", "model-catalog.tsx"),
  "utf8",
);

const IDENTITY = readFileSync(
  path.join(process.cwd(), "components", "models", "model-identity.tsx"),
  "utf8",
);

describe("rupiah pricing", () => {
  it("converts USD per million to rupiah", () => {
    expect(USD_TO_IDR).toBe(16_000);
    expect(formatPricePerMillion(0.15)).toBe("Rp2.400");
  });

  it("rounds to whole rupiah", () => {
    expect(formatPricePerMillion(2.5)).toBe("Rp40.000");
  });

  it("uses the Rp prefix without a space", () => {
    expect(formatPricePerMillion(10)).toMatch(/^Rp/);
    expect(formatPricePerMillion(10)).not.toContain("Rp ");
  });

  it("is used for both price columns", () => {
    expect(CATALOG).toContain("formatPricePerMillion(model.pricing.inputPer1M)");
    expect(CATALOG).toContain("formatPricePerMillion(model.pricing.outputPer1M)");
  });

  it("no longer renders USD", () => {
    expect(CATALOG).not.toContain("formatCurrency");
    expect(CATALOG).not.toContain('"USD"');
  });
});

describe("model catalog defaults", () => {
  it("detects the viewport instead of hardcoding a view", () => {
    expect(CATALOG).toContain("useMediaQuery(MOBILE_QUERY)");
  });

  it("defaults to cards on phones and table elsewhere", () => {
    expect(CATALOG).toContain(
      'isMobile === true ? "cards" : "table"',
    );
  });

  it("searches by slug as well as name", () => {
    expect(CATALOG).toContain("model.slug.toLowerCase()");
  });
});

describe("providers are not displayed", () => {
  it("does not render the provider name", () => {
    expect(CATALOG).not.toContain("providerName(model.providerId)}");
    expect(IDENTITY).not.toContain("{provider}");
  });
});

describe("adoption figures stay live", () => {
  it("uses the animated live value in both layouts", () => {
    const occurrences = CATALOG.match(/<LiveStatValue/g) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(3);
  });

  it("derives growth deterministically from the model id", () => {
    expect(CATALOG).toContain("growthFor(");
  });
});

describe("table layout", () => {
  it("merges context and max output into the model column", () => {
    expect(CATALOG).toContain("dict.models.columns.contextShort");
    expect(CATALOG).toContain("dict.models.columns.outputShort");
  });

  it("merges capabilities into the model column", () => {
    expect(CATALOG).toContain("CapabilityList");
    expect(CATALOG).not.toContain("dict.models.columns.capabilities");
  });

  it("combines adoption metrics into one information column", () => {
    expect(CATALOG).toContain("dict.models.columns.info");
  });

  it("no longer has separate users, tokens and requests columns", () => {
    expect(CATALOG).not.toContain(
      "<TH align=\"right\">{dict.models.columns.users}</TH>",
    );
    expect(CATALOG).not.toContain(
      "<TH align=\"right\">{dict.models.columns.tokens}</TH>",
    );
    expect(CATALOG).not.toContain(
      "<TH align=\"right\">{dict.models.columns.requests}</TH>",
    );
  });
});

describe("card layout", () => {
  it("drops the long description", () => {
    expect(CATALOG).not.toContain("model.description");
  });

  it("drops the availability badge", () => {
    expect(CATALOG).not.toContain("dict.models.availability");
  });

  it("keeps the capability chips with icons", () => {
    expect(CATALOG).toContain("CapabilityList");
    expect(IDENTITY).toContain("CAPABILITY_ICON");
  });
});

describe("model identity", () => {
  it("offers a labelled, filled copy control", () => {
    expect(IDENTITY).toContain("CopyModelIdButton");
    expect(IDENTITY).toContain("navigator.clipboard.writeText");
    expect(IDENTITY).toContain("bg-surface-raised");
  });

  it("does not render the slug as visible text", () => {
    // The slug is used for the copy payload and the accessible name only; it
    // must not appear as a visible <code> element next to the model name.
    expect(IDENTITY).not.toContain("<code");
  });

  it("announces the copied state", () => {
    expect(IDENTITY).toContain("copiedLabel");
  });
});
