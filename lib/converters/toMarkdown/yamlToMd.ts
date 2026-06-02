import yaml from "js-yaml";
import type { Converter } from "@/types/conversion";
import { jsonToMarkdown } from "./jsonToMd";

/**
 * Converter: YAML → Markdown.
 * Parses YAML into a plain object and reuses the JSON renderer so the
 * output structure matches jsonToMd.
 */
export const yamlToMarkdown: Converter = async (input, options, meta) => {
  const text = input.toString("utf-8");
  let parsed: unknown;
  try {
    parsed = yaml.load(text);
  } catch {
    return {
      content: "```yaml\n" + text.trim() + "\n```\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Файл не є коректним YAML — показано як блок коду."],
    };
  }
  // Re-encode as JSON and delegate to the JSON renderer.
  const asJson = Buffer.from(JSON.stringify(parsed ?? null), "utf-8");
  return jsonToMarkdown(asJson, options, meta);
};
