import type { FaqItem, MarkdownNode, ParsedDoc, TocEntry } from "./types";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

const SAFE_SCHEME = /^(https?:\/\/|\/|#)/i;

function renderInline(raw: string): string {
  // Escape first so nothing below can introduce markup from user input.
  let out = escapeHtml(raw);

  // Inline code is extracted before other inline syntax so backticks win.
  const codes: string[] = [];
  out = out.replace(/`([^`]+)`/g, (_, code: string) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });

  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (match, text: string, url: string) => {
      const decoded = url.replace(/&amp;/g, "&");

      if (!SAFE_SCHEME.test(decoded)) return text;

      return `<a href="${decoded}" rel="noopener noreferrer">${text}</a>`;
    },
  );

  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

  out = out.replace(/\u0000(\d+)\u0000/g, (_, idx: string) => {
    return `<code>${codes[Number(idx)]}</code>`;
  });

  return out;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  return /^\|?[\s:-]*-[\s|:-]*\|?$/.test(line.trim()) && line.includes("-");
}

export function parseMarkdown(source: string): ParsedDoc {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const nodes: MarkdownNode[] = [];
  const toc: TocEntry[] = [];
  const usedIds = new Map<string, number>();

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code block.
    const fence = trimmed.match(/^```(\w*)/);
    if (fence) {
      const lang = fence[1] || null;
      const buffer: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buffer.push(lines[i]);
        i++;
      }
      i++; // consume closing fence
      nodes.push({ type: "code", lang, code: buffer.join("\n") });
      continue;
    }

    // Horizontal rule (must be checked before headings/lists).
    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      nodes.push({ type: "hr" });
      i++;
      continue;
    }

    // Blockquote: consecutive ">" lines form one callout. A leading bold
    // token ("**Tip** — …") becomes the callout label.
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const current = lines[i].trim();
        if (!current.startsWith(">")) break;
        quoteLines.push(current.replace(/^>\s?/, ""));
        i++;
      }

      const first = (quoteLines[0] ?? "").trim();
      const labelMatch = first.match(/^\*\*([^*]+)\*\*\s*[-—–]?\s*/);
      const label = labelMatch ? labelMatch[1].trim() : null;
      const rest = [
        labelMatch ? first.slice(labelMatch[0].length) : first,
        ...quoteLines.slice(1),
      ]
        .filter((line) => line.trim())
        .join(" ");

      nodes.push({ type: "blockquote", label, html: renderInline(rest) });
      continue;
    }

    // Headings h2/h3. h1 is the page title and is stored in frontmatter.
    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const depth = heading[1].length as 2 | 3;
      const text = heading[2].trim();
      const baseId = slugify(text) || `section-${nodes.length}`;
      const seen = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, seen + 1);
      const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`;

      nodes.push({ type: "heading", depth, id, text });
      toc.push({ id, text, depth });
      i++;
      continue;
    }

    // Table: header row followed by a divider row.
    if (trimmed.startsWith("|") && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      const head = splitRow(trimmed);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      nodes.push({ type: "table", head, rows });
      continue;
    }

    // Lists.
    if (/^([-*]|\d+\.)\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items: string[] = [];

      while (i < lines.length) {
        const current = lines[i].trim();
        const isItem = ordered
          ? /^\d+\.\s+/.test(current)
          : /^[-*]\s+/.test(current);

        if (!isItem) break;

        items.push(renderInline(current.replace(/^([-*]|\d+\.)\s+/, "")));
        i++;
      }

      nodes.push({ type: "list", ordered, items });
      continue;
    }

    // Paragraph: consume consecutive non-empty, non-special lines.
    const buffer: string[] = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (
        !current ||
        current.startsWith("|") ||
        current.startsWith("```") ||
        current.startsWith(">") ||
        /^(#{2,3})\s+/.test(current) ||
        /^([-*]|\d+\.)\s+/.test(current) ||
        /^(---|\*\*\*|___)$/.test(current)
      ) {
        break;
      }
      buffer.push(current);
      i++;
    }

    if (buffer.length > 0) {
      nodes.push({ type: "paragraph", html: renderInline(buffer.join(" ")) });
    }
  }

  return { nodes, toc };
}

/**
 * Splits a terminal `## FAQ` section into accordion items. `### Question`
 * headings start an item; everything up to the next `###` is its answer.
 * The section must be the last `##` section of the document — that guard
 * keeps guides that mention "FAQ" mid-page from being rewritten, while the
 * `###` questions inside the section don't break it.
 */
export function extractFaq(nodes: MarkdownNode[]): {
  nodes: MarkdownNode[];
  faq: FaqItem[] | null;
} {
  let faqIndex = -1;

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.type !== "heading") continue;

    if (node.depth === 2 && node.text.toLowerCase() === "faq" && faqIndex === -1) {
      faqIndex = index;
    }
  }

  // Terminal means: no other `##` section follows the FAQ one. The `###`
  // questions inside the section are content, not sibling sections.
  const hasSectionAfter = nodes.some(
    (node, index) =>
      index > faqIndex &&
      node.type === "heading" &&
      node.depth === 2 &&
      node.text.toLowerCase() !== "faq",
  );

  if (faqIndex === -1 || hasSectionAfter) {
    return { nodes, faq: null };
  }

  const items: FaqItem[] = [];
  for (const node of nodes.slice(faqIndex + 1)) {
    if (node.type === "heading" && node.depth === 3) {
      items.push({ question: node.text, answer: [] });
      continue;
    }
    items[items.length - 1]?.answer.push(node);
  }

  if (items.length === 0) {
    return { nodes, faq: null };
  }

  // The "## FAQ" heading itself becomes the accordion's caption, not content.
  return { nodes: nodes.slice(0, faqIndex), faq: items };
}

/**
 * Removes the "Draf / Draft" callout from parsed nodes when the build is not
 * a demo (NEXT_PUBLIC_ENV=production). Pure so both the article body and FAQ
 * answers can run it, and so tests can drive it without env gymnastics.
 */
export function stripDemoCallouts(
  nodes: MarkdownNode[],
  isDemo: boolean,
): MarkdownNode[] {
  if (isDemo) return nodes;

  return nodes.filter(
    (node) =>
      !(
        node.type === "blockquote" &&
        ["draf", "draft"].includes((node.label ?? "").toLowerCase())
      ),
  );
}
