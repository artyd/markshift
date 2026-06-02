import { parse } from "smol-toml";
import type { Converter } from "@/types/conversion";
import { jsonToMarkdown } from "./jsonToMd";

/**
 * Converter: TOML → Markdown.
 * Parses TOML into a plain object and reuses the JSON renderer so the
 * output structure matches jsonToMd / yamlToMd.
 */
export const tomlToMarkdown: Converter = async (input, options, meta) => {
  const text = input.toString("utf-8");
  let parsed: unknown;
  try {
    parsed = parse(text);
  } catch {
    return {
      content: "```toml\n" + text.trim() + "\n```\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Файл не є коректним TOML — показано як блок коду."],
    };
  }
  const asJson = Buffer.from(JSON.stringify(parsed ?? null), "utf-8");
  return jsonToMarkdown(asJson, options, meta);
};
