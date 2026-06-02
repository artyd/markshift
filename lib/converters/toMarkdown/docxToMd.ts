import mammoth from "mammoth";
import type { Converter } from "@/types/conversion";
import { htmlStringToMarkdown } from "./htmlToMd";
import { buildFrontmatter } from "@/lib/utils/markdownCleaner";
import { getBaseName } from "@/lib/utils/fileDetector";

/**
 * Converter: DOCX → Markdown.
 * Uses Mammoth to extract semantic HTML (preserving headings, lists,
 * tables and emphasis) then Turndown to produce GFM Markdown.
 */
export const docxToMarkdown: Converter = async (input, options, meta) => {
  const { value: html, messages } = await mammoth.convertToHtml({ buffer: input });
  let markdown = htmlStringToMarkdown(html);

  if (options.includeMetadata) {
    const frontmatter = buildFrontmatter({
      title: getBaseName(meta.filename),
      source: "docx",
      converted: new Date().toISOString().slice(0, 10),
    });
    markdown = frontmatter + markdown;
  }

  const warnings = messages
    .filter((m) => m.type === "warning")
    .slice(0, 5)
    .map((m) => m.message);

  return {
    content: markdown,
    mime: "text/markdown",
    ext: "md",
    warnings: warnings.length ? warnings : undefined,
  };
};
