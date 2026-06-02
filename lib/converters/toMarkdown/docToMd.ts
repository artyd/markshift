import WordExtractor from "word-extractor";
import type { Converter } from "@/types/conversion";
import { cleanMarkdown } from "@/lib/utils/markdownCleaner";

/**
 * Converter: DOC (Word 97-2003) → Markdown.
 * word-extractor recovers only the text layer; formatting, images and tables
 * are lost. Each non-empty line becomes a paragraph.
 */
export const docToMarkdown: Converter = async (input) => {
  try {
    const extractor = new WordExtractor();
    const doc = await extractor.extract(input);
    const body = doc.getBody() ?? "";

    const paragraphs = body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      return {
        content: "_У документі .doc не знайдено тексту._\n",
        mime: "text/markdown",
        ext: "md",
        warnings: [".doc порожній або має непідтримувану структуру."],
      };
    }

    return {
      content: cleanMarkdown(paragraphs.join("\n\n")),
      mime: "text/markdown",
      ext: "md",
      warnings: [
        "Формат .doc підтримується частково: збережено лише текст (форматування, зображення й таблиці втрачено).",
      ],
    };
  } catch {
    return {
      content: "_Не вдалося прочитати файл .doc._\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Не вдалося розпізнати .doc — можливо, файл пошкоджено або це не Word 97-2003."],
    };
  }
};
