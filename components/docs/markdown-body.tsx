import type { MarkdownNode } from "@/lib/markdown/types";
import { CopyCodeButton } from "./copy-code-button";

/** Callout color by the bold label at the start of a quoted line. */
function calloutTone(label: string | null): { box: string; strong: string } {
  const key = (label ?? "").toLowerCase();

  if (["draf", "draft"].includes(key)) {
    return { box: "border-warning/40 bg-warning/10", strong: "text-warning" };
  }
  if (["peringatan", "warning"].includes(key)) {
    return { box: "border-error/40 bg-error/10", strong: "text-error" };
  }
  if (["tip", "saran"].includes(key)) {
    return { box: "border-success/40 bg-success/10", strong: "text-success" };
  }
  return { box: "border-border bg-surface", strong: "text-text" };
}

export function MarkdownBody({
  nodes,
  copyLabel,
  copiedLabel,
}: {
  nodes: MarkdownNode[];
  copyLabel?: string;
  copiedLabel?: string;
}) {
  return <>{nodes.map((node, index) => renderNode(node, index, copyLabel, copiedLabel))}</>;
}

function renderNode(
  node: MarkdownNode,
  index: number,
  copyLabel: string | undefined,
  copiedLabel: string | undefined,
) {
  switch (node.type) {
    case "heading":
      return node.depth === 2 ? (
        <h3 key={index} id={node.id} className="mt-8 scroll-mt-24 text-lg font-semibold text-text">
          {node.text}
        </h3>
      ) : (
        <h4 key={index} id={node.id} className="mt-6 scroll-mt-24 text-base font-semibold text-text">
          {node.text}
        </h4>
      );

    case "paragraph":
      return (
        <p
          key={index}
          className="mt-3 text-sm leading-6 text-text-muted [&_a]:text-accent [&_a]:underline [&_code]:rounded [&_code]:bg-bg [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-text [&_strong]:text-text"
          dangerouslySetInnerHTML={{ __html: node.html }}
        />
      );

    case "blockquote": {
      const tone = calloutTone(node.label);

      return (
        <div
          key={index}
          className={`mt-3 rounded-md border px-3.5 py-2.5 text-sm leading-6 [&_a]:underline [&_a]:text-accent [&_code]:rounded [&_code]:bg-bg [&_code]:px-1.5 [&_code]:py-0.5 ${tone.box}`}
        >
          {node.label ? (
            <p className={`text-xs font-semibold uppercase tracking-wide ${tone.strong}`}>
              {node.label}
            </p>
          ) : null}
          {node.html ? (
            <p
              className="text-text-muted [&_strong]:text-text"
              dangerouslySetInnerHTML={{ __html: node.html }}
            />
          ) : null}
        </div>
      );
    }

    case "list": {
      const className =
        "mt-3 space-y-1 pl-5 text-sm leading-6 text-text-muted [&_a]:text-accent [&_a]:underline [&_code]:rounded [&_code]:bg-bg [&_code]:px-1 [&_code]:text-text";
      return node.ordered ? (
        <ol key={index} className={`${className} list-decimal`}>
          {node.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ol>
      ) : (
        <ul key={index} className={`${className} list-disc`}>
          {node.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
    }

    case "code":
      return (
        <div key={index} className="relative mt-3">
          <pre className="overflow-x-auto rounded-md border border-border bg-bg-deep p-3 pr-24 text-xs leading-6 text-text">
            <code>{node.code}</code>
          </pre>
          {copyLabel && copiedLabel ? (
            <div className="absolute right-2 top-2">
              <CopyCodeButton
                code={node.code}
                copyLabel={copyLabel}
                copiedLabel={copiedLabel}
              />
            </div>
          ) : null}
        </div>
      );

    case "table":
      return (
        <div key={index} className="mt-3 overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-surface">
              <tr>
                {node.head.map((cell, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="border-b border-border px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {node.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-1.5 text-text-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "hr":
      return <hr key={index} className="mt-6 border-border" />;

    default:
      return null;
  }
}
