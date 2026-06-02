import { parse } from "@unified-latex/unified-latex-util-parse";
import { convertToHtml } from "@unified-latex/unified-latex-to-hast";
import type { Converter } from "@/types/conversion";
import { htmlStringToMarkdown } from "./htmlToMd";

/**
 * Converter: LaTeX → Markdown.
 * Parses LaTeX to an AST and renders it to HTML, then reuses the shared
 * Turndown pipeline. Macro support is partial; complex documents fall back
 * to a fenced code block.
 */
export const texToMarkdown: Converter = async (input) => {
  const text = input.toString("utf-8");
  try {
    const ast = parse(text);
    const html = convertToHtml(ast);
    const md = htmlStringToMarkdown(html).trim();
    if (!md) throw new Error("empty");
    return {
      content: md + "\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["LaTeX підтримується частково — складні макроси можуть бути втрачені."],
    };
  } catch {
    return {
      content: "```latex\n" + text.trim() + "\n```\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Не вдалося обробити LaTeX — показано як блок коду."],
    };
  }
};
