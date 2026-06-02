"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Columns2,
  Copy,
  Download,
  Eye,
  FileText,
  Code2,
  X,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { buildSrcDoc } from "@/lib/utils/markdownSrcDoc";
import { LIMITS } from "@/lib/constants/limits";

type ViewMode = "split" | "raw" | "preview";

export function MarkdownReader() {
  const [raw, setRaw] = useState<string | null>(null);
  const [name, setName] = useState("document.md");
  const [view, setView] = useState<ViewMode>("split");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Defer theme-dependent iframe rendering until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setRaw(String(reader.result ?? ""));
      setName(file.name);
    };
    reader.onerror = () => toast.error("Не вдалося прочитати файл.");
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const code = rejections[0].errors[0]?.code;
        toast.error(
          code === "file-too-large"
            ? `Файл завеликий. Максимум ${LIMITS.MAX_FILE_SIZE / (1024 * 1024)} МБ.`
            : "Підтримуються лише файли .md, .markdown або .txt.",
        );
        return;
      }
      if (accepted[0]) readFile(accepted[0]);
    },
    [readFile],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxSize: LIMITS.MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
    accept: {
      "text/markdown": [".md", ".markdown"],
      "text/plain": [".txt"],
    },
  });

  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const srcDoc = useMemo(
    () => (raw != null && mounted ? buildSrcDoc(raw, "text/markdown", theme) : ""),
    [raw, theme, mounted],
  );
  const lines = useMemo(() => (raw ?? "").split("\n"), [raw]);

  const copy = async () => {
    if (raw == null) return;
    try {
      await navigator.clipboard.writeText(raw);
      toast.success("Скопійовано в буфер обміну");
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  };

  const download = () => {
    if (raw == null) return;
    const blob = new Blob([raw], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.endsWith(".md") ? name : `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Empty state: dropzone + paste box.
  if (raw == null) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div
          {...getRootProps()}
          className={[
            "relative flex min-h-72 cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed bg-card p-10 text-center shadow-sm transition-all duration-200",
            isDragActive
              ? "scale-[1.02] border-primary bg-primary/5 shadow-lg"
              : "border-border hover:border-primary/60 hover:bg-secondary/40",
          ].join(" ")}
          aria-label="Зона завантаження Markdown"
        >
          <input {...getInputProps()} />
          <motion.div
            animate={isDragActive ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}
            className="flex size-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"
          >
            <UploadCloud className="size-8" />
          </motion.div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? "Відпустіть файл тут" : "Перетягніть .md файл або натисніть"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              .md · .markdown · .txt · до {LIMITS.MAX_FILE_SIZE / (1024 * 1024)} МБ
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
          >
            Обрати файл
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          або вставте текст
          <span className="h-px flex-1 bg-border" />
        </div>

        <textarea
          placeholder="# Вставте свій Markdown тут…"
          onChange={(e) => {
            const v = e.target.value;
            if (v.trim()) {
              setRaw(v);
              setName("paste.md");
            }
          }}
          className="min-h-32 w-full resize-y rounded-2xl border border-border bg-card p-4 font-mono text-sm shadow-sm outline-none focus-visible:border-primary/60"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-5 shrink-0 text-primary" />
          <span className="truncate font-medium" title={name}>
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5">
            <ViewButton active={view === "split"} onClick={() => setView("split")} label="Розділено">
              <Columns2 className="size-4" />
            </ViewButton>
            <ViewButton active={view === "raw"} onClick={() => setView("raw")} label="Код">
              <Code2 className="size-4" />
            </ViewButton>
            <ViewButton active={view === "preview"} onClick={() => setView("preview")} label="Перегляд">
              <Eye className="size-4" />
            </ViewButton>
          </div>
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={download}>
            <Download className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setRaw(null)} aria-label="Закрити">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Panes */}
      <div
        className={
          view === "split"
            ? "grid grid-cols-1 gap-3 lg:grid-cols-2"
            : "grid grid-cols-1 gap-3"
        }
      >
        {(view === "split" || view === "raw") && (
          <ScrollArea className="h-[32rem] rounded-2xl border border-border bg-card">
            <pre className="flex text-sm">
              <code className="select-none border-r border-border px-3 py-3 text-right text-muted-foreground">
                {lines.map((_, i) => (
                  <span key={i} className="block leading-6">
                    {i + 1}
                  </span>
                ))}
              </code>
              <code className="overflow-x-auto px-4 py-3 font-mono leading-6">{raw}</code>
            </pre>
          </ScrollArea>
        )}

        {(view === "split" || view === "preview") && (
          <iframe
            title="Перегляд Markdown"
            srcDoc={srcDoc}
            sandbox=""
            className="h-[32rem] w-full rounded-2xl border border-border bg-card"
          />
        )}
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex size-8 items-center justify-center rounded-md transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
