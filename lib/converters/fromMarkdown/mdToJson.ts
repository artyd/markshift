import { marked, type Token, type Tokens } from "marked";
import matter from "gray-matter";
import type { Converter } from "@/types/conversion";

interface AstNode {
  type: string;
  [key: string]: unknown;
}

/** Recursively flatten inline tokens to plain text. */
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

/** Convert a marked token into a compact, JSON-friendly AST node. */
function toNode(token: Token): AstNode {
  const node: AstNode = { type: token.type };

  switch (token.type) {
    case "heading":
      node.level = token.depth;
      node.text = inlineText(token.tokens);
      break;
    case "paragraph":
    case "text":
      node.text = inlineText("tokens" in token ? token.tokens : undefined) || token.text;
      break;
    case "blockquote":
      node.text = inlineText(token.tokens).trim();
      break;
    case "code":
      node.lang = token.lang || null;
      node.text = token.text;
      break;
    case "list": {
      const list = token as Tokens.List;
      node.ordered = list.ordered;
      node.items = list.items.map((item) => ({
        text: inlineText(item.tokens).replace(/\n+/g, " ").trim(),
        checked: item.task ? Boolean(item.checked) : undefined,
      }));
      break;
    }
    case "table": {
      const table = token as Tokens.Table;
      node.header = table.header.map((c) => inlineText(c.tokens));
      node.rows = table.rows.map((row) => row.map((c) => inlineText(c.tokens)));
      break;
    }
    case "hr":
    case "space":
      break;
    default:
      if ("text" in token && typeof token.text === "string") node.text = token.text;
  }
  return node;
}

/** Converter: Markdown → structured JSON (token AST). */
export const markdownToJson: Converter = async (input) => {
  const { content, data } = matter(input.toString("utf-8"));
  const tokens = marked.lexer(content);
  const ast = tokens.filter((t) => t.type !== "space").map(toNode);

  const doc = {
    frontmatter: Object.keys(data).length ? data : undefined,
    blocks: ast,
  };

  return {
    content: JSON.stringify(doc, null, 2) + "\n",
    mime: "application/json",
    ext: "json",
  };
};
