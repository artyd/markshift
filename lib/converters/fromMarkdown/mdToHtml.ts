import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import matter from "gray-matter";
import type { Converter } from "@/types/conversion";
import { getBaseName } from "@/lib/utils/fileDetector";

/** Allowlist covering everything `marked` (GFM) emits, incl. task-list checkboxes. */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "blockquote", "pre", "code", "hr", "br",
    "ul", "ol", "li", "input",
    "table", "thead", "tbody", "tr", "th", "td",
    "a", "img", "em", "strong", "del", "sup", "sub", "span", "div",
  ],
  allowedAttributes: {
    a: ["href", "title"],
    img: ["src", "alt", "title"],
    th: ["align"],
    td: ["align"],
    input: ["type", "checked", "disabled"],
    code: ["class"],
    span: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "data"],
};

/** Wrap rendered body HTML in a standalone, styled document. */
function wrapDocument(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.7;
    max-width: 820px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; }
  pre { background: #f4f4f5; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  code { font-family: ui-monospace, SFMono-Regular, monospace; }
  pre code { background: none; padding: 0; }
  :not(pre) > code { background: #f4f4f5; padding: .15em .4em; border-radius: 4px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: .5rem .75rem; text-align: left; }
  th { background: #f4f4f5; }
  blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 1rem; color: #555; }
  img { max-width: 100%; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

/** Render Markdown to sanitized body HTML (used by the live preview too). */
export function markdownToHtmlBody(markdown: string): string {
  const { content } = matter(markdown);
  const raw = marked.parse(content, { async: false, gfm: true, breaks: false }) as string;
  return sanitizeHtml(raw, SANITIZE_OPTIONS);
}

/** Converter: Markdown → standalone HTML document. */
export const markdownToHtml: Converter = async (input, _options, meta) => {
  const markdown = input.toString("utf-8");
  const body = markdownToHtmlBody(markdown);
  const html = wrapDocument(getBaseName(meta.filename) || "Документ", body);
  return { content: html, mime: "text/html", ext: "html" };
};
