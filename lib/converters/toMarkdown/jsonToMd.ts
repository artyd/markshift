import type { Converter } from "@/types/conversion";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** Render a JSON value as nested Markdown headings, lists and code blocks. */
function render(value: Json, depth: number): string {
  if (value === null) return "_null_";
  if (typeof value !== "object") {
    return typeof value === "string" ? value : `\`${String(value)}\``;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "_(порожній масив)_";
    // Array of primitives → bullet list; array of objects → repeated blocks.
    return value
      .map((item) => {
        if (item !== null && typeof item === "object") {
          return render(item, depth + 1);
        }
        return `- ${render(item, depth + 1)}`;
      })
      .join("\n");
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return "_(порожній об'єкт)_";
  const hLevel = Math.min(depth + 1, 6);
  return entries
    .map(([key, val]) => {
      if (val !== null && typeof val === "object") {
        return `${"#".repeat(hLevel)} ${key}\n\n${render(val, depth + 1)}`;
      }
      return `- **${key}:** ${render(val, depth + 1)}`;
    })
    .join("\n");
}

/** Converter: JSON → formatted Markdown outline. */
export const jsonToMarkdown: Converter = async (input) => {
  const text = input.toString("utf-8");
  let parsed: Json;
  try {
    parsed = JSON.parse(text) as Json;
  } catch {
    // Not valid JSON — fall back to a fenced code block.
    return {
      content: "```json\n" + text.trim() + "\n```\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Файл не є коректним JSON — показано як блок коду."],
    };
  }
  return {
    content: render(parsed, 0).trim() + "\n",
    mime: "text/markdown",
    ext: "md",
  };
};
