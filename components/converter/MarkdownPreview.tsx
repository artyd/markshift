"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Copy, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { buildSrcDoc } from "@/lib/utils/markdownSrcDoc";

interface MarkdownPreviewProps {
  content: string;
  /** MIME type of the produced content; controls how Rendered tab renders. */
  mimeType: string;
  /** Encoding of `content`: "base64" marks a binary output (PDF/DOCX). */
  encoding?: "utf-8" | "base64";
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
