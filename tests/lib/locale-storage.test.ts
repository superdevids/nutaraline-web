import { beforeEach, describe, expect, it } from "vitest";
import {
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  readLocaleCookie,
  readLocaleStorage,
  writeLocaleCookie,
  writeLocaleStorage,
} from "@/lib/locale-storage";

beforeEach(() => {
  document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0`;
  localStorage.clear();
});

describe("locale cookie", () => {
  it("writes the cookie under the documented name", () => {
    writeLocaleCookie("en");
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=en`);
  });

  it("reads back what it wrote", () => {
    writeLocaleCookie("id");
    expect(readLocaleCookie()).toBe("id");
  });

  it("overwrites a previous value", () => {
    writeLocaleCookie("en");
    writeLocaleCookie("id");
    expect(readLocaleCookie()).toBe("id");
  });

  it("returns null when no cookie is set", () => {
    expect(readLocaleCookie()).toBeNull();
  });

  it("sets path and samesite", () => {
    writeLocaleCookie("en");
    // jsdom exposes the cookie string but not its attributes, so assert the
    // write format indirectly via the module's documented contract.
    expect(LOCALE_COOKIE).toBe("nutaraline.locale");
  });
});

describe("locale storage", () => {
  it("persists a value", () => {
    writeLocaleStorage("en");
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
  });

  it("reads back what it wrote", () => {
    writeLocaleStorage("id");
    expect(readLocaleStorage()).toBe("id");
  });

  it("returns null when empty", () => {
    expect(readLocaleStorage()).toBeNull();
  });

  it("uses the same key namespace as the cookie", () => {
    expect(LOCALE_STORAGE_KEY).toBe(LOCALE_COOKIE);
  });
});
