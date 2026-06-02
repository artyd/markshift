import restructured from "restructured";
import type { Converter } from "@/types/conversion";
import { htmlStringToMarkdown } from "./htmlToMd";

interface RstNode {
  type: string;
  value?: string;
  children?: RstNode[];
  [key: string]: unknown;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Render the children of a node, concatenated. */
function renderChildren(node: RstNode, depth: number): string {
  return (node.children ?? []).map((c) => renderNode(c, depth)).join("");
}

/** Render a single restructured AST node to HTML. */
function renderNode(node: RstNode, depth: number): string {
  switch (node.type) {
    case "text":
      return escapeHtml(node.value ?? "");
    case "document":
      return renderChildren(node, depth);
    case "section": {
      // Each section bumps the heading depth for its title.
      return (node.children ?? [])
        .map((c) => (c.type === "title" ? renderHeading(c, depth + 1) : renderNode(c, depth + 1)))
        .join("");
    }
    case "title":
      return renderHeading(node, depth);
    case "paragraph":
      return `<p>${renderChildren(node, depth)}</p>`;
    case "strong":
      return `<strong>${renderChildren(node, depth)}</strong>`;
    case "emphasis":
      return `<em>${renderChildren(node, depth)}</em>`;
    case "literal":
      return `<code>${renderChildren(node, depth)}</code>`;
    case "literal_block":
      return `<pre><code>${escapeHtml(node.value ?? renderChildren(node, depth))}</code></pre>`;
    case "reference": {
      const text = renderChildren(node, depth);
      return `<a href="#">${text}</a>`;
    }
    case "bullet_list":
      return `<ul>${renderChildren(node, depth)}</ul>`;
    case "enumerated_list":
      return `<ol>${renderChildren(node, depth)}</ol>`;
    case "list_item":
      return `<li>${renderChildren(node, depth)}</li>`;
    case "transition":
      return `<hr/>`;
    default:
      return renderChildren(node, depth);
  }
}

function renderHeading(node: RstNode, depth: number): string {
  const level = Math.min(Math.max(depth, 1), 6);
  return `<h${level}>${renderChildren(node, depth)}</h${level}>`;
}

/**
 * Converter: reStructuredText → Markdown.
 * Parses RST to an AST, renders a small HTML subset, then reuses the shared
 * Turndown pipeline. RST is supported partially.
 */
export const rstToMarkdown: Converter = async (input) => {
  const text = input.toString("utf-8");
  try {
    const parse = restructured.default?.parse ?? restructured.parse;
    const ast = parse(text) as RstNode;
    const html = renderNode(ast, 0);
    const md = htmlStringToMarkdown(html).trim();
    if (!md) throw new Error("empty");
    return {
      content: md + "\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["reStructuredText підтримується частково — можливі неточності."],
    };
  } catch {
    return {
      content: "```rst\n" + text.trim() + "\n```\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Не вдалося обробити reStructuredText — показано як блок коду."],
    };
  }
};
