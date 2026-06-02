import { marked, type Token, type Tokens } from "marked";
import matter from "gray-matter";
import type { Converter } from "@/types/conversion";

/** Recursively flatten inline tokens to plain text. */
function inlineText(tokens: Token[] | undefined): string {
  if (!tokens) return "";
  return tokens
    .map((t) => {
      if ("tokens" in t && t.tokens) return inlineText(t.tokens as Token[]);
      if ("text" in t && typeof t.text === "string") return t.text;
      return "";
    })
    .join("");
}

/** Escape a single value per RFC 4180. */
function escapeField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Render rows of strings into CSV text (CRLF line endings, RFC 4180). */
function rowsToCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeField).join(",")).join("\r\n");
}

/**
 * Converter: Markdown → CSV.
 * Extracts every GFM table; tables are separated by a blank line. If the
 * document contains no tables, returns an empty result plus a warning.
 */
export const markdownToCsv: Converter = async (input) => {
  const { content } = matter(input.toString("utf-8"));
  const tokens = marked.lexer(content);
  const tables = tokens.filter((t): t is Tokens.Table => t.type === "table");

  if (tables.length === 0) {
    return {
      content: "",
      mime: "text/csv",
      ext: "csv",
      warnings: ["У документі немає таблиць — CSV порожній."],
    };
  }

  const blocks = tables.map((table) => {
    const header = table.header.map((c) => inlineText(c.tokens));
    const body = table.rows.map((row) => row.map((c) => inlineText(c.tokens)));
    return rowsToCsv([header, ...body]);
  });

  return {
    content: blocks.join("\r\n\r\n") + "\r\n",
    mime: "text/csv",
    ext: "csv",
    warnings:
      tables.length > 1
        ? [`Знайдено ${tables.length} таблиць — об'єднано в один CSV (порожній рядок між таблицями).`]
        : undefined,
  };
};
