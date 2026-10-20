import { describe, expect, it } from "vitest";
import { parseMarkdown, extractFaq, stripDemoCallouts } from "@/lib/markdown/parse";

describe("parseMarkdown — structure", () => {
  it("builds headings and a table of contents", () => {
    const { nodes, toc } = parseMarkdown("## First\n\ntext\n\n### Second\n");

    expect(nodes[0]).toEqual({
      type: "heading",
      depth: 2,
      id: "first",
      text: "First",
    });
    expect(toc.map((entry) => entry.id)).toEqual(["first", "second"]);
  });

  it("deduplicates repeated heading ids", () => {
    const { toc } = parseMarkdown("## Same\n\n## Same\n\n## Same\n");
    expect(toc.map((entry) => entry.id)).toEqual(["same", "same-2", "same-3"]);
  });

  it("keeps fenced code verbatim and ignores its contents", () => {
    const source = "```json\n## not a heading\n```\n";
    const { nodes, toc } = parseMarkdown(source);

    expect(toc).toHaveLength(0);
    expect(nodes[0]).toEqual({
      type: "code",
      lang: "json",
      code: "## not a heading",
    });
  });

  it("handles a fence without a language", () => {
    const { nodes } = parseMarkdown("```\nplain\n```\n");
    expect(nodes[0]).toMatchObject({ type: "code", lang: null, code: "plain" });
  });

  it("parses GFM tables", () => {
    const source = "| A | B |\n|---|---|\n| 1 | 2 |\n";
    const { nodes } = parseMarkdown(source);

    expect(nodes[0]).toEqual({
      type: "table",
      head: ["A", "B"],
      rows: [["1", "2"]],
    });
  });

  it("distinguishes ordered and unordered lists", () => {
    expect(parseMarkdown("- one\n- two\n").nodes[0]).toMatchObject({
      type: "list",
      ordered: false,
      items: ["one", "two"],
    });

    expect(parseMarkdown("1. one\n2. two\n").nodes[0]).toMatchObject({
      type: "list",
      ordered: true,
    });
  });

  it("parses a labelled blockquote into a callout", () => {
    const source = "> **Tip** - Estimated runway assumes constant spend.\n";
    const { nodes } = parseMarkdown(source);

    expect(nodes[0]).toMatchObject({
      type: "blockquote",
      label: "Tip",
      html: "Estimated runway assumes constant spend.",
    });
  });

  it("merges consecutive quote lines and keeps inline formatting", () => {
    const source = "> **Note** - The key above\n> is an example.\n";
    const { nodes } = parseMarkdown(source);

    expect(nodes[0]).toMatchObject({
      type: "blockquote",
      label: "Note",
      html: "The key above is an example.",
    });
  });

  it("keeps a blockquote without a bold label", () => {
    const source = "> Just a plain quote.\n";
    const { nodes } = parseMarkdown(source);

    expect(nodes[0]).toMatchObject({
      type: "blockquote",
      label: null,
    });
  });

  it("escapes markup inside blockquotes", () => {
    const source = "> **Warning** - <script>alert(1)</script>\n";
    const { nodes } = parseMarkdown(source);
    const html = nodes[0].type === "blockquote" ? nodes[0].html : "";

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("handles a file without a trailing newline", () => {
    expect(() => parseMarkdown("## Title")).not.toThrow();
    expect(parseMarkdown("## Title").nodes).toHaveLength(1);
  });
});

describe("parseMarkdown — sanitisation", () => {
  it("escapes raw HTML", () => {
    const { nodes } = parseMarkdown('<script>alert("x")</script>\n');
    const html = nodes[0].type === "paragraph" ? nodes[0].html : "";

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("drops javascript: links but keeps the text", () => {
    const { nodes } = parseMarkdown("[click](javascript:alert(1))\n");
    const html = nodes[0].type === "paragraph" ? nodes[0].html : "";

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<a ");
    expect(html).toContain("click");
  });

  it("drops data: links", () => {
    const { nodes } = parseMarkdown("[x](data:text/html;base64,AAAA)\n");
    const html = nodes[0].type === "paragraph" ? nodes[0].html : "";
    expect(html).not.toContain("data:");
  });

  it("keeps https links with safe rel attributes", () => {
    const { nodes } = parseMarkdown("[docs](https://example.com/a)\n");
    const html = nodes[0].type === "paragraph" ? nodes[0].html : "";

    expect(html).toContain('href="https://example.com/a"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders inline code without executing markup inside it", () => {
    const { nodes } = parseMarkdown("`<b>bold</b>`\n");
    const html = nodes[0].type === "paragraph" ? nodes[0].html : "";

    expect(html).toContain("<code>");
    expect(html).not.toContain("<b>");
  });
});

describe("extractFaq — accordion extraction", () => {
  it("collects questions from a terminal FAQ section and drops the heading", () => {
    const source =
      "## Intro\n\ntext\n\n## FAQ\n\n### Question one?\n\nanswer one\n\n### Question two?\n\nanswer two\n";
    const parsed = parseMarkdown(source);
    const { nodes, faq } = extractFaq(parsed.nodes);

    expect(faq?.map((item) => item.question)).toEqual([
      "Question one?",
      "Question two?",
    ]);
    expect(faq?.[0].answer).toHaveLength(1);
    expect(
      nodes.some(
        (node) => node.type === "heading" && node.text.toLowerCase() === "faq",
      ),
    ).toBe(false);
  });

  it("leaves documents without a terminal FAQ heading untouched", () => {
    const source = "## FAQ\n\nlist of links\n\n## Later\n\nmore content\n";
    const parsed = parseMarkdown(source);
    const { nodes, faq } = extractFaq(parsed.nodes);

    expect(faq).toBeNull();
    expect(nodes).toEqual(parsed.nodes);
  });
});

describe("stripDemoCallouts — production content policy", () => {
  const parsed = parseMarkdown(
    "> **Draf** — bahan demo.\n\ntext\n\n> **Tip** — saran nyata.\n",
  );

  it("keeps every callout on a demo build", () => {
    expect(stripDemoCallouts(parsed.nodes, true)).toEqual(parsed.nodes);
  });

  it("strips only the Draf callout in production", () => {
    const kept = stripDemoCallouts(parsed.nodes, false);

    expect(kept).toHaveLength(2);
    expect(kept[0]).toMatchObject({ type: "paragraph" });
    expect(kept[1]).toMatchObject({ type: "blockquote", label: "Tip" });
  });
});
