import { Marked } from "marked";
import hljs from "highlight.js/lib/common";

/** Trimmed github-dark highlight.js theme — inlined for the sandboxed iframe. */
const HLJS_DARK = `
.hljs{color:#c9d1d9;background:#151a24;}
.hljs-comment,.hljs-quote{color:#8b949e;}
.hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-type,.hljs-doctag,.hljs-name{color:#ff7b72;}
.hljs-string,.hljs-attr,.hljs-meta .hljs-string,.hljs-addition{color:#a5d6ff;}
.hljs-number,.hljs-symbol,.hljs-bullet,.hljs-template-variable,.hljs-variable{color:#79c0ff;}
.hljs-title,.hljs-section,.hljs-function .hljs-title{color:#d2a8ff;}
.hljs-built_in,.hljs-builtin-name,.hljs-class .hljs-title{color:#ffa657;}
.hljs-attribute,.hljs-tag{color:#7ee787;}
.hljs-regexp,.hljs-link{color:#a5d6ff;}
.hljs-deletion{color:#ffa198;}
.hljs-emphasis{font-style:italic;}
.hljs-strong{font-weight:600;}
`;

/** Trimmed github-light highlight.js theme. */
const HLJS_LIGHT = `
.hljs{color:#24292e;background:#f6f8fa;}
.hljs-comment,.hljs-quote{color:#6a737d;}
.hljs-keyword,.hljs-selector-tag,.hljs-literal,.hljs-type,.hljs-doctag,.hljs-name{color:#d73a49;}
.hljs-string,.hljs-attr,.hljs-meta .hljs-string,.hljs-addition{color:#032f62;}
.hljs-number,.hljs-symbol,.hljs-bullet,.hljs-template-variable,.hljs-variable{color:#005cc5;}
.hljs-title,.hljs-section,.hljs-function .hljs-title{color:#6f42c1;}
.hljs-built_in,.hljs-builtin-name,.hljs-class .hljs-title{color:#e36209;}
.hljs-attribute,.hljs-tag{color:#22863a;}
.hljs-regexp,.hljs-link{color:#032f62;}
.hljs-deletion{color:#b31d28;}
.hljs-emphasis{font-style:italic;}
.hljs-strong{font-weight:600;}
`;

const PAGE_STYLE = {
  dark: {
    hljs: HLJS_DARK,
    body: "color:#e5e9f0;background:#0c0f17;",
    a: "#3cc5ec",
    border: "#2a2f3a",
    pre: "#151a24",
    inline: "#1d2330",
    th: "#1d2330",
    quote: "#3cc5ec",
    quoteText: "#9aa4b2",
  },
  light: {
    hljs: HLJS_LIGHT,
    body: "color:#0f172a;background:#ffffff;",
    a: "#2563eb",
    border: "#e2e8f0",
    pre: "#f6f8fa",
    inline: "#f1f5f9",
    th: "#f1f5f9",
    quote: "#2563eb",
    quoteText: "#64748b",
  },
} as const;

/** marked instance with highlight.js applied to fenced code blocks. */
const markedHl = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : undefined;
      const html = language
        ? hljs.highlight(text, { language }).value
        : hljs.highlightAuto(text).value;
      return `<pre><code class="hljs language-${language ?? "plaintext"}">${html}</code></pre>`;
    },
  },
});

/**
 * Build sandboxed srcDoc HTML for the rendered Markdown view.
 * Always render inside an iframe with `sandbox=""` — scripts in the produced
 * HTML are never executed, so user-supplied Markdown is safe to render.
 */
export function buildSrcDoc(
  content: string,
  mimeType: string,
  theme: "light" | "dark",
): string {
  if (mimeType === "text/html") return content;
  const body = markedHl.parse(content, { async: false }) as string;
  const t = PAGE_STYLE[theme];
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.7;${t.body}padding:1rem;margin:0;}
  a{color:${t.a};}h1,h2{border-bottom:1px solid ${t.border};padding-bottom:.2em;}
  pre{background:${t.pre};padding:1rem;border-radius:8px;overflow-x:auto;border:1px solid ${t.border};}
  code{font-family:ui-monospace,monospace;}:not(pre)>code{background:${t.inline};padding:.15em .4em;border-radius:4px;}
  pre code{background:none;padding:0;}
  table{border-collapse:collapse;width:100%;}th,td{border:1px solid ${t.border};padding:.5rem .75rem;text-align:left;}
  th{background:${t.th};}blockquote{border-left:3px solid ${t.quote};margin:0;padding-left:1rem;color:${t.quoteText};}
  img{max-width:100%;}
  ${t.hljs}
</style></head><body>${body}</body></html>`;
}
