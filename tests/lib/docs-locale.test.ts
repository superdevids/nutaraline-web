import { describe, expect, it } from "vitest";
import { getDoc, getDocNeighbors, getDocSlugs, getDocTree } from "@/lib/markdown/load";

describe("documentation is available in both locales", () => {
  it("lists the same slugs for en and id", async () => {
    const en = await getDocSlugs("en");
    const id = await getDocSlugs("id");

    expect(en.length).toBeGreaterThan(0);
    expect(id.length).toBe(en.length);
    expect([...id].sort()).toEqual([...en].sort());
  });

  it("loads a page in each locale", async () => {
    for (const locale of ["en", "id"] as const) {
      const doc = await getDoc(locale, "introduction");
      expect(doc).not.toBeNull();
      expect(doc?.nodes.length).toBeGreaterThan(0);
      expect(doc?.toc.length).toBeGreaterThan(0);
    }
  });

  it("translates the page title rather than reusing the English one", async () => {
    const en = await getDoc("en", "introduction");
    const id = await getDoc("id", "introduction");
    expect(id?.title).not.toBe(en?.title);
  });

  it("translates group headings", async () => {
    const en = await getDocTree("en");
    const id = await getDocTree("id");

    const enGroups = en.map((group) => group.group);
    const idGroups = id.map((group) => group.group);

    expect(idGroups).not.toEqual(enGroups);
  });

  it("returns null for a slug that does not exist", async () => {
    expect(await getDoc("en", "no-such-page")).toBeNull();
  });

  it("orders groups by frontmatter groupOrder, then pages by order", async () => {
    const en = await getDocTree("en");
    const id = await getDocTree("id");

    expect(en.map((group) => group.group)).toEqual([
      "Getting Started",
      "Guides",
      "API Reference",
    ]);
    expect(id.map((group) => group.group)).toEqual([
      "Memulai",
      "Panduan",
      "Referensi API",
    ]);
    expect(id[0].pages.map((page) => page.slug)).toEqual([
      "introduction",
      "quickstart",
      "authentication",
    ]);
  });

  it("builds neighbours within the same locale", async () => {
    const en = await getDocNeighbors("en", "quickstart");
    const id = await getDocNeighbors("id", "quickstart");

    expect(en.previous?.slug).toBe("introduction");
    expect(id.previous?.slug).toBe("introduction");
    expect(id.next?.slug).toBe("authentication");
  });

  it("marks the first page without a previous neighbour", async () => {
    for (const locale of ["en", "id"] as const) {
      const first = await getDocNeighbors(locale, "introduction");
      expect(first.previous).toBeNull();
    }
  });

  it("marks the last page without a next neighbour", async () => {
    const tree = await getDocTree("id");
    const flat = tree.flatMap((group) => group.pages);
    const last = flat[flat.length - 1];

    const neighbours = await getDocNeighbors("id", last.slug);
    expect(neighbours.next).toBeNull();
  });
});
