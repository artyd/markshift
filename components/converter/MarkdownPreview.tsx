"use client";

import { useMemo, useState } from "react";
import { Marked } from "marked";
import hljs from "highlight.js/lib/common";
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
const HLJS_THEME = `
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
function buildSrcDoc(content: string, mimeType: string): string {
  if (mimeType === "text/html") return content;
  const body = markedHl.parse(content, { async: false }) as string;
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.7;color:#e5e9f0;background:#0c0f17;padding:1rem;margin:0;}
  a{color:#3cc5ec;}h1,h2{border-bottom:1px solid #2a2f3a;padding-bottom:.2em;}
  pre{background:#151a24;padding:1rem;border-radius:8px;overflow-x:auto;border:1px solid #2a2f3a;}
  code{font-family:ui-monospace,monospace;}:not(pre)>code{background:#1d2330;padding:.15em .4em;border-radius:4px;}
  pre code{background:none;padding:0;}
  table{border-collapse:collapse;width:100%;}th,td{border:1px solid #2a2f3a;padding:.5rem .75rem;text-align:left;}
  th{background:#1d2330;}blockquote{border-left:3px solid #3cc5ec;margin:0;padding-left:1rem;color:#9aa4b2;}
  img{max-width:100%;}
  ${HLJS_THEME}
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
  const srcDoc = useMemo(() => buildSrcDoc(content, mimeType), [content, mimeType]);
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
