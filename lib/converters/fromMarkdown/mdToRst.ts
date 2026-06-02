import { marked, type Token, type Tokens } from "marked";
import matter from "gray-matter";
import type { Converter } from "@/types/conversion";

/** Underline characters for heading levels 1–6 (RST convention). */
const HEADING_CHARS = ["=", "-", "~", "^", '"', "+"];

/** Render inline tokens to inline RST markup. */
function inlineRst(tokens: Token[] | undefined): string {
  if (!tokens) return "";
  return tokens
    .map((t) => {
      switch (t.type) {
        case "strong":
          return `**${inlineRst((t as Tokens.Strong).tokens)}**`;
        case "em":
          return `*${inlineRst((t as Tokens.Em).tokens)}*`;
        case "codespan":
          return `\`\`${(t as Tokens.Codespan).text}\`\``;
        case "link": {
          const link = t as Tokens.Link;
          return `\`${inlineRst(link.tokens)} <${link.href}>\`_`;
        }
        case "br":
          return "\n";
        default:
          if ("tokens" in t && t.tokens) return inlineRst(t.tokens as Token[]);
          if ("text" in t && typeof t.text === "string") return t.text;
          return "";
      }
    })
    .join("");
}

/** Indent every line of a block by `spaces`. */
function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");
}

/** Render list items (handles ordered vs bullet). */
function renderList(list: Tokens.List): string {
  const lines: string[] = [];
  let n = typeof list.start === "number" ? list.start : 1;
  for (const item of list.items) {
    const marker = list.ordered ? `${n}. ` : "- ";
    const text = inlineRst(item.tokens).replace(/\n+/g, " ").trim();
    lines.push(`${marker}${text}`);
    n += 1;
  }
  return lines.join("\n");
}

/**
 * Converter: Markdown → reStructuredText.
 * Walks the marked token stream and emits RST headings (underlined),
 * lists, literal blocks, block quotes and transitions.
 */
export const markdownToRst: Converter = async (input) => {
  const { content } = matter(input.toString("utf-8"));
  const tokens = marked.lexer(content);
  const out: string[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const text = inlineRst(token.tokens);
        const char = HEADING_CHARS[Math.min(token.depth - 1, HEADING_CHARS.length - 1)];
        out.push(text, char.repeat(Math.max(text.length, 1)), "");
        break;
      }
      case "paragraph":
        out.push(inlineRst(token.tokens), "");
        break;
      case "list":
        out.push(renderList(token as Tokens.List), "");
        break;
      case "blockquote":
        out.push(indent(inlineRst(token.tokens).trim(), 4), "");
        break;
      case "code": {
        const lang = token.lang ? ` ${token.lang}` : "";
        out.push(lang ? `.. code-block::${lang}` : "::", "");
        out.push(indent(token.text, 4), "");
        break;
      }
      case "hr":
        out.push("----", "");
        break;
      case "space":
        break;
      default:
        if ("text" in token && typeof token.text === "string") out.push(token.text, "");
    }
  }

  return {
    content: out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n",
    mime: "text/x-rst",
    ext: "rst",
  };
};
