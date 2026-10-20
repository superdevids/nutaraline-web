export type MarkdownNode =
  | { type: "heading"; depth: 2 | 3; id: string; text: string }
  | { type: "paragraph"; html: string }
  | { type: "blockquote"; label: string | null; html: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; lang: string | null; code: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "hr" };

/** One question of a terminal FAQ section, rendered as an accordion row. */
export interface FaqItem {
  question: string;
  answer: MarkdownNode[];
}

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** One question of a terminal FAQ section, rendered as an accordion row. */
export interface FaqItem {
  question: string;
  answer: MarkdownNode[];
}

export interface ParsedDoc {
  nodes: MarkdownNode[];
  toc: TocEntry[];
}

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  group: string;
  order: number;
  updated: string;
  /** False hides the "Daftar Isi" rails (used by the FAQ page). */
  tocVisible: boolean;
  nodes: MarkdownNode[];
  toc: TocEntry[];
  faq: FaqItem[] | null;
}

export interface DocTreeGroup {
  group: string;
  pages: { slug: string; title: string; order: number }[];
}

export interface DocNeighbors {
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}
