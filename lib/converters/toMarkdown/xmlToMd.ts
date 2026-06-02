import { XMLParser } from "fast-xml-parser";
import type { Converter } from "@/types/conversion";
import { jsonToMarkdown } from "./jsonToMd";

/**
 * Converter: XML → Markdown.
 * Parses XML into a plain object (attributes prefixed with @_) and reuses the
 * JSON renderer so the output structure matches jsonToMd.
 */
export const xmlToMarkdown: Converter = async (input, options, meta) => {
  const text = input.toString("utf-8");
  let parsed: unknown;
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      ignoreDeclaration: true,
      ignorePiTags: true,
      trimValues: true,
    });
    parsed = parser.parse(text);
  } catch {
    return {
      content: "```xml\n" + text.trim() + "\n```\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Файл не є коректним XML — показано як блок коду."],
    };
  }
  const asJson = Buffer.from(JSON.stringify(parsed ?? null), "utf-8");
  return jsonToMarkdown(asJson, options, meta);
};
