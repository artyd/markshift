"use client";

import { useMemo, useState } from "react";
import { Marked } from "marked";
import hljs from "highlight.js/lib/common";
import { useTheme } from "next-themes";
import { Check, Copy, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface MarkdownPreviewProps {
  content: string;
  /** MIME type of the produced content; controls how Rendered tab renders. */
  mimeType: string;
  /** Encoding of `content`: "base64" marks a binary output (PDF/DOCX). */
  encoding?: "utf-8" | "base64";
}

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

/** Build sandboxed srcDoc HTML for the Rendered tab. */
function buildSrcDoc(
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

export function MarkdownPreview({ content, mimeType, encoding = "utf-8" }: MarkdownPreviewProps) {
  const isBinary = encoding === "base64";

  // Binary outputs cannot be rendered as Markdown/text.
  if (isBinary) {
    if (mimeType === "application/pdf") {
      return (
        <div className="mt-1">
          <iframe
            title="Перегляд PDF"
            src={`data:application/pdf;base64,${content}`}
            className="h-[32rem] w-full rounded-xl border border-border bg-card"
          />
        </div>
      );
    }
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-center">
        <FileText className="size-10 text-muted-foreground" />
        <p className="font-medium">Попередній перегляд недоступний</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Завантажте файл, щоб відкрити його у відповідній програмі.
        </p>
      </div>
    );
  }

  return <TextPreview content={content} mimeType={mimeType} />;
}

function TextPreview({ content, mimeType }: { content: string; mimeType: string }) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const srcDoc = useMemo(
    () => buildSrcDoc(content, mimeType, theme),
    [content, mimeType, theme],
  );
  const lines = useMemo(() => content.split("\n"), [content]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Скопійовано в буфер обміну");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  };

  return (
    <Tabs defaultValue="rendered" className="w-full">
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="rendered">Перегляд</TabsTrigger>
          <TabsTrigger value="raw">Код</TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          Копіювати
        </Button>
      </div>

      <TabsContent value="rendered" className="mt-3">
        <iframe
          title="Перегляд результату"
          srcDoc={srcDoc}
          sandbox=""
          className="h-96 w-full rounded-xl border border-border bg-card"
        />
      </TabsContent>

      <TabsContent value="raw" className="mt-3">
        <ScrollArea className="h-96 rounded-xl border border-border bg-card">
          <pre className="flex text-sm">
            <code className="select-none border-r border-border px-3 py-3 text-right text-muted-foreground">
              {lines.map((_, i) => (
                <span key={i} className="block leading-6">
                  {i + 1}
                </span>
              ))}
            </code>
            <code className="overflow-x-auto px-4 py-3 font-mono leading-6">
              {content}
            </code>
          </pre>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
