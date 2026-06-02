import Asciidoctor from "asciidoctor";
import type { Converter } from "@/types/conversion";
import { htmlStringToMarkdown } from "./htmlToMd";

/**
 * Converter: AsciiDoc → Markdown.
 * Renders AsciiDoc to HTML5 via Asciidoctor.js, then reuses the shared
 * Turndown pipeline.
 */
export const adocToMarkdown: Converter = async (input) => {
  const text = input.toString("utf-8");
  try {
    const processor = Asciidoctor();
    const html = processor.convert(text, { standalone: false }) as string;
    const md = htmlStringToMarkdown(html).trim();
    if (!md) {
      return {
        content: "_У AsciiDoc не знайдено вмісту._\n",
        mime: "text/markdown",
        ext: "md",
        warnings: ["AsciiDoc порожній."],
      };
    }
    return {
      content: md + "\n",
      mime: "text/markdown",
      ext: "md",
    };
  } catch {
    return {
      content: "```asciidoc\n" + text.trim() + "\n```\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Не вдалося обробити AsciiDoc — показано як блок коду."],
    };
  }
};
