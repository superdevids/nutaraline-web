import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { parseMarkdown, extractFaq, stripDemoCallouts } from "./parse";
import type { DocNeighbors, DocPage, DocTreeGroup } from "./types";
import type { Locale } from "@/lib/i18n";
import { isDemoBuild } from "@/lib/env";

const CONTENT_ROOT = path.join(process.cwd(), "content", "docs");

const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  group: z.string().min(1),
  order: z.coerce.number().int().nonnegative(),
  /** Position of the group itself in the sidebar. Ties fall back to the name. */
  groupOrder: z.coerce.number().int().nonnegative().optional(),
  /** Set "false" to hide the table-of-contents rails on that page. */
  toc: z
    .string()
    .optional()
    .transform((value) => value === undefined || value === "true"),
  updated: z.string().min(1),
});

interface RawDoc {
  slug: string;
  title: string;
  description: string;
  group: string;
  order: number;
  groupOrder: number;
  tocVisible: boolean;
  updated: string;
  body: string;
}

function dirFor(locale: Locale): string {
  return path.join(CONTENT_ROOT, locale);
}

function parseFrontmatter(source: string, file: string) {
  // Windows checkouts may carry CRLF line endings; normalise before matching.
  const normalized = source.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    throw new Error(`Missing frontmatter in ${file}`);
  }

  const raw: Record<string, string> = {};

  for (const line of match[1].split("\n")) {
    if (!line.trim()) continue;
    const sep = line.indexOf(":");
    if (sep === -1) {
      throw new Error(`Malformed frontmatter line in ${file}: ${line}`);
    }
    const key = line.slice(0, sep).trim();
    const value = line
      .slice(sep + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (value !== "") raw[key] = value;
  }

  const parsed = frontmatterSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${file}: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")} ${issue.message}`)
        .join(", ")}`,
    );
  }

  return { data: parsed.data, body: normalized.slice(match[0].length) };
}

async function readDoc(locale: Locale, slug: string): Promise<RawDoc | null> {
  const file = `${slug}.md`;
  const full = path.join(dirFor(locale), file);

  let source: string;
  try {
    source = await readFile(full, "utf8");
  } catch {
    return null;
  }

  const { data, body } = parseFrontmatter(source, file);

  return {
    slug,
    ...data,
    groupOrder: data.groupOrder ?? Number.MAX_SAFE_INTEGER,
    tocVisible: data.toc,
    body,
  };
}

/**
 * Slugs available for a locale. Reads the filesystem each call — the content
 * set is small and stable at build time.
 */
export async function getDocSlugs(locale: Locale): Promise<string[]> {
  try {
    const files = await readdir(dirFor(locale));
    return files
      .filter((name) => name.endsWith(".md"))
      .map((name) => name.replace(/\.md$/, ""))
      .sort();
  } catch {
    return [];
  }
}

export async function getDoc(
  locale: Locale,
  slug: string,
): Promise<DocPage | null> {
  const raw = await readDoc(locale, slug);
  if (!raw) return null;

  const parsed = parseMarkdown(raw.body);
  const cleanNodes = stripDemoCallouts(parsed.nodes, isDemoBuild);
  const { nodes, faq } = extractFaq(cleanNodes);
  const faqClean =
    faq === null
      ? null
      : faq.map((item) => ({
          question: item.question,
          answer: stripDemoCallouts(item.answer, isDemoBuild),
        }));

  return {
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    group: raw.group,
    order: raw.order,
    updated: raw.updated,
    tocVisible: raw.tocVisible,
    nodes,
    toc: parsed.toc,
    faq: faqClean,
  };
}

export async function getDocTree(locale: Locale): Promise<DocTreeGroup[]> {
  const slugs = await getDocSlugs(locale);
  const docs: RawDoc[] = [];

  for (const slug of slugs) {
    const raw = await readDoc(locale, slug);
    if (raw) docs.push(raw);
  }

  const byGroup = new Map<string, RawDoc[]>();

  for (const doc of docs) {
    const bucket = byGroup.get(doc.group) ?? [];
    bucket.push(doc);
    byGroup.set(doc.group, bucket);
  }

  return [...byGroup.entries()]
    .map(([group, items]) => {
      const pages = items
        .sort((a, b) => a.order - b.order)
        .map((doc) => ({ slug: doc.slug, title: doc.title, order: doc.order }));

      return {
        group,
        pages,
        // The group sits where the frontmatter puts it; pages without an
        // explicit position sort last, by name.
        groupOrder: Math.min(...items.map((doc) => doc.groupOrder)),
      };
    })
    .sort(
      (a, b) =>
        a.groupOrder - b.groupOrder || a.group.localeCompare(b.group),
    )
    .map(({ group, pages }) => ({ group, pages }));
}

export async function getDocNeighbors(
  locale: Locale,
  slug: string,
): Promise<DocNeighbors> {
  const tree = await getDocTree(locale);
  const flat = tree.flatMap((group) => group.pages);
  const index = flat.findIndex((page) => page.slug === slug);

  if (index === -1) return { previous: null, next: null };

  const toLink = (page: { slug: string; title: string }) => ({
    slug: page.slug,
    title: page.title,
  });

  return {
    previous: index > 0 ? toLink(flat[index - 1]) : null,
    next: index < flat.length - 1 ? toLink(flat[index + 1]) : null,
  };
}
