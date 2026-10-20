import { describe, expect, it } from "vitest";
import { en, id, locales, hasLocale, getDictionaryFor } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/types";

/** Flattens a dictionary into dot-separated leaf paths. */
function flatten(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [];
}

function readPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, root);
}

describe("dictionary parity (AC-2, AC-3)", () => {
  const enKeys = flatten(en).sort();
  const idKeys = flatten(id).sort();

  it("exposes exactly the same keys in both locales", () => {
    expect(idKeys).toEqual(enKeys);
  });

  it("has no empty strings", () => {
    for (const locale of [en, id] as Dictionary[]) {
      for (const key of flatten(locale)) {
        expect(String(readPath(locale, key)).trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("translates every key (no accidental English fallback in id)", () => {
    const identical = enKeys.filter(
      (key) => readPath(en, key) === readPath(id, key),
    );

    // A handful of keys are legitimately identical: brand, product names,
    // and technical capability labels that are not translated.
    const allowedIdentical = new Set([
      "common.appName",
      "common.perMillionTokens",
      "models.capabilities.vision",
      "models.capabilities.tools",
      "models.capabilities.reasoning",
      "models.capabilities.thinking",
      "models.capabilities.long-context",
      "models.capabilities.json",
      "billing.method.virtualAccount",
      "billing.method.qris",
      "nav.monitoring",
      "nav.models",
      "nav.topup",
      "nav.docs",
      "meta.titleTemplate",
      "meta.title",
      "legal.effectiveDate",
      "nav.admin",
      "errorPages.codeLabel",
      // Requested verbatim by the product owner in both locales.
      "monitoring.hero.requestsPerMinute",
      "monitoring.hero.baseUrl",
      // Brand name, identical in both locales.
      "contact.whatsapp",
      "monitoring.title",
      "nav.monitoring",
      // Loanwords that are the natural Indonesian term.
      "common.model",
      "common.status",
      "monitoring.columns.model",
      "monitoring.columns.status",
      "balance.topupColumns.status",
      "balance.usageColumns.model",
      "balance.usageColumns.status",
      "models.columns.model",
      "monitoring.users.columns.model",
      "monitoring.users.columns.status",
      "monitoring.users.plan.pro",
      "topup.virtualAccount",
      // Numeric or technical tokens.
      "home.metricsValue.models",
      "home.metricsValue.requests",
      "notFound.code",
      "monitoring.health.p50",
      "monitoring.health.p95",
      // Input placeholders are literal key examples.
      "topup.keyPlaceholder",
      "balance.keyPlaceholder",
    ]);

    const unexpected = identical.filter((key) => !allowedIdentical.has(key));
    expect(unexpected).toEqual([]);
  });
});

describe("locale helpers", () => {
  it("lists both locales", () => {
    expect(locales).toEqual(["en", "id"]);
  });

  it("narrows known locales only", () => {
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("id")).toBe(true);
    expect(hasLocale("fr")).toBe(false);
  });

  it("resolves dictionaries by locale", () => {
    expect(getDictionaryFor("en")).toBe(en);
    expect(getDictionaryFor("id")).toBe(id);
  });
});
