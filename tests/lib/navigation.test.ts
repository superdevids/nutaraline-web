import { describe, expect, it } from "vitest";
import { isActivePath, mainNav } from "@/lib/navigation";
import { headerStateFor } from "@/lib/header-state";

describe("mainNav", () => {
  const dict = {
    nav: {
      monitoring: "Monitoring",
      models: "Models",
      topup: "Top up",
      balance: "Balance",
      docs: "Docs",
    },
  };

  it("lists the five primary destinations in order", () => {
    expect(mainNav(dict).map((item) => item.href)).toEqual([
      "/monitoring",
      "/models",
      "/topup",
      "/balance",
      "/docs",
    ]);
  });

  it("uses dictionary labels, never hardcoded copy", () => {
    expect(mainNav(dict).map((item) => item.label)).toEqual([
      "Monitoring",
      "Models",
      "Top up",
      "Balance",
      "Docs",
    ]);
  });

  it("contains no locale prefix", () => {
    for (const item of mainNav(dict)) {
      expect(item.href.startsWith("/en")).toBe(false);
      expect(item.href.startsWith("/id")).toBe(false);
    }
  });
});

describe("isActivePath", () => {
  it("matches an exact route", () => {
    expect(isActivePath("/models", "/models")).toBe(true);
  });

  it("matches nested routes", () => {
    expect(isActivePath("/docs/quickstart", "/docs")).toBe(true);
    expect(isActivePath("/docs/a/b", "/docs")).toBe(true);
  });

  it("does not match a sibling with a shared prefix", () => {
    expect(isActivePath("/models-archive", "/models")).toBe(false);
  });

  it("treats the root specially", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/monitoring", "/")).toBe(false);
  });

  it("does not treat /monitoring as active on /models", () => {
    expect(isActivePath("/models", "/monitoring")).toBe(false);
  });
});

describe("header state", () => {
  it("is transparent at the very top", () => {
    expect(headerStateFor(0).scrolled).toBe(false);
  });

  it("stays transparent within the threshold", () => {
    expect(headerStateFor(8).scrolled).toBe(false);
  });

  it("becomes solid once the page scrolls", () => {
    expect(headerStateFor(9).scrolled).toBe(true);
    expect(headerStateFor(1200).scrolled).toBe(true);
  });
});
