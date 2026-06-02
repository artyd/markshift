import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import type { Converter } from "@/types/conversion";
import { cleanMarkdown } from "@/lib/utils/markdownCleaner";
import { rowsToMarkdownTable } from "@/lib/utils/markdownTable";

/** A preserveOrder node: one tag key → child array, plus optional ":@" attrs. */
type OdtNode = Record<string, unknown> & { ":@"?: Record<string, string> };

/** Return the element tag name of a preserveOrder node (skips ":@"/"#text"). */
function tagOf(node: OdtNode): string | null {
  for (const key of Object.keys(node)) {
    if (key !== ":@" && key !== "#text") return key;
  }
  return null;
}

/** Recursively collect inline text from a node's subtree. */
function inlineText(nodes: OdtNode[]): string {
  let out = "";
  for (const node of nodes) {
    if ("#text" in node) {
      out += String(node["#text"]);
      continue;
    }
    const tag = tagOf(node);
    if (!tag) continue;
    const children = (node[tag] as OdtNode[]) ?? [];
    if (tag === "text:line-break") out += "\n";
    else if (tag === "text:tab") out += " ";
    else if (tag === "text:s") out += " ";
    else out += inlineText(children);
  }
  return out;
}

/** Render an ODT list (and nested lists) as Markdown bullets. */
function renderList(items: OdtNode[], depth: number): string[] {
  const lines: string[] = [];
  const indent = "  ".repeat(depth);
  for (const item of items) {
    if (tagOf(item) !== "text:list-item") continue;
    const children = (item["text:list-item"] as OdtNode[]) ?? [];
    const text = children
      .filter((c) => tagOf(c) === "text:p" || tagOf(c) === "text:h")
      .map((c) => inlineText((c[tagOf(c)!] as OdtNode[]) ?? []).trim())
      .filter(Boolean)
      .join(" ");
    if (text) lines.push(`${indent}- ${text}`);
    for (const c of children) {
      if (tagOf(c) === "text:list") {
        lines.push(...renderList((c["text:list"] as OdtNode[]) ?? [], depth + 1));
      }
    }
  }
  return lines;
}

/** Render an ODT table to a GFM table. */
function renderTable(rows: OdtNode[]): string {
  const out: string[][] = [];
  for (const row of rows) {
    if (tagOf(row) !== "table:table-row") continue;
    const cells = ((row["table:table-row"] as OdtNode[]) ?? [])
      .filter((c) => tagOf(c) === "table:table-cell")
      .map((c) => inlineText((c["table:table-cell"] as OdtNode[]) ?? []).replace(/\n+/g, " ").trim());
    out.push(cells);
  }
  return rowsToMarkdownTable(out);
}

/** Walk the office:text body and emit Markdown blocks. */
function walkBody(nodes: OdtNode[]): string[] {
  const blocks: string[] = [];
  for (const node of nodes) {
    const tag = tagOf(node);
    if (!tag) continue;
    const children = (node[tag] as OdtNode[]) ?? [];

    if (tag === "text:h") {
      const level = Number(node[":@"]?.["@_text:outline-level"] ?? 1);
      const text = inlineText(children).trim();
      if (text) blocks.push(`${"#".repeat(Math.min(Math.max(level, 1), 6))} ${text}`);
    } else if (tag === "text:p") {
      const text = inlineText(children).trim();
      if (text) blocks.push(text);
    } else if (tag === "text:list") {
      const lines = renderList(children, 0);
      if (lines.length) blocks.push(lines.join("\n"));
    } else if (tag === "table:table") {
      const table = renderTable(children);
      if (table) blocks.push(table);
    } else if (tag === "text:section") {
      blocks.push(...walkBody(children));
    }
  }
  return blocks;
}

/**
 * Converter: ODT (OpenDocument Text) → Markdown.
 * Reads content.xml from the ODF package and walks headings, paragraphs,
 * lists and tables in document order.
 */
export const odtToMarkdown: Converter = async (input) => {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(input);
  } catch {
    return {
      content: "_Не вдалося відкрити ODT (пошкоджений або не zip-архів)._\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["ODT не є валідним zip-архівом."],
    };
  }

  const contentFile = zip.file("content.xml");
  if (!contentFile) {
    return {
      content: "_У ODT відсутній content.xml._\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Структура ODT некоректна (немає content.xml)."],
    };
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    preserveOrder: true,
    trimValues: false,
  });
  const tree = parser.parse(await contentFile.async("string")) as OdtNode[];

  // Drill down: document-content → body → text.
  const findChild = (nodes: OdtNode[], tag: string): OdtNode[] => {
    for (const node of nodes) {
      if (tagOf(node) === tag) return (node[tag] as OdtNode[]) ?? [];
    }
    return [];
  };
  const docContent = findChild(tree, "office:document-content");
  const body = findChild(docContent, "office:body");
  const text = findChild(body, "office:text");

  const blocks = walkBody(text);
  if (blocks.length === 0) {
    return {
      content: "_У документі ODT не знайдено тексту._\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["ODT порожній або має непідтримувану структуру."],
    };
  }

  return {
    content: cleanMarkdown(blocks.join("\n\n")),
    mime: "text/markdown",
    ext: "md",
  };
};
