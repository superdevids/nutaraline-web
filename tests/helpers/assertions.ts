import { expect } from "vitest";

/** Asserts a string looks like a masked gateway key, not a raw one. */
export function expectMaskedApiKey(text: string) {
  expect(text).toMatch(/^sk-ntr-•+/);
  expect(text).not.toMatch(/^sk-ntr-[A-Za-z0-9]{32}$/);
}

export function expectAccessibleName(element: Element, name: string) {
  const label = element.getAttribute("aria-label") ?? element.textContent ?? "";
  expect(label.trim()).toContain(name);
}
