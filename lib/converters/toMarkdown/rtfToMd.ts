import rtfToHTML from "@iarna/rtf-to-html";
import type { Converter } from "@/types/conversion";
import { htmlStringToMarkdown } from "./htmlToMd";

/** Promisified @iarna/rtf-to-html fromString. */
function rtfToHtml(rtf: string): Promise<string> {
  return new Promise((resolve, reject) => {
    rtfToHTML.fromString(rtf, (err, html) => {
      if (err) reject(err);
      else resolve(html);
    });
  });
}

/**
 * Converter: RTF → Markdown.
 * Renders RTF to HTML first, then reuses the shared Turndown pipeline.
 * Accuracy is partial — RTF is a complex legacy format.
 */
export const rtfToMarkdown: Converter = async (input) => {
  const text = input.toString("utf-8");
  try {
    const html = await rtfToHtml(text);
    const md = htmlStringToMarkdown(html).trim();
    if (!md) {
      return {
        content: "_У RTF не знайдено тексту._\n",
        mime: "text/markdown",
        ext: "md",
        warnings: ["RTF порожній або не містить тексту."],
      };
    }
    return {
      content: md + "\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Формат RTF підтримується частково — можливі неточності форматування."],
    };
  } catch {
    return {
      content: "```rtf\n" + text.trim() + "\n```\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Не вдалося розпізнати RTF — показано як блок коду."],
    };
  }
};
