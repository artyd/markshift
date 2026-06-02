import type { Converter } from "@/types/conversion";
import { cleanMarkdown } from "@/lib/utils/markdownCleaner";

/**
 * Converter: plain text → Markdown.
 * Plain text is already valid Markdown; we only normalise whitespace so
 * paragraphs (blank-line separated) survive intact.
 */
export const txtToMarkdown: Converter = async (input) => {
  const text = input.toString("utf-8");
  return {
    content: cleanMarkdown(text),
    mime: "text/markdown",
    ext: "md",
  };
};
