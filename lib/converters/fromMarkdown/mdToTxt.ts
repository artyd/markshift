import { marked, type Token } from "marked";
import matter from "gray-matter";
import type { Converter } from "@/types/conversion";

/** Recursively flatten inline tokens to their text content. */
function inlineText(tokens: Token[] | undefined): string {
  if (!tokens) return "";
  return tokens
    .map((t) => {
      if ("tokens" in t && t.tokens) return inlineText(t.tokens as Token[]);
      if ("text" in t && typeof t.text === "string") return t.text;
      return "";
    })
    .join("");
}

/**
 * Converter: Markdown → plain text.
 * Strips formatting markers while keeping readable structure (headings,
 * list bullets, paragraph breaks).
 */
export const markdownToTxt: Converter = async (input) => {
  const { content } = matter(input.toString("utf-8"));
  const tokens = marked.lexer(content);
  const out: string[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "heading":
        out.push(inlineText(token.tokens).toUpperCase(), "");
        break;
      case "paragraph":
        out.push(inlineText(token.tokens), "");
        break;
      case "list":
        for (const item of token.items) {
          out.push(`• ${inlineText(item.tokens).replace(/\n+/g, " ").trim()}`);
        }
        out.push("");
        break;
      case "blockquote":
        out.push(`> ${inlineText(token.tokens).trim()}`, "");
        break;
      case "code":
        out.push(token.text, "");
        break;
      case "hr":
        out.push("----------------------------------------", "");
        break;
      case "space":
        break;
      default:
        if ("text" in token && typeof token.text === "string") {
          out.push(token.text, "");
        }
    }
  }

  return {
    content: out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n",
    mime: "text/plain",
    ext: "txt",
  };
};
